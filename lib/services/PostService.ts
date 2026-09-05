import { type Document, type Filter, ObjectId, type WithId } from 'mongodb';
import type { DisplayPostData, InsertPostData } from '../../@types/PostData';
import { connectToDatabase } from '../../db';
import { categoriesCache, latestPostsCache, searchCache, tagsCache } from '../cache';
import { composeSearchText, type KeywordClause, parseKeyword, tokenizeForIndex } from '../search';

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
 * Case-insensitive "word appears in title or description" condition.
 */
function wordCondition(word: string): Filter<WithId<Document>> {
  const regex = new RegExp(escapeRegExp(word), 'i');
  return {
    $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }],
  };
}

/**
 * Compile parsed keyword clauses into a single filter.
 * Clauses are combined with OR; each AND clause requires both words.
 * e.g. `A B AND C` → `A OR (B AND C)`.
 */
function buildKeywordFilter(clauses: KeywordClause[]): Filter<WithId<Document>> {
  const alternatives = clauses.map((clause) =>
    clause.kind === 'and'
      ? { $and: clause.words.map((word) => wordCondition(word)) }
      : wordCondition(clause.word)
  );
  if (alternatives.length === 1) {
    return alternatives[0];
  }
  return { $or: alternatives };
}

const DEFAULT_LIMIT = 30;

export type SearchPostsOptions = {
  limit?: number;
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
   * Keyword search is a single naive MongoDB query: whitespace-separated
   * words are combined with OR, and the uppercase `AND` operator joins the
   * words immediately before and after it into an AND clause
   * (`A B AND C` → `A OR (B AND C)`; lowercase `and` is an ordinary word).
   * Matching is a case-insensitive substring match on `title` and
   * `description`.
   */
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
    const clauses = parseKeyword(keyword);
    const hasBase = Object.keys(base).length > 0;

    // No conditions at all — preserve prior behavior (returns nothing).
    if (clauses.length === 0 && !hasBase) {
      return [];
    }

    const conditions: Filter<WithId<Document>>[] = [];
    if (hasBase) conditions.push(base);
    if (clauses.length > 0) conditions.push(buildKeywordFilter(clauses));

    const findQuery: Filter<WithId<Document>> =
      conditions.length === 1 ? conditions[0] : { $and: conditions };

    const posts = await db
      .collection('posts')
      .find(findQuery)
      .sort({ added_at: -1 })
      .limit(limit)
      .toArray();

    const result = posts.map(toDisplay);
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
  return {
    ...(post as unknown as DisplayPostData),
    _id: post._id.toString(),
    added_at: (post.added_at as Date).toISOString(),
  };
}
