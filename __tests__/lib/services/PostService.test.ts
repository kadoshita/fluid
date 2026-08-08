import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { connectToDatabase } from '../../../db';
import { resetAllCaches } from '../../../lib/cache';
import { PostService } from '../../../lib/services/PostService';

describe('PostService', () => {
  beforeEach(async () => {
    // Clean up is handled in vitest.setup.ts
    const { db } = await connectToDatabase();
    await db.collection('posts').deleteMany({});
    await db.collection('domains').deleteMany({});
  });

  describe('getLatest24hPosts', () => {
    it('過去24時間の投稿を返すこと', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const recentPost = {
        title: 'Recent Post',
        url: 'https://example.com/recent',
        category: 'tech',
        added_at: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
        tag: ['test'],
      };
      const oldPost = {
        title: 'Old Post',
        url: 'https://example.com/old',
        category: 'tech',
        added_at: new Date(now.getTime() - 1000 * 60 * 60 * 25), // 25 hours ago
      };

      await db.collection('posts').insertMany([recentPost, oldPost]);

      const result = await PostService.getLatest24hPosts();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Recent Post');
    });

    it('投稿が見つからない場合は空の配列を返すこと', async () => {
      const result = await PostService.getLatest24hPosts();
      expect(result).toEqual([]);
    });

    it('投稿をadded_atの降順でソートすること', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      const posts = [
        {
          title: 'Post 1',
          url: 'https://example.com/1',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 5),
        },
        {
          title: 'Post 2',
          url: 'https://example.com/2',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 2),
        },
        {
          title: 'Post 3',
          url: 'https://example.com/3',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 10),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.getLatest24hPosts();

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Post 2');
      expect(result[1].title).toBe('Post 1');
      expect(result[2].title).toBe('Post 3');
    });
  });

  describe('getLatest7dPostsByCategory', () => {
    it('過去7日間でカテゴリでフィルタリングされた投稿を返すこと', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const category = 'tech';

      const posts = [
        {
          title: 'Tech Post',
          url: 'https://example.com/tech',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
        },
        {
          title: 'News Post',
          url: 'https://example.com/news',
          category: 'news',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
        },
        {
          title: 'Old Tech Post',
          url: 'https://example.com/old-tech',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.getLatest7dPostsByCategory(category);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Tech Post');
      expect(result[0].category).toBe('tech');
    });

    it('投稿がないカテゴリの場合は空の配列を返すこと', async () => {
      const result = await PostService.getLatest7dPostsByCategory('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('getLatest24hPostsByCategory', () => {
    it('過去24時間でカテゴリでフィルタリングされた投稿を返すこと', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const category = 'news';

      const posts = [
        {
          title: 'Recent News',
          url: 'https://example.com/news1',
          category: 'news',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 5),
        },
        {
          title: 'Recent Tech',
          url: 'https://example.com/tech1',
          category: 'tech',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 5),
        },
        {
          title: 'Old News',
          url: 'https://example.com/news2',
          category: 'news',
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 30),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.getLatest24hPostsByCategory(category);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Recent News');
    });
  });

  describe('searchPosts', () => {
    it('キーワードで投稿を検索できること', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: 'React Tutorial',
          url: 'https://example.com/react',
          category: 'tech',
          description: 'Learn React basics',
          added_at: new Date(),
        },
        {
          title: 'Vue Tutorial',
          url: 'https://example.com/vue',
          category: 'tech',
          description: 'Learn Vue basics',
          added_at: new Date(),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.searchPosts('React', '', '');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Tutorial');
    });

    it('複数のキーワードで投稿を検索できること', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: 'React TypeScript Tutorial',
          url: 'https://example.com/react-ts',
          category: 'tech',
          description: 'Learn React with TypeScript',
          added_at: new Date(),
        },
        {
          title: 'React Tutorial',
          url: 'https://example.com/react',
          category: 'tech',
          description: 'Basic React tutorial',
          added_at: new Date(),
        },
        {
          title: 'Vue Tutorial',
          url: 'https://example.com/vue',
          category: 'tech',
          description: 'Learn Vue basics',
          added_at: new Date(),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.searchPosts('React TypeScript', '', '');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React TypeScript Tutorial');
    });

    it('キーワードとカテゴリで投稿を検索できること', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: 'React in Tech',
          url: 'https://example.com/react-tech',
          category: 'tech',
          description: 'React technical guide',
          added_at: new Date(),
        },
        {
          title: 'React in News',
          url: 'https://example.com/react-news',
          category: 'news',
          description: 'React news update',
          added_at: new Date(),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.searchPosts('React', 'tech', '');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('tech');
    });

    it('URLパターンで投稿を検索できること', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: 'GitHub Post',
          url: 'https://github.com/user/repo',
          category: 'tech',
          description: 'GitHub repository',
          added_at: new Date(),
        },
        {
          title: 'Example Post',
          url: 'https://example.com/post',
          category: 'tech',
          description: 'Example post',
          added_at: new Date(),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const result = await PostService.searchPosts('', '', 'github.com');

      expect(result).toHaveLength(1);
      expect(result[0].url).toContain('github.com');
    });

    it('検索結果を30件に制限すること', async () => {
      const { db } = await connectToDatabase();

      const posts = Array.from({ length: 50 }, (_, i) => ({
        title: `Post ${i}`,
        url: `https://example.com/${i}`,
        category: 'tech',
        description: 'Test post',
        added_at: new Date(),
      }));

      await db.collection('posts').insertMany(posts);

      const result = await PostService.searchPosts('Post', '', '');

      expect(result.length).toBeLessThanOrEqual(30);
    });

    it('一致するものがない場合は空の配列を返すこと', async () => {
      const result = await PostService.searchPosts('NonexistentKeyword', '', '');
      expect(result).toEqual([]);
    });
  });

  describe('searchPosts (日本語 lexical index)', () => {
    it('日本語で単語をまたぐ部分一致がヒットすること', async () => {
      await PostService.createPost({
        title: 'React入門と応用',
        url: 'https://example.com/react-nyumon',
        category: 'tech',
        description: 'Reactの基礎から応用まで',
      });
      await PostService.createPost({
        title: 'Vue入門',
        url: 'https://example.com/vue-nyumon',
        category: 'tech',
        description: 'Vueの基礎',
      });

      const result = await PostService.searchPosts('入門', '', '');
      // Both posts contain 入門, both should match
      const titles = result.map((r) => r.title).sort();
      expect(titles).toEqual(['React入門と応用', 'Vue入門']);
    });

    it('カタカナ・ひらがな相互で検索できること', async () => {
      await PostService.createPost({
        title: 'プログラミング言語',
        url: 'https://example.com/lang',
        category: 'tech',
        description: 'いろいろな言語の比較',
      });

      const kataResult = await PostService.searchPosts('げんご', '', '');
      expect(kataResult.map((r) => r.title)).toContain('プログラミング言語');

      const hiraDoc = await PostService.searchPosts('プログラミング', '', '');
      expect(hiraDoc.map((r) => r.title)).toContain('プログラミング言語');
    });

    it('NFKC正規化で半角/全角の差を吸収すること', async () => {
      await PostService.createPost({
        title: 'ＴｙｐｅＳｃｒｉｐｔ入門',
        url: 'https://example.com/ts',
        category: 'tech',
      });

      const result = await PostService.searchPosts('TypeScript', '', '');
      expect(result.map((r) => r.title)).toContain('ＴｙｐｅＳｃｒｉｐｔ入門');
    });

    it('大文字/小文字を同一視すること', async () => {
      await PostService.createPost({
        title: 'React Tutorial',
        url: 'https://example.com/react-tut',
        category: 'tech',
      });

      const upper = await PostService.searchPosts('REACT', '', '');
      expect(upper.map((r) => r.title)).toContain('React Tutorial');

      const lower = await PostService.searchPosts('react', '', '');
      expect(lower.map((r) => r.title)).toContain('React Tutorial');
    });

    it('適合度スコアで関連度の高い投稿が上位に来ること', async () => {
      // Post A mentions React only in the title.
      // Post B mentions React multiple times (title + description).
      await PostService.createPost({
        title: 'React',
        url: 'https://example.com/react-a',
        category: 'tech',
        description: 'A single mention',
      });
      await PostService.createPost({
        title: 'React React React',
        url: 'https://example.com/react-b',
        category: 'tech',
        description: 'React React React',
      });

      const result = await PostService.searchPosts('React', '', '');
      expect(result[0].title).toBe('React React React');
    });

    it('search_tokensが存在しないドキュメント (レガシー) でも regex フォールバックで拾えること', async () => {
      const { db } = await connectToDatabase();
      await db.collection('posts').insertOne({
        title: 'Legacy Post about Go',
        url: 'https://example.com/legacy-go',
        category: 'tech',
        description: 'A post without search_tokens',
        added_at: new Date(),
      });

      const result = await PostService.searchPosts('Legacy', '', '');
      expect(result.map((r) => r.title)).toContain('Legacy Post about Go');
    });

    it('nolexical (disableLexical) 指定で常に regex パスを使うこと', async () => {
      await PostService.createPost({
        title: 'React入門',
        url: 'https://example.com/reg',
        category: 'tech',
      });

      // With lexical disabled, the legacy AND-regex should still find it.
      const result = await PostService.searchPosts('入門', '', '', { disableLexical: true });
      expect(result.map((r) => r.title)).toContain('React入門');
    });

    it('limit オプションが尊重されること', async () => {
      for (let i = 0; i < 15; i++) {
        await PostService.createPost({
          title: `記事 ${i}`,
          url: `https://example.com/limit/${i}`,
          category: 'tech',
        });
      }

      const result = await PostService.searchPosts('記事', '', '', { limit: 5 });
      expect(result).toHaveLength(5);
    });

    it('limit オプションを与えなければ既定は30件のままであること', async () => {
      for (let i = 0; i < 35; i++) {
        await PostService.createPost({
          title: `article ${i}`,
          url: `https://example.com/def/${i}`,
          category: 'tech',
        });
      }

      const result = await PostService.searchPosts('article', '', '');
      expect(result).toHaveLength(30);
    });
  });

  describe('createPost (search fields)', () => {
    it('search_text / search_tokens / search_indexed_at が保存されること', async () => {
      const { db } = await connectToDatabase();
      await PostService.createPost({
        title: '日本語タイトル',
        url: 'https://example.com/sf',
        category: 'tech',
        description: 'せつめい',
        comment: 'コメント',
        tag: ['タグ1', 'タグ2'],
      });

      const doc = await db.collection('posts').findOne({ url: 'https://example.com/sf' });
      expect(doc).not.toBeNull();
      expect(typeof doc?.search_text).toBe('string');
      expect(doc?.search_text).toContain('日本語タイトル');
      expect(doc?.search_text).toContain('せつめい');
      expect(doc?.search_text).toContain('コメント');
      expect(doc?.search_text).toContain('タグ1');
      expect(typeof doc?.search_tokens).toBe('string');
      expect(doc?.search_tokens.length).toBeGreaterThan(0);
      expect(doc?.search_indexed_at).toBeInstanceOf(Date);
    });
  });

  describe('createPost', () => {
    it('新しい投稿とドメインエントリを作成すること', async () => {
      const { db } = await connectToDatabase();
      const postData = {
        title: 'Test Post',
        url: 'https://example.com/test',
        category: 'tech',
        description: 'Test description',
        tag: ['test'],
      };

      await PostService.createPost(postData);

      const posts = await db.collection('posts').find({}).toArray();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe(postData.title);

      const domains = await db.collection('domains').find({}).toArray();
      expect(domains).toHaveLength(1);
      expect(domains[0].domain).toBe('example.com');
      expect(domains[0].category).toBe(postData.category);
    });

    it('さまざまなURLから正しくドメインを抽出すること', async () => {
      const { db } = await connectToDatabase();

      await PostService.createPost({
        title: 'Test 1',
        url: 'https://subdomain.example.com/path',
        category: 'tech',
      });

      await PostService.createPost({
        title: 'Test 2',
        url: 'http://another.com/page',
        category: 'tech',
      });

      const domains = await db.collection('domains').find({}).toArray();
      expect(domains).toHaveLength(2);
    });

    it('オプションフィールドを含む投稿を作成すること', async () => {
      const { db } = await connectToDatabase();
      const postData = {
        title: 'Full Post',
        url: 'https://example.com/full',
        category: 'tech',
        description: 'Full description',
        comment: 'Test comment',
        image: 'https://example.com/image.jpg',
        tag: ['tag1', 'tag2'],
      };

      await PostService.createPost(postData);

      const posts = await db.collection('posts').find({}).toArray();
      expect(posts).toHaveLength(1);
      expect(posts[0].comment).toBe(postData.comment);
      expect(posts[0].image).toBe(postData.image);
    });
  });

  describe('getPostById', () => {
    it('IDで投稿を返すこと', async () => {
      const { db } = await connectToDatabase();
      const post = {
        title: 'Test Post',
        url: 'https://example.com/test',
        category: 'tech',
        added_at: new Date(),
      };

      const insertResult = await db.collection('posts').insertOne(post);
      const postId = insertResult.insertedId.toString();

      const result = await PostService.getPostById(postId);

      expect(result).not.toBeNull();
      expect(result!.title).toBe(post.title);
    });

    it('投稿が見つからない場合はnullを返すこと', async () => {
      const nonExistentId = new ObjectId().toString();
      const result = await PostService.getPostById(nonExistentId);
      expect(result).toBeNull();
    });

    it('無効なObjectId形式の場合はエラーをスローすること', async () => {
      await expect(PostService.getPostById('invalid-id')).rejects.toThrow();
    });
  });

  describe('getPostCount', () => {
    it('投稿の総数を返すこと', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: 'Post 1', url: 'https://example.com/1', category: 'tech', added_at: new Date() },
        { title: 'Post 2', url: 'https://example.com/2', category: 'news', added_at: new Date() },
        { title: 'Post 3', url: 'https://example.com/3', category: 'sports', added_at: new Date() },
      ];

      await db.collection('posts').insertMany(posts);

      const count = await PostService.getPostCount();
      expect(count).toBe(3);
    });

    it('投稿が存在しない場合は0を返すこと', async () => {
      const count = await PostService.getPostCount();
      expect(count).toBe(0);
    });
  });

  describe('エッジケース', () => {
    it('特殊文字を含むタイトルの投稿を処理できること', async () => {
      const { db } = await connectToDatabase();
      const post = {
        title: 'C++ Tutorial: Pointers & References',
        url: 'https://example.com/cpp',
        category: 'tech',
        // getLatest24hPosts の $lt 境界との衝突を避けるため、過去の日時を使用する
        added_at: new Date(Date.now() - 1000),
      };

      await db.collection('posts').insertOne(post);

      const result = await PostService.getLatest24hPosts();
      expect(result[0].title).toBe(post.title);
    });

    it('キーワード検索で正規表現の特殊文字をエスケープすること', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: 'C++ Tutorial',
          url: 'https://example.com/cpp',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'C Tutorial',
          url: 'https://example.com/c',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Price: $100',
          url: 'https://example.com/price1',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Price: 100',
          url: 'https://example.com/price2',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Array [1, 2, 3]',
          url: 'https://example.com/array',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Function (x, y)',
          url: 'https://example.com/function',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'file.txt',
          url: 'https://example.com/file',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Question?',
          url: 'https://example.com/question',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Wildcard *',
          url: 'https://example.com/wildcard',
          category: 'tech',
          added_at: new Date(),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const cppResults = await PostService.searchPosts('C++', '', '');
      expect(cppResults).toHaveLength(1);
      expect(cppResults[0].title).toBe('C++ Tutorial');

      const dollarResults = await PostService.searchPosts('$100', '', '');
      expect(dollarResults).toHaveLength(1);

      const bracketResults = await PostService.searchPosts('[1, 2, 3]', '', '');
      expect(bracketResults).toHaveLength(1);

      const parenResults = await PostService.searchPosts('(x, y)', '', '');
      expect(parenResults).toHaveLength(1);

      const dotResults = await PostService.searchPosts('file.txt', '', '');
      expect(dotResults).toHaveLength(1);

      const questionResults = await PostService.searchPosts('Question?', '', '');
      expect(questionResults).toHaveLength(1);

      const asteriskResults = await PostService.searchPosts('Wildcard *', '', '');
      expect(asteriskResults).toHaveLength(1);
    });

    it('URL検索で正規表現の特殊文字をエスケープすること', async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: 'Query String',
          url: 'https://example.com/page?id=123',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Normal URL',
          url: 'https://example.com/page',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Dot in path',
          url: 'https://example.com/file.html',
          category: 'tech',
          added_at: new Date(),
        },
        {
          title: 'Plus in path',
          url: 'https://example.com/c++/guide',
          category: 'tech',
          added_at: new Date(),
        },
      ];

      await db.collection('posts').insertMany(posts);

      const queryResults = await PostService.searchPosts('', '', '?id=123');
      expect(queryResults).toHaveLength(1);
      expect(queryResults[0].url).toContain('?id=123');

      const dotResults = await PostService.searchPosts('', '', 'file.html');
      expect(dotResults).toHaveLength(1);

      const plusResults = await PostService.searchPosts('', '', 'c++');
      expect(plusResults).toHaveLength(1);
    });

    it('Unicode文字を含む投稿を処理できること', async () => {
      const { db } = await connectToDatabase();
      const post = {
        title: '日本語のタイトル',
        url: 'https://example.com/japanese',
        category: 'tech',
        description: '日本語の説明文',
        added_at: new Date(),
      };

      await db.collection('posts').insertOne(post);

      const result = await PostService.searchPosts('日本語', '', '');
      expect(result).toHaveLength(1);
    });

    it('時間境界線上の投稿を処理できること', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      // 23時間55分前の投稿を作成（タイミングの問題を回避するため、境界線より少し前）
      const almostOneDayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 23.92); // 23.92時間前

      const post = {
        title: 'Boundary Post',
        url: 'https://example.com/boundary',
        category: 'tech',
        added_at: almostOneDayAgo,
      };

      await db.collection('posts').insertOne(post);

      const result = await PostService.getLatest24hPosts();

      expect(result).toHaveLength(1);
    });
  });

  describe('キャッシュ動作', () => {
    beforeEach(() => {
      // キャッシュをクリアして各テストでクリーンな状態を確保
      resetAllCaches();
    });

    it('searchPosts は同じクエリでキャッシュを返すこと', async () => {
      await PostService.createPost({
        title: 'Cache Test Post',
        url: 'https://example.com/cache-test',
        category: 'tech',
        description: 'Testing cache behavior',
      });

      const firstCall = await PostService.searchPosts('Cache Test', '', '');
      expect(firstCall).toHaveLength(1);

      // 2回目の呼び出しはキャッシュから返される
      const secondCall = await PostService.searchPosts('Cache Test', '', '');
      expect(secondCall).toEqual(firstCall);
    });

    it('getLatest24hPosts はキャッシュを返すこと', async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      await db.collection('posts').insertOne({
        title: 'Cached Post',
        url: 'https://example.com/cached',
        category: 'tech',
        added_at: new Date(now.getTime() - 1000 * 60 * 60),
      });

      const firstCall = await PostService.getLatest24hPosts();
      expect(firstCall).toHaveLength(1);

      const secondCall = await PostService.getLatest24hPosts();
      expect(secondCall).toEqual(firstCall);
    });

    it('createPost 後に createPost によってキャッシュが無効化されること', async () => {
      const { db } = await connectToDatabase();

      // カテゴリ・タグキャッシュにデータを填充
      await db.collection('posts').insertOne({
        title: 'Initial Post',
        url: 'https://example.com/invalidation-test',
        category: 'tech',
        tag: ['initial'],
        added_at: new Date(),
      });

      // キャッシュを取得
      const { CategoryService } = await import('../../../lib/services/CategoryService.js');
      const { TagService } = await import('../../../lib/services/TagService.js');

      const categoriesBefore = await CategoryService.getAllCategories();
      expect(categoriesBefore).toContain('tech');

      // 投稿を作成 → キャッシュ無効化がトリガーされる
      await PostService.createPost({
        title: 'New Post',
        url: 'https://example.com/new-post',
        category: 'news',
        tag: ['new'],
      });

      // カテゴリ・タグキャッシュは更新され、新しい値が含まれる
      const categoriesAfter = await CategoryService.getAllCategories();
      expect(categoriesAfter).toContain('news');

      const tagsAfter = await TagService.getAllTags();
      expect(tagsAfter).toContain('new');
    });

    it('異なる検索クエリは異なるキャッシュキーを持つこと', async () => {
      await PostService.createPost({
        title: 'React Tutorial',
        url: 'https://example.com/react-cache',
        category: 'tech',
        description: 'Learn React',
      });
      await PostService.createPost({
        title: 'Vue Tutorial',
        url: 'https://example.com/vue-cache',
        category: 'tech',
        description: 'Learn Vue',
      });

      const reactResults = await PostService.searchPosts('React', '', '');
      const vueResults = await PostService.searchPosts('Vue', '', '');

      expect(reactResults).toHaveLength(1);
      expect(reactResults[0].title).toContain('React');
      expect(vueResults).toHaveLength(1);
      expect(vueResults[0].title).toContain('Vue');
    });
  });
});
