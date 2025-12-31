import { beforeEach, describe, expect, it } from "vitest";
import { connectToDatabase } from "../../../db";
import { CategoryService } from "../../../lib/services/CategoryService";

describe("CategoryService", () => {
  beforeEach(async () => {
    const { db } = await connectToDatabase();
    await db.collection("posts").deleteMany({});
    await db.collection("domains").deleteMany({});
  });

  describe("getAllCategories", () => {
    it("すべての異なるカテゴリを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "tech", added_at: new Date() },
        { title: "Post 4", url: "https://example.com/4", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getAllCategories();

      expect(result).toHaveLength(3);
      expect(result).toContain("tech");
      expect(result).toContain("news");
      expect(result).toContain("sports");
    });

    it("カテゴリが存在しない場合は空の配列を返すこと", async () => {
      const result = await CategoryService.getAllCategories();
      expect(result).toEqual([]);
    });

    it("一意のカテゴリのみを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "tech", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "tech", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getAllCategories();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("tech");
    });

    it("特殊文字を含むカテゴリを処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        {
          title: "Post 1",
          url: "https://example.com/1",
          category: "tech-news",
          added_at: new Date(),
        },
        { title: "Post 2", url: "https://example.com/2", category: "C++", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getAllCategories();

      expect(result).toContain("tech-news");
      expect(result).toContain("C++");
    });
  });

  describe("getCategoriesWithDomainFrequency", () => {
    it("ドメインが指定されていない場合はソートなしでカテゴリを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getCategoriesWithDomainFrequency();

      expect(result).toHaveLength(3);
      expect(result).toContain("tech");
      expect(result).toContain("news");
      expect(result).toContain("sports");
    });

    it("ドメインが空文字列の場合はソートなしでカテゴリを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getCategoriesWithDomainFrequency("");

      expect(result).toHaveLength(2);
    });

    it("既知のドメインに対して頻度順にソートされたカテゴリを返すこと", async () => {
      const { db } = await connectToDatabase();
      const domain = "example.com";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [
        { domain, category: "tech", added_at: new Date() },
        { domain, category: "tech", added_at: new Date() },
        { domain, category: "tech", added_at: new Date() },
        { domain, category: "news", added_at: new Date() },
        { domain, category: "news", added_at: new Date() },
        { domain, category: "sports", added_at: new Date() },
      ];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe("tech"); // 3 times
      expect(result[1]).toBe("news"); // 2 times
      expect(result[2]).toBe("sports"); // 1 time
    });

    it("未知のドメインの場合は空文字列を最初に含むカテゴリを返すこと", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getCategoriesWithDomainFrequency("newdomain.com");

      expect(result[0]).toBe("");
      expect(result.length).toBe(4); // empty string + 3 categories
    });

    it("部分的なドメイン頻度データを処理できること", async () => {
      const { db } = await connectToDatabase();
      const domain = "partial.com";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
        {
          title: "Post 4",
          url: "https://example.com/4",
          category: "entertainment",
          added_at: new Date(),
        },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [
        { domain, category: "news", added_at: new Date() },
        { domain, category: "news", added_at: new Date() },
        { domain, category: "tech", added_at: new Date() },
      ];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result[0]).toBe("news"); // 2 times
      expect(result[1]).toBe("tech"); // 1 time
      expect(result).toContain("sports");
      expect(result).toContain("entertainment");
      expect(result.length).toBe(4);
    });

    it("単一カテゴリのみを使用するドメインを処理できること", async () => {
      const { db } = await connectToDatabase();
      const domain = "single.com";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [{ domain, category: "tech", added_at: new Date() }];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result[0]).toBe("tech");
      expect(result).toContain("news");
    });

    it("同じ頻度のカテゴリを処理できること", async () => {
      const { db } = await connectToDatabase();
      const domain = "equal.com";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [
        { domain, category: "tech", added_at: new Date() },
        { domain, category: "news", added_at: new Date() },
        { domain, category: "sports", added_at: new Date() },
      ];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result.length).toBe(3);
      expect(result).toContain("tech");
      expect(result).toContain("news");
      expect(result).toContain("sports");
    });

    it("ドメイン名に特殊文字を含む場合を処理できること", async () => {
      const { db } = await connectToDatabase();
      const domain = "special-domain.co.jp";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [{ domain, category: "tech", added_at: new Date() }];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result[0]).toBe("tech");
    });

    it("非常に大きな頻度カウントを処理できること", async () => {
      const { db } = await connectToDatabase();
      const domain = "large.com";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [
        ...Array.from({ length: 100 }, () => ({ domain, category: "tech", added_at: new Date() })),
        { domain, category: "news", added_at: new Date() },
      ];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result[0]).toBe("tech");
      expect(result[1]).toBe("news");
    });
  });

  describe("統合動作", () => {
    it("新しいドメインに対する典型的なChrome拡張機能のユースケースを処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getCategoriesWithDomainFrequency("newsite.com");

      expect(result[0]).toBe("");
      expect(result.length).toBe(4);
    });

    it("既知のドメインに対する典型的なChrome拡張機能のユースケースを処理できること", async () => {
      const { db } = await connectToDatabase();
      const domain = "knownsite.com";

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "tech", added_at: new Date() },
        { title: "Post 2", url: "https://example.com/2", category: "news", added_at: new Date() },
        { title: "Post 3", url: "https://example.com/3", category: "sports", added_at: new Date() },
      ];

      await db.collection("posts").insertMany(posts);

      const domains = [
        ...Array.from({ length: 50 }, () => ({ domain, category: "tech", added_at: new Date() })),
        ...Array.from({ length: 20 }, () => ({ domain, category: "news", added_at: new Date() })),
        ...Array.from({ length: 10 }, () => ({ domain, category: "sports", added_at: new Date() })),
      ];

      await db.collection("domains").insertMany(domains);

      const result = await CategoryService.getCategoriesWithDomainFrequency(domain);

      expect(result[0]).not.toBe("");
      expect(result[0]).toBe("tech");
      expect(result[1]).toBe("news");
      expect(result[2]).toBe("sports");
    });
  });

  describe("エッジケース", () => {
    it("空の投稿コレクションを処理できること", async () => {
      const result = await CategoryService.getCategoriesWithDomainFrequency("any.com");
      expect(result[0]).toBe("");
      expect(result.length).toBe(1);
    });

    it("Unicode文字のカテゴリ名を処理できること", async () => {
      const { db } = await connectToDatabase();

      const posts = [
        { title: "Post 1", url: "https://example.com/1", category: "技術", added_at: new Date() },
        {
          title: "Post 2",
          url: "https://example.com/2",
          category: "ニュース",
          added_at: new Date(),
        },
      ];

      await db.collection("posts").insertMany(posts);

      const result = await CategoryService.getAllCategories();

      expect(result).toContain("技術");
      expect(result).toContain("ニュース");
    });
  });
});
