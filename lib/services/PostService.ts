import { type Document, type Filter, ObjectId, type WithId } from 'mongodb';
import type { DisplayPostData, InsertPostData } from '../../@types/PostData';
import { connectToDatabase } from '../../db';
import { categoriesCache, latestPostsCache, searchCache, tagsCache } from '../cache';
import { composeSearchText, tokenizeForIndex } from '../search';

/**
 * Escape special characters in a string for use in a regular expression
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build the non-keyword portion of a search filter (category + url).
 */
function buildBaseFilter(category: string, url: string): Filter<WithId<Document>> {
  const base: Filter<WithId<Document>> = {};
  if (category && category !== '') {
    base.category = category;
  }
  if (url && url !== '') {
    base.url = { $regex: new RegExp(escapeRegExp(url), 'i') };
  }
  return base;
}

/**
 * Original regex-based keyword search. Kept as a fallback for cases where
 * the text index returns no hits (queries composed of characters that don't
 * make it through tokenization, or documents that have not yet been
 * backfilled with `search_tokens`).
 */
async function legacySearchByRegex(
  keyword: string,
  base: Filter<WithId<Document>>,
  limit: number
): Promise<WithId<Document>[]> {
  const { db } = await connectToDatabase();

  const conditions: Filter<WithId<Document>>[] = [];
  if (Object.keys(base).length > 0) {
    conditions.push(base);
  }

  const keywordList = keyword.split(/\s+/).filter((word) => word.length > 0);
  const keywordQueries: Filter<WithId<Document>>[] = keywordList.map((word) => {
    const escapedWord = escapeRegExp(word);
    const keywordRegexp = new RegExp(escapedWord, 'i');
    return {
      $or: [{ title: { $regex: keywordRegexp } }, { description: { $regex: keywordRegexp } }],
    };
  });
  conditions.push(...keywordQueries);

  const findQuery: Filter<Document> = conditions.length > 0 ? { $and: conditions } : {};

  return db.collection('posts').find(findQuery).sort({ added_at: -1 }).limit(limit).toArray();
}

const DEFAULT_LIMIT = 30;

export type SearchPostsOptions = {
  limit?: number;
  /** When true, skip the text-index path and fall straight back to legacy regex. */
  disableLexical?: boolean;
};

export const PostService = {
  /**
   * Get latest 24 hours posts
   */
  async getLatest24hPosts(): Promise<DisplayPostData[]> {
    const cached = latestPostsCache.get('latest24h');
    if (cached) return cached as DisplayPostData[];

    const { db } = await connectToDatabase();
    const now = new Date();
    const before24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const posts = await db
      .collection('posts')
      .find({
        added_at: {
          $gte: before24h,
          $lt: now,
        },
      })
      .sort({ added_at: -1 })
      .toArray();

    const result = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      added_at: post.added_at.toISOString(),
    })) as DisplayPostData[];
    latestPostsCache.set('latest24h', result);
    return result;
  },

  /**
   * Get latest 7 days posts by category
   */
  async getLatest7dPostsByCategory(category: string): Promise<DisplayPostData[]> {
    const cacheKey = `latest7d:${category}`;
    const cached = latestPostsCache.get(cacheKey);
    if (cached) return cached as DisplayPostData[];

    const { db } = await connectToDatabase();
    const now = new Date();
    const before7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const posts = await db
      .collection('posts')
      .find({
        added_at: {
          $gte: before7d,
          $lt: now,
        },
        category: category,
      })
      .sort({ added_at: -1 })
      .toArray();

    const result = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      added_at: post.added_at.toISOString(),
    })) as DisplayPostData[];
    latestPostsCache.set(cacheKey, result);
    return result;
  },

  /**
   * Search posts by keyword, category, and URL.
   *
   * The keyword path prefers a MongoDB text index over the tokenized
   * `search_tokens` field, ranked by text score. If the text search returns
   * nothing (e.g. because the query normalizes to an empty token set or the
   * document has not been backfilled yet), it transparently falls back to
   * the previous regex-based behavior so that the caller never sees a
   * regression relative to the earlier implementation.
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: 一旦許容する
  async searchPosts(
    keyword: string,
    category: string,
    url: string,
    options: SearchPostsOptions = {}
  ): Promise<DisplayPostData[]> {
    const limit = Math.max(1, Math.min(100, options.limit ?? DEFAULT_LIMIT));
    const cacheKey = `search:${keyword}:${category}:${url}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached) return cached as DisplayPostData[];

    const { db } = await connectToDatabase();
    const base = buildBaseFilter(category, url);
    const hasKeyword = !!(keyword && keyword.trim() !== '');
    const hasBase = Object.keys(base).length > 0;

    // No conditions at all — preserve prior behavior (returns nothing).
    if (!hasKeyword && !hasBase) {
      return [];
    }

    // Only filters, no keyword → recency ordering, same as before.
    if (!hasKeyword) {
      const posts = await db
        .collection('posts')
        .find(base)
        .sort({ added_at: -1 })
        .limit(limit)
        .toArray();
      return posts.map(toDisplay);
    }

    const trimmedKeyword = keyword.trim();
    let candidates: Document[] = [];

    if (!options.disableLexical) {
      const qTokens = tokenizeForIndex(trimmedKeyword, { omitUnigrams: true });
      if (qTokens) {
        const minScore = parseFloat(process.env.SEARCH_MIN_TEXT_SCORE ?? '0.5');

        const pipeline: Document[] = [
          // 1. Text search + base filter
          {
            $match: hasBase
              ? { $and: [base, { $text: { $search: qTokens } }] }
              : { $text: { $search: qTokens } },
          },
          // 2. Project fields + extract text score
          {
            $project: {
              title: 1,
              url: 1,
              category: 1,
              description: 1,
              comment: 1,
              image: 1,
              tag: 1,
              added_at: 1,
              score: { $meta: 'textScore' },
            },
          },
          // 3. Threshold filter (skip if minScore <= 0 to disable)
          ...(minScore > 0 ? [{ $match: { score: { $gte: minScore } } }] : []),
          // 4. Sort by date (descending)
          { $sort: { added_at: -1 } },
          // 5. Limit
          { $limit: limit },
        ];

        candidates = await db.collection('posts').aggregate(pipeline).toArray();
      }
    }

    if (candidates.length === 0) {
      candidates = await legacySearchByRegex(trimmedKeyword, base, limit);
    }

    const result = candidates.map(toDisplay);
    searchCache.set(cacheKey, result);
    return result;
  },

  /**
   * Create a new post
   */
  async createPost(postData: Omit<InsertPostData, 'added_at' | keyof StoredMarker>): Promise<void> {
    const { db } = await connectToDatabase();
    const added_at = new Date();
    const search_text = composeSearchText(postData);
    const search_tokens = tokenizeForIndex(search_text);
    const insertData: InsertPostData = {
      ...postData,
      added_at,
      search_text,
      search_tokens,
      search_indexed_at: added_at,
    };

    await db.collection('posts').insertOne(insertData);

    // Also insert domain data
    const { url, category } = postData;
    const _url = new URL(url);
    const domain = _url.host;

    await db.collection('domains').insertOne({
      domain,
      category,
      added_at,
    });

    // Invalidate reference caches on write
    categoriesCache.invalidate('categories');
    tagsCache.invalidate('tags');
  },

  /**
   * Get post by ID
   */
  async getPostById(id: string): Promise<DisplayPostData | null> {
    const { db } = await connectToDatabase();

    const result = await db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!result) return null;

    return {
      ...result,
      _id: result._id.toString(),
      added_at: result.added_at.toISOString(),
    } as DisplayPostData;
  },

  /**
   * Get latest 24 hours posts by category
   */
  async getLatest24hPostsByCategory(category: string): Promise<DisplayPostData[]> {
    const cacheKey = `latest24hCat:${category}`;
    const cached = latestPostsCache.get(cacheKey);
    if (cached) return cached as DisplayPostData[];

    const { db } = await connectToDatabase();
    const now = new Date();
    const before24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const posts = await db
      .collection('posts')
      .find({
        added_at: {
          $gte: before24h,
          $lt: now,
        },
        category: category,
      })
      .sort({ added_at: -1 })
      .toArray();

    const result = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      added_at: post.added_at.toISOString(),
    })) as DisplayPostData[];
    latestPostsCache.set(cacheKey, result);
    return result;
  },

  /**
   * Get total count of posts for health check
   */
  async getPostCount(): Promise<number> {
    const { db } = await connectToDatabase();
    return await db.collection('posts').countDocuments();
  },
};

// Marker type kept purely as an alias for the storage-side fields so
// `createPost` callers don't accidentally supply pre-computed search fields.
type StoredMarker = Pick<InsertPostData, 'search_text' | 'search_tokens' | 'search_indexed_at'>;

function toDisplay(post: WithId<Document>): DisplayPostData {
  const { score, ...rest } = post as WithId<Document> & { score?: number };
  const display: DisplayPostData = {
    ...(rest as unknown as DisplayPostData),
    _id: post._id.toString(),
    added_at: (post.added_at as Date).toISOString(),
  };
  if (typeof score === 'number') display.score = score;
  return display;
}
