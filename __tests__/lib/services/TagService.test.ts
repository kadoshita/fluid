import { beforeEach, describe, expect, it } from "vitest";
import { connectToDatabase } from "../../../db";
import { TagService } from "../../../lib/services/TagService";

describe("TagService", () => {
  beforeEach(async () => {
    const { db } = await connectToDatabase();
    await db.collection("posts").deleteMany({});
    await db.collection("domains").deleteMany({});
  });

  describe("getAllTags", () => {
    it("投稿からすべての異なるタグを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(),
          tag: ["javascript", "typescript"],
        },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(),
          tag: ["react", "vue"],
        },
        {
          title: "Post 3",
          url: "https://example.com/3",
          category: "tech",
          added_at: new Date(),
          tag: ["javascript", "angular"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getAllTags();

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain("javascript");
      expect(result).toContain("typescript");
      expect(result).toContain("react");
      expect(result).toContain("vue");
      expect(result).toContain("angular");
    });

    it("タグが存在しない場合は空の配列を返すこと", async () => {
      const result = await TagService.getAllTags();
      expect(result).toEqual([]);
    });

    it("一意のタグのみを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(),
          tag: ["javascript"],
        },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(),
          tag: ["javascript"],
        },
        {
          title: "Post 3",
          url: "https://example.com/3",
          category: "tech",
          added_at: new Date(),
          tag: ["javascript"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getAllTags();

      expect(result).toEqual(["javascript"]);
    });

    it("特殊文字を含むタグを処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(),
          tag: ["c++", "c#"],
        },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(),
          tag: ["node.js", "vue.js"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getAllTags();

      expect(result).toContain("c++");
      expect(result).toContain("c#");
      expect(result).toContain("node.js");
      expect(result).toContain("vue.js");
    });

    it("Unicode文字を含むタグを処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(),
          tag: ["日本語", "한글"],
        },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(),
          tag: ["中文", "Español"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getAllTags();

      expect(result).toContain("日本語");
      expect(result).toContain("한글");
      expect(result).toContain("中文");
      expect(result).toContain("Español");
    });

    it("tagフィールドがない投稿を処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "tech", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getAllTags();

      expect(result).toEqual([]);
    });

    it("空のタグ配列を持つ投稿を処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(),
          tag: [],
        },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(),
          tag: [],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getAllTags();

      expect(result).toEqual([]);
    });
  });

  describe("getLatest7dPostsByTag", () => {
    it("過去7日間でタグでフィルタリングされた投稿を返すこと", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "javascript";

      const posts = [
        {
          title: "Recent JS Post",
          url: "https://example.com/js1",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          tag: ["javascript", "web"],
        },
        {
          title: "Recent TS Post",
          url: "https://example.com/ts1",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          tag: ["typescript", "web"],
        },
        {
          title: "Old JS Post",
          url: "https://example.com/js2",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
          tag: ["javascript"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Recent JS Post");
      expect(result[0].tag).toContain("javascript");
    });

    it("タグに一致する投稿がない場合は空の配列を返すこと", async () => {
      const result = await TagService.getLatest7dPostsByTag("nonexistent-tag");
      expect(result).toEqual([]);
    });

    it("投稿をadded_atの降順でソートすること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "test";

      const posts = [
        {
          title: "Oldest Post",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
          tag: ["test"],
        },
        {
          title: "Newest Post",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
          tag: ["test"],
        },
        {
          title: "Middle Post",
          url: "https://example.com/3",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          tag: ["test"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Newest Post");
      expect(result[1].title).toBe("Middle Post");
      expect(result[2].title).toBe("Oldest Post");
    });

    it("特殊文字を含むタグを処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "c++";

      const posts = [
        {
          title: "C++ Post",
          url: "https://example.com/cpp",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["c++", "programming"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("C++ Post");
    });

    it("スペースを含むタグを処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "machine learning";

      const posts = [
        {
          title: "ML Post",
          url: "https://example.com/ml",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["machine learning", "ai"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(1);
    });

    it("Unicodeタグを処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "日本語";

      const posts = [
        {
          title: "Japanese Post",
          url: "https://example.com/jp",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["日本語", "language"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(1);
      expect(result[0].tag).toContain("日本語");
    });

    it("複数のタグを持つ投稿を処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "javascript";

      const posts = [
        {
          title: "Multi-tag Post",
          url: "https://example.com/multi",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["javascript", "typescript", "react", "vue"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(1);
      expect(result[0].tag).toContain("javascript");
      expect(result[0].tag.length).toBe(4);
    });

    it("7日以上前の投稿を返さないこと", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "old";

      const posts = [
        {
          title: "Very Old Post",
          url: "https://example.com/old1",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
          tag: ["old"],
        },
        {
          title: "Ancient Post",
          url: "https://example.com/old2",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
          tag: ["old"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(0);
    });

    it("空文字列のタグを処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      const posts = [
        {
          title: "Post with empty tag",
          url: "https://example.com/empty",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: [""],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag("");

      expect(result).toHaveLength(1);
    });

    it("大量の結果セットを処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "popular";

      const posts = Array.from({ length: 100 }, (_, i) => ({
        title: `Post ${i}`,
        url: `https://example.com/${i}`,
        category: "tech",
        added_at: new Date(now.getTime() - 1000 * 60 * 60),
        tag: ["popular"],
      }));

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result.length).toBe(100);
    });

    it("ちょうど7日以内の投稿のみを返すこと", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "boundary";

      const posts = [
        {
          title: "Within 7 days",
          url: "https://example.com/within",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
          tag: ["boundary"],
        },
        {
          title: "Beyond 7 days",
          url: "https://example.com/beyond",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
          tag: ["boundary"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Within 7 days");
    });

    it("一致するタグがない投稿を処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["react", "vue"],
        },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["angular", "svelte"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag("javascript");

      expect(result).toHaveLength(0);
    });
  });

  describe("エッジケース", () => {
    it("tag配列を持たない投稿を処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      const posts = [
        {
          title: "Post without tags",
          url: "https://example.com/notags",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag("any-tag");

      expect(result).toHaveLength(0);
    });

    it("非常に長いタグ名を処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const longTag = "a".repeat(100);

      const posts = [
        {
          title: "Long tag post",
          url: "https://example.com/long",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: [longTag],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(longTag);

      expect(result).toHaveLength(1);
    });

    it("大文字小文字を正しく区別すること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();

      const posts = [
        {
          title: "Lowercase tag",
          url: "https://example.com/lower",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["javascript"],
        },
        {
          title: "Uppercase tag",
          url: "https://example.com/upper",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["JavaScript"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const resultLower = await TagService.getLatest7dPostsByTag("javascript");
      const resultUpper = await TagService.getLatest7dPostsByTag("JavaScript");

      expect(resultLower).toHaveLength(1);
      expect(resultUpper).toHaveLength(1);
      expect(resultLower[0].title).not.toBe(resultUpper[0].title);
    });

    it("複数のカテゴリにまたがる投稿を処理できること", async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      const tag = "cross-category";

      const posts = [
        {
          title: "Tech Post",
          url: "https://example.com/tech",
          category: "tech",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["cross-category"],
        },
        {
          title: "News Post",
          url: "https://example.com/news",
          category: "news",
          added_at: new Date(now.getTime() - 1000 * 60 * 60),
          tag: ["cross-category"],
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await TagService.getLatest7dPostsByTag(tag);

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.category).sort()).toEqual(["news", "tech"]);
    });
  });
});