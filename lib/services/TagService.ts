import { connectToDatabase } from '../../db';
import { DisplayPostData } from '../../@types/PostData';

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

        return await db
            .collection<DisplayPostData>('posts')
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
    }
}