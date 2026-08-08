import { connectToDatabase } from '../../db';
import { categoriesCache } from '../cache';

export const CategoryService = {
  /**
   * Get all distinct categories from posts
   */
  async getAllCategories(): Promise<string[]> {
    const cached = categoriesCache.get('categories');
    if (cached) return cached;

    const { db } = await connectToDatabase();
    const result = await db.collection('posts').distinct('category');
    categoriesCache.set('categories', result);
    return result;
  },

  /**
   * Get categories sorted by domain usage frequency
   * If domain is provided, sort by frequency for that domain
   * If domain has no history, return categories with empty string first
   */
  async getCategoriesWithDomainFrequency(domain?: string): Promise<string[]> {
    const cacheKey = `categories:${domain ?? 'all'}`;
    const cached = categoriesCache.get(cacheKey);
    if (cached) return cached;

    const { db } = await connectToDatabase();
    const categories = await db.collection('posts').distinct('category');

    if (!domain || domain === '') {
      categoriesCache.set(cacheKey, categories);
      return categories;
    }

    const results = await db
      .collection('domains')
      .aggregate([
        {
          $match: {
            domain: domain,
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ])
      .toArray();

    let result: string[];
    if (results.length === 0) {
      // Chrome拡張機能では、カテゴリーの入力欄に、デフォルトで配列の先頭の要素が入るような仕様になっている
      // したがって、これまで登録されていないdomainについてChrome拡張機能で登録しようとした際に、常に先頭のカテゴリーが入力欄に入ってしまう
      // これをその都度消して選択し直すのは面倒なので、そのケースにおいてはレスポンスの先頭の要素を空文字列にする
      // これによって、デフォルトで入るのは空文字列となり、datalist要素で全選択肢が表示されるため、選択肢を選びやすくなる
      result = [''].concat(categories);
    } else {
      // Sort categories by frequency for this domain
      result = categories.sort((a, b) => {
        const countA = results.find((r) => r._id === a)?.count || 0;
        const countB = results.find((r) => r._id === b)?.count || 0;
        return countB - countA;
      });
    }

    categoriesCache.set(cacheKey, result);
    return result;
  },
};
