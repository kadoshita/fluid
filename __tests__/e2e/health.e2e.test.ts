import { describe, expect, it } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('ヘルスチェック E2E テスト', () => {
  it('ヘルスエンドポイントが200ステータスコードを返すこと', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    expect(response.status).toBe(200);
  });

  it('正しいヘルスチェックデータ構造を返すこと', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    expect(data).toHaveProperty('db');
    expect(data).toHaveProperty('version');
    expect(data.db).toHaveProperty('records');
    expect(typeof data.db.records).toBe('number');
    expect(typeof data.version).toBe('string');
  });

  it('package.jsonからバージョンを返すこと', async () => {
    const packageJson = await import('../../package.json');
    const expectedVersion = packageJson.version;
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.version).toBe(expectedVersion);
  });

  it('複数の同時リクエストを処理できること', async () => {
    const requests = Array.from({ length: 5 }, () => fetch(`${BASE_URL}/api/health`));

    const responses = await Promise.all(requests);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    const dataArray = await Promise.all(responses.map((response) => response.json()));

    dataArray.forEach((data) => {
      expect(data).toHaveProperty('db');
      expect(data).toHaveProperty('version');
    });
  });
});
