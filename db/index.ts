import { type Db, MongoClient, type MongoClientOptions } from 'mongodb';

const { MONGODB_URI, MONGODB_DB } = process.env;

interface mongo {
  conn: { client: MongoClient; db: Db } | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

export let cached: mongo = { conn: null, promise: null };

// Function to reset cache for testing
export function resetCache() {
  cached = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: MongoClientOptions = {};

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then(async (client) => {
      const db = client.db(MONGODB_DB);

      // Create indexes
      await db.collection('posts').createIndex({ url: 1 }, { unique: true });
      // Full-text search over normalized+tokenized post text.
      // `default_language: 'none'` disables English stemming/stopword removal
      // so our own tokens (CJK bi-grams, mixed-script) survive intact.
      await db
        .collection('posts')
        .createIndex(
          { search_tokens: 'text' },
          { name: 'posts_search_tokens_text', default_language: 'none' }
        );
      // Recency index for all "latest posts" queries (getLatest24hPosts, etc.)
      await db.collection('posts').createIndex({ added_at: -1 });
      // Compound index for category-filtered recency queries.
      // Also accelerates distinct('category') operations.
      await db.collection('posts').createIndex({ category: 1, added_at: -1 });
      // Compound index for tag-filtered recency queries.
      await db.collection('posts').createIndex({ tag: 1, added_at: -1 });
      await db.collection('domains').createIndex({ domain: 1 }, { unique: false });
      // Compound index for domain frequency aggregation pipeline.
      await db.collection('domains').createIndex({ domain: 1, category: 1 });

      return {
        client,
        db,
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
