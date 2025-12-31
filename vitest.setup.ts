import { type Db, MongoClient } from 'mongodb';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { resetCache } from './db/index';

let client: MongoClient | null = null;
let db: Db | null = null;

// Setup environment variables and MongoDB connection
beforeAll(async () => {
  // Use test database
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  process.env.MONGODB_DB = process.env.MONGODB_DB || 'fluid_test';
  process.env.TZ = 'Asia/Tokyo';

  // Connect to MongoDB
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.MONGODB_DB);

  // Ensure the test database is clean at the start
  await db.dropDatabase();
});

// Clean up database before each test to ensure isolation
beforeEach(async () => {
  if (!db) return;

  // Reset the connection cache to avoid stale connections
  resetCache();

  // Get all collections and drop them individually
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    try {
      await db.collection(collection.name).drop();
    } catch (error) {
      // Ignore errors if collection doesn't exist
    }
  }

  // Recreate indexes that are needed for the application
  // These should match the indexes in db/index.ts
  await db.collection('posts').createIndex({ url: 1 }, { unique: true });
  await db.collection('domains').createIndex({ domain: 1 }, { unique: false });
});

// Close MongoDB connection after all tests
afterAll(async () => {
  if (db) {
    try {
      // Clean up test database after all tests
      await db.dropDatabase();
    } catch (error) {
      console.error('Error cleaning up test database:', error);
    }
  }
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
});
