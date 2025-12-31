import { describe, expect, it } from "vitest";

const BASE_URL = "http://localhost:3000";

describe("Post API E2E テスト", () => {
  describe("GET /api/post", () => {
    it("200ステータスコードを返すこと", async () => {
      const response = await fetch(`${BASE_URL}/api/post`);
      expect(response.status).toBe(200);
    });

    it("投稿の配列を返すこと", async () => {
      const response = await fetch(`${BASE_URL}/api/post`);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
    });

    it("正しい構造の投稿を返すこと", async () => {
      const response = await fetch(`${BASE_URL}/api/post`);
      const data = await response.json();

      if (data.length > 0) {
        const post = data[0];
        expect(post).toHaveProperty("_id");
        expect(post).toHaveProperty("title");
        expect(post).toHaveProperty("content");
        expect(post).toHaveProperty("createdAt");
      }
    });
  });

  describe("POST /api/post", () => {
    const testPost = {
      title: "E2E Test Post",
      url: "https://example.com/e2e-test",
      category: "test",
      description: "This is a test post created by E2E tests",
      tag: ["e2e", "test"],
    };

    it("認証ヘッダーがない場合に401を返すこと", async () => {
      const response = await fetch(`${BASE_URL}/api/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPost),
      });

      expect(response.status).toBe(401);
    });

    it("無効なトークンが提供された場合に401を返すこと", async () => {
      const response = await fetch(`${BASE_URL}/api/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid_token",
        },
        body: JSON.stringify(testPost),
      });

      expect(response.status).toBe(401);
    });

    it("有効なトークンが提供された場合に投稿を作成すること", async () => {
      const response = await fetch(`${BASE_URL}/api/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
        body: JSON.stringify(testPost),
      });

      expect(response.status).toBe(200);
    });

    it("CORSプリフライトOPTIONSリクエストを処理すること", async () => {
      const response = await fetch(`${BASE_URL}/api/post`, {
        method: "OPTIONS",
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });
  });

  describe("CORSヘッダー", () => {
    it("GETレスポンスにCORSヘッダーを含むこと", async () => {
      const response = await fetch(`${BASE_URL}/api/post`);

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    });
  });
});
