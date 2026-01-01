import type { DisplayPostData } from '../../@types/PostData';
import { connectToDatabase } from '../../db';

export class TagService {
  /**
   * Get all distinct tags from posts
   */
  static async getAllTags(): Promise<string[]> {
    const { db } = await connectToDatabase();
    return await db.collection('posts').distinct('tag');
  }

  /**
   * Get latest 7 days posts by tag
   */
  static async getLatest7dPostsByTag(tag: string): Promise<DisplayPostData[]> {
    const { db } = await connectToDatabase();
    const now = new Date();
    const before7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const posts = await db
      .collection('posts')
      .find({
        added_at: {
          $gte: before7d,
          $lt: now,
        },
        tag: {
          $in: [tag],
        },
      })
      .sort({ added_at: -1 })
      .toArray();

    return posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      added_at: post.added_at.toISOString(),
    })) as DisplayPostData[];
  }
}
