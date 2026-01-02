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
      await db.collection('domains').createIndex({ domain: 1 }, { unique: false });

      return {
        client,
        db,
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
