import { beforeEach, describe, expect, it } from 'vitest';
import { connectToDatabase } from '../../../db';
import { CategoryService } from '../../../lib/services/CategoryService';
import { PostService } from '../../../lib/services/PostService';
import { TagService } from '../../../lib/services/TagService';

describe('サービス統合テスト', () => {
  beforeEach(async () => {
    const { db } = await connectToDatabase();
    await db.collection('posts').deleteMany({});
    await db.collection('domains').deleteMany({});
  });

  describe('投稿の作成と取得のワークフロー', () => {
    it('投稿を作成してIDで取得できること', async () => {
      const postData = {
        title: 'Integration Test Post',
        url: 'https://example.com/integration',
        category: 'tech',
        description: 'Test description',
        tag: ['test', 'integration'],
      };

      await PostService.createPost(postData);

      const { db } = await connectToDatabase();
      const posts = await db.collection('posts').find({}).toArray();
      expect(posts).toHaveLength(1);

      const retrievedPost = await PostService.getPostById(posts[0]._id.toString());

      expect(retrievedPost).not.toBeNull();
      expect(retrievedPost!.title).toBe(postData.title);
      expect(retrievedPost!.url).toBe(postData.url);
      expect(retrievedPost!.category).toBe(postData.category);
    });

    it('複数の投稿を作成して24時間以内のクエリで取得できること', async () => {
      const now = new Date();
      const posts = [
        {
          title: 'Post 1',
          url: 'https://example.com/post1',
          category: 'tech',
        },
        {
          title: 'Post 2',
          url: 'https://example.com/post2',
          category: 'news',
        },
      ];

      for (const post of posts) {
        await PostService.createPost(post);
      }

      const latestPosts = await PostService.getLatest24hPosts();

      expect(latestPosts).toHaveLength(2);
      expect(latestPosts.map((p) => p.title).sort()).toEqual(['Post 1', 'Post 2']);
    });
  });

  describe('カテゴリとドメイン頻度のワークフロー', () => {
    it('投稿作成時にドメイン-カテゴリの関連付けを追跡できること', async () => {
      const domain = 'techblog.com';
      const posts = [
        { title: 'Tech 1', url: `https://${domain}/1`, category: 'tech' },
        { title: 'Tech 2', url: `https://${domain}/2`, category: 'tech' },
        { title: 'News 1', url: `https://${domain}/3`, category: 'news' },
      ];

      for (const post of posts) {
        await PostService.createPost(post);
      }

      const { db } = await connectToDatabase();
      const domains = await db.collection('domains').find({ domain }).toArray();

      expect(domains).toHaveLength(3);
      expect(domains.filter((d) => d.category === 'tech')).toHaveLength(2);
      expect(domains.filter((d) => d.category === 'news')).toHaveLength(1);

      const categories = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(categories[0]).toBe('tech');
      expect(categories[1]).toBe('news');
    });

    it('履歴のない新しいドメインを処理できること', async () => {
      const { db } = await connectToDatabase();
      await db.collection('posts').insertMany([
        { title: 'Post 1', url: 'https://example.com/1', category: 'tech', added_at: new Date() },
        { title: 'Post 2', url: 'https://example.com/2', category: 'news', added_at: new Date() },
      ]);

      const categories = await CategoryService.getCategoriesWithDomainFrequency('newsite.com');

      expect(categories[0]).toBe('');
      expect(categories.length).toBeGreaterThan(1);
    });
  });

  describe('タグベースのフィルタリングワークフロー', () => {
    it('タグ付きの投稿を作成してタグで取得できること', async () => {
      const now = new Date();
      const tag = 'javascript';
      const posts = [
        {
          title: 'JS Post 1',
          url: 'https://example.com/js1',
          category: 'tech',
          tag: ['javascript', 'frontend'],
        },
        {
          title: 'JS Post 2',
          url: 'https://example.com/js2',
          category: 'tech',
          tag: ['javascript', 'backend'],
        },
      ];

      for (const post of posts) {
        await PostService.createPost(post);
      }

      const taggedPosts = await TagService.getLatest7dPostsByTag(tag);

      expect(taggedPosts).toHaveLength(2);
      expect(taggedPosts.every((p) => p.tag?.includes(tag))).toBe(true);
    });

    it('システムからすべての一意のタグを取得できること', async () => {
      const { db } = await connectToDatabase();
      await db.collection('posts').insertMany([
        {
          title: 'Post 1',
          url: 'https://example.com/1',
          category: 'tech',
          added_at: new Date(),
          tag: ['javascript', 'typescript'],
        },
        {
          title: 'Post 2',
          url: 'https://example.com/2',
          category: 'tech',
          added_at: new Date(),
          tag: ['react', 'vue'],
        },
        {
          title: 'Post 3',
          url: 'https://example.com/3',
          category: 'tech',
          added_at: new Date(),
          tag: ['javascript', 'python'],
        },
      ]);

      const tags = await TagService.getAllTags();

      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toContain('javascript');
      expect(tags).toContain('typescript');
      expect(tags).toContain('react');
      expect(tags).toContain('vue');
      expect(tags).toContain('python');
    });
  });

  describe('検索ワークフロー', () => {
    it('キーワードで投稿を検索してカテゴリでフィルタリングできること', async () => {
      const posts = [
        {
          title: 'React Tutorial',
          url: 'https://example.com/react',
          category: 'tech',
          description: 'Learn React basics',
          tag: ['react', 'tutorial'],
        },
        {
          title: 'React News',
          url: 'https://example.com/news',
          category: 'news',
          description: 'React updates',
        },
      ];

      for (const post of posts) {
        await PostService.createPost(post);
      }

      const results = await PostService.searchPosts('React', 'tech', '');

      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('tech');
      expect(results[0].title).toBe('React Tutorial');
    });

    it('URLパターンで投稿を検索できること', async () => {
      const posts = [
        {
          title: 'GitHub Post',
          url: 'https://github.com/repo',
          category: 'tech',
          description: 'GitHub repository',
        },
        {
          title: 'Example Post',
          url: 'https://example.com/post',
          category: 'tech',
          description: 'Example post',
        },
      ];

      for (const post of posts) {
        await PostService.createPost(post);
      }

      const results = await PostService.searchPosts('', '', 'github.com');

      expect(results).toHaveLength(1);
      expect(results[0].url).toContain('github.com');
    });
  });

  describe('カテゴリベースの投稿取得', () => {
    it('期間内でカテゴリ別に投稿を取得できること', async () => {
      const now = new Date();
      const category = 'tech';

      const { db } = await connectToDatabase();
      await db.collection('posts').insertMany([
        {
          title: 'Recent Tech Post',
          url: 'https://example.com/tech1',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
        },
        {
          title: 'Recent News Post',
          url: 'https://example.com/news1',
          category: 'news',
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
        },
      ]);

      const posts24h = await PostService.getLatest24hPostsByCategory(category);
      const posts7d = await PostService.getLatest7dPostsByCategory(category);

      expect(posts24h).toHaveLength(1);
      expect(posts24h[0].category).toBe(category);

      expect(posts7d).toHaveLength(1);
      expect(posts7d[0].category).toBe(category);
    });
  });

  describe('ヘルスチェックワークフロー', () => {
    it('監視用に総投稿数を返すこと', async () => {
      const { db } = await connectToDatabase();
      await db.collection('posts').insertMany([
        { title: 'Post 1', url: 'https://example.com/1', category: 'tech', added_at: new Date() },
        { title: 'Post 2', url: 'https://example.com/2', category: 'news', added_at: new Date() },
        { title: 'Post 3', url: 'https://example.com/3', category: 'sports', added_at: new Date() },
      ]);

      const count = await PostService.getPostCount();

      expect(count).toBe(3);
    });

    it('システムに投稿が存在しない場合を検出できること', async () => {
      const count = await PostService.getPostCount();
      expect(count).toBe(0);
    });
  });

  describe('サービス間のデータ整合性', () => {
    it('投稿とカテゴリサービス間でカテゴリの整合性を保つこと', async () => {
      const { db } = await connectToDatabase();
      const categories = ['tech', 'news', 'sports'];

      for (let i = 0; i < categories.length; i++) {
        await db.collection('posts').insertOne({
          title: `Post ${i}`,
          url: `https://example.com/${i}`,
          category: categories[i],
          added_at: new Date(),
        });
      }

      const categoriesFromService = await CategoryService.getAllCategories();

      for (const cat of categories) {
        expect(categoriesFromService).toContain(cat);
      }
    });

    it('投稿とタグサービス間でタグの整合性を保つこと', async () => {
      const { db } = await connectToDatabase();
      const tags = ['javascript', 'typescript', 'react'];

      await db.collection('posts').insertMany([
        {
          title: 'Post 1',
          url: 'https://example.com/1',
          category: 'tech',
          added_at: new Date(),
          tag: ['javascript'],
        },
        {
          title: 'Post 2',
          url: 'https://example.com/2',
          category: 'tech',
          added_at: new Date(),
          tag: ['typescript'],
        },
        {
          title: 'Post 3',
          url: 'https://example.com/3',
          category: 'tech',
          added_at: new Date(),
          tag: ['react'],
        },
      ]);

      const tagsFromService = await TagService.getAllTags();

      for (const tag of tags) {
        expect(tagsFromService).toContain(tag);
      }
    });
  });

  describe('複雑なマルチサービスシナリオ', () => {
    it('投稿の完全なライフサイクルを処理できること：作成、検索、タグでの取得、カウント', async () => {
      const postData = {
        title: 'Full Lifecycle Test',
        url: 'https://example.com/lifecycle',
        category: 'tech',
        description: 'Testing full lifecycle',
        tag: ['test', 'lifecycle'],
      };

      await PostService.createPost(postData);

      const searchResults = await PostService.searchPosts('Lifecycle', 'tech', '');
      expect(searchResults).toHaveLength(1);

      const tagResults = await TagService.getLatest7dPostsByTag('lifecycle');
      expect(tagResults).toHaveLength(1);

      const count = await PostService.getPostCount();
      expect(count).toBe(1);
    });

    it('異なるカテゴリの優先順位を持つ複数のドメインを処理できること', async () => {
      const domain1 = 'tech-focused.com';
      const domain2 = 'news-focused.com';

      const { db } = await connectToDatabase();
      await db.collection('posts').insertMany([
        { title: 'Post 1', url: 'https://example.com/1', category: 'tech', added_at: new Date() },
        { title: 'Post 2', url: 'https://example.com/2', category: 'news', added_at: new Date() },
        { title: 'Post 3', url: 'https://example.com/3', category: 'sports', added_at: new Date() },
      ]);

      await db.collection('domains').insertMany([
        ...Array.from({ length: 10 }, () => ({
          domain: domain1,
          category: 'tech',
          added_at: new Date(),
        })),
        { domain: domain1, category: 'news', added_at: new Date() },
        ...Array.from({ length: 15 }, () => ({
          domain: domain2,
          category: 'news',
          added_at: new Date(),
        })),
        ...Array.from({ length: 2 }, () => ({
          domain: domain2,
          category: 'tech',
          added_at: new Date(),
        })),
      ]);

      const categories1 = await CategoryService.getCategoriesWithDomainFrequency(domain1);
      const categories2 = await CategoryService.getCategoriesWithDomainFrequency(domain2);

      expect(categories1[0]).toBe('tech');
      expect(categories2[0]).toBe('news');
      expect(categories1[0]).not.toBe(categories2[0]);
    });

    it('カテゴリをまたがる重複するタグを持つ投稿を処理できること', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      await db.collection('posts').insertMany([
        {
          title: 'Tech JavaScript',
          url: 'https://example.com/tech-js',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ['javascript', 'programming'],
        },
        {
          title: 'News JavaScript',
          url: 'https://example.com/news-js',
          category: 'news',
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ['javascript', 'announcement'],
        },
      ]);

      const jsPosts = await TagService.getLatest7dPostsByTag('javascript');

      expect(jsPosts).toHaveLength(2);
      expect(jsPosts.map((p) => p.category).sort()).toEqual(['news', 'tech']);
    });

    it('サービス間で時間ベースのクエリを正しく処理できること', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      await db.collection('posts').insertMany([
        {
          title: 'Recent Post',
          url: 'https://example.com/recent',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ['recent'],
        },
        {
          title: 'Old Post',
          url: 'https://example.com/old',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
          tag: ['old'],
        },
      ]);

      const posts24h = await PostService.getLatest24hPosts();
      const posts7dTech = await PostService.getLatest7dPostsByCategory('tech');
      const recentTags = await TagService.getLatest7dPostsByTag('recent');
      const oldTags = await TagService.getLatest7dPostsByTag('old');

      expect(posts24h).toHaveLength(1);
      expect(posts7dTech).toHaveLength(1);
      expect(recentTags).toHaveLength(1);
      expect(oldTags).toHaveLength(0);
    });
  });

  describe('データ整合性', () => {
    it('同じURLを持つ重複した投稿を作成しないこと', async () => {
      const postData = {
        title: 'Duplicate Test',
        url: 'https://example.com/duplicate',
        category: 'tech',
      };

      await PostService.createPost(postData);

      await expect(PostService.createPost(postData)).rejects.toThrow();

      const count = await PostService.getPostCount();
      expect(count).toBe(1);
    });

    it('同時投稿作成を正しく処理できること', async () => {
      const posts = [
        { title: 'Post 1', url: 'https://example.com/1', category: 'tech' },
        { title: 'Post 2', url: 'https://example.com/2', category: 'news' },
        { title: 'Post 3', url: 'https://example.com/3', category: 'sports' },
      ];

      await Promise.all(posts.map((post) => PostService.createPost(post)));

      const count = await PostService.getPostCount();
      expect(count).toBe(3);
    });
  });
});
