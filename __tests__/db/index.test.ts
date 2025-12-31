import { MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { connectToDatabase } from '../../db';

describe('データベース接続', () => {
  let testClient: MongoClient;

  beforeAll(async () => {
    testClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await testClient.connect();
  });

  afterAll(async () => {
    if (testClient) {
      await testClient.close();
    }
  });

  describe('環境変数の検証', () => {
    it('MONGODB_URI環境変数が設定されていること', () => {
      expect(process.env.MONGODB_URI).toBeDefined();
      expect(process.env.MONGODB_URI).not.toBe('');
    });

    it('MONGODB_DB環境変数が設定されていること', () => {
      expect(process.env.MONGODB_DB).toBeDefined();
      expect(process.env.MONGODB_DB).not.toBe('');
    });
  });

  describe('connectToDatabase', () => {
    it('データベースに正常に接続できること', async () => {
      const result = await connectToDatabase();

      expect(result).toBeDefined();
      expect(result.client).toBeDefined();
      expect(result.db).toBeDefined();
    });

    it('正しい名前のデータベースを返すこと', async () => {
      const result = await connectToDatabase();

      expect(result.db.databaseName).toBe(process.env.MONGODB_DB);
    });

    it('posts.urlにユニークインデックスを作成すること', async () => {
      const result = await connectToDatabase();
      const indexes = await result.db.collection('posts').indexes();

      const urlIndex = indexes.find((idx) => idx.key.url === 1);
      expect(urlIndex).toBeDefined();
      expect(urlIndex?.unique).toBe(true);
    });

    it('domains.domainに非ユニークインデックスを作成すること', async () => {
      const result = await connectToDatabase();
      const indexes = await result.db.collection('domains').indexes();

      const domainIndex = indexes.find((idx) => idx.key.domain === 1);
      expect(domainIndex).toBeDefined();
      // MongoDB doesn't explicitly set unique: false, so it will be undefined or false
      expect(domainIndex?.unique).toBeFalsy();
    });

    it('後続の呼び出しでキャッシュされた接続を使用すること', async () => {
      const result1 = await connectToDatabase();
      const result2 = await connectToDatabase();

      expect(result1.client).toBe(result2.client);
      expect(result1.db).toBe(result2.db);
    });

    it('データベース操作を実行できること', async () => {
      const { db } = await connectToDatabase();

      const testDoc = { test: 'data', timestamp: new Date() };
      const result = await db.collection('test').insertOne(testDoc);

      expect(result.insertedId).toBeDefined();

      await db.collection('test').deleteOne({ _id: result.insertedId });
    });
  });

  describe('データベース操作', () => {
    it('postsコレクションを作成できること', async () => {
      const { db } = await connectToDatabase();

      const collections = await db.listCollections({ name: 'posts' }).toArray();

      // Collection might not exist yet, but should be creatable
      await db.collection('posts').insertOne({
        title: 'Test',
        url: 'https://test.example.com/unique-test-url',
        category: 'test',
        added_at: new Date(),
      });

      const count = await db.collection('posts').countDocuments({ category: 'test' });
      expect(count).toBeGreaterThanOrEqual(1);

      await db.collection('posts').deleteMany({ category: 'test' });
    });

    it('domainsコレクションを作成できること', async () => {
      const { db } = await connectToDatabase();

      await db.collection('domains').insertOne({
        domain: 'test.example.com',
        category: 'test',
        added_at: new Date(),
      });

      const count = await db.collection('domains').countDocuments({ category: 'test' });
      expect(count).toBeGreaterThanOrEqual(1);

      await db.collection('domains').deleteMany({ category: 'test' });
    });

    it('posts.urlのユニーク制約を強制すること', async () => {
      const { db } = await connectToDatabase();
      const testUrl = `https://test.example.com/unique-${Date.now()}`;

      const doc = {
        title: 'Test Unique',
        url: testUrl,
        category: 'test',
        added_at: new Date(),
      };

      await db.collection('posts').insertOne(doc);

      await expect(db.collection('posts').insertOne(doc)).rejects.toThrow();

      await db.collection('posts').deleteMany({ url: testUrl });
    });

    it('同じドメイン名を持つ複数のドメインを許可すること', async () => {
      const { db } = await connectToDatabase();
      const testDomain = 'test-multiple.example.com';

      const docs = [
        { domain: testDomain, category: 'tech', added_at: new Date() },
        { domain: testDomain, category: 'news', added_at: new Date() },
        { domain: testDomain, category: 'tech', added_at: new Date() },
      ];

      await db.collection('domains').insertMany(docs);

      const count = await db.collection('domains').countDocuments({ domain: testDomain });
      expect(count).toBeGreaterThanOrEqual(3);

      await db.collection('domains').deleteMany({ domain: testDomain });
    });
  });

  describe('接続のキャッシュ動作', () => {
    it('複数の呼び出しで接続を再利用すること', async () => {
      const connections = await Promise.all([
        connectToDatabase(),
        connectToDatabase(),
        connectToDatabase(),
      ]);

      expect(connections[0].client).toBe(connections[1].client);
      expect(connections[1].client).toBe(connections[2].client);
    });
  });

  describe('データベースクエリ', () => {
    it('集約パイプラインをサポートすること', async () => {
      const { db } = await connectToDatabase();
      const testDomain = `aggregate-test-${Date.now()}.com`;

      await db.collection('domains').insertMany([
        { domain: testDomain, category: 'tech', added_at: new Date() },
        { domain: testDomain, category: 'tech', added_at: new Date() },
        { domain: testDomain, category: 'news', added_at: new Date() },
      ]);

      const results = await db
        .collection('domains')
        .aggregate([
          { $match: { domain: testDomain } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      expect(results).toHaveLength(2);
      expect(results[0]._id).toBe('tech');
      expect(results[0].count).toBe(2);

      await db.collection('domains').deleteMany({ domain: testDomain });
    });

    it('distinct クエリをサポートすること', async () => {
      const { db } = await connectToDatabase();

      await db.collection('posts').insertMany([
        {
          title: 'Test 1',
          url: `https://test.com/${Date.now()}-1`,
          category: 'test-cat-1',
          added_at: new Date(),
        },
        {
          title: 'Test 2',
          url: `https://test.com/${Date.now()}-2`,
          category: 'test-cat-2',
          added_at: new Date(),
        },
        {
          title: 'Test 3',
          url: `https://test.com/${Date.now()}-3`,
          category: 'test-cat-1',
          added_at: new Date(),
        },
      ]);

      const categories = await db.collection('posts').distinct('category', {
        category: { $regex: /^test-cat-/ },
      });

      expect(categories).toHaveLength(2);
      expect(categories).toContain('test-cat-1');
      expect(categories).toContain('test-cat-2');

      await db.collection('posts').deleteMany({ category: { $regex: /^test-cat-/ } });
    });

    it('ソートと制限を含む複雑な検索クエリをサポートすること', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      await db.collection('posts').insertMany([
        {
          title: 'Test 1',
          url: `https://test.com/complex-${Date.now()}-1`,
          category: 'test-complex',
          added_at: new Date(now.getTime() - 3000),
        },
        {
          title: 'Test 2',
          url: `https://test.com/complex-${Date.now()}-2`,
          category: 'test-complex',
          added_at: new Date(now.getTime() - 2000),
        },
        {
          title: 'Test 3',
          url: `https://test.com/complex-${Date.now()}-3`,
          category: 'test-complex',
          added_at: new Date(now.getTime() - 1000),
        },
      ]);

      const results = await db
        .collection('posts')
        .find({ category: 'test-complex' })
        .sort({ added_at: -1 })
        .limit(2)
        .toArray();

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Test 3');
      expect(results[1].title).toBe('Test 2');

      await db.collection('posts').deleteMany({ category: 'test-complex' });
    });
  });

  describe('エッジケース', () => {
    it('空のコレクションを処理できること', async () => {
      const { db } = await connectToDatabase();

      await db.collection('posts').deleteMany({ category: 'non-existent-category' });

      const count = await db
        .collection('posts')
        .countDocuments({ category: 'non-existent-category' });
      expect(count).toBe(0);
    });

    it('大規模なバッチ操作を処理できること', async () => {
      const { db } = await connectToDatabase();
      const batchSize = 100;
      const timestamp = Date.now();

      const docs = Array.from({ length: batchSize }, (_, i) => ({
        domain: `batch-test-${timestamp}.com`,
        category: 'batch-test',
        added_at: new Date(),
        index: i,
      }));

      const result = await db.collection('domains').insertMany(docs);
      expect(Object.keys(result.insertedIds).length).toBe(batchSize);

      const count = await db
        .collection('domains')
        .countDocuments({ domain: `batch-test-${timestamp}.com` });
      expect(count).toBe(batchSize);

      await db.collection('domains').deleteMany({ domain: `batch-test-${timestamp}.com` });
    });
  });
});
