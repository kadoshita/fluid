import { Db, MongoClient, MongoClientOptions } from 'mongodb';

const { MONGODB_URI, MONGODB_DB } = process.env;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

interface mongo {
    conn: { client: MongoClient; db: Db };
    promise: any;
}

export let cached: mongo;

if (!cached) {
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
