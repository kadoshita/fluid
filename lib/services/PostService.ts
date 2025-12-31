import { connectToDatabase } from '../../db';
import { DisplayPostData, InsertPostData } from '../../@types/PostData';
import { Filter, ObjectId } from 'mongodb';

export class PostService {
    /**
     * Get latest 24 hours posts
     */
    static async getLatest24hPosts(): Promise<DisplayPostData[]> {
        const { db } = await connectToDatabase();
        const now = new Date();
        const before24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return await db
            .collection<DisplayPostData>('posts')
            .find({
                added_at: {
                    $gte: before24h,
                    $lt: now,
                },
            })
            .sort({ added_at: -1 })
            .toArray();
    }

    /**
     * Get latest 7 days posts by category
     */
    static async getLatest7dPostsByCategory(category: string): Promise<DisplayPostData[]> {
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
                category: category,
            })
            .sort({ added_at: -1 })
            .toArray();
    }

    /**
     * Search posts by keyword, category, and URL
     */
    static async searchPosts(keyword: string, category: string, url: string): Promise<DisplayPostData[]> {
        const { db } = await connectToDatabase();

        const keywordList = keyword.split(/\s+/);
        const keywordQueries: Filter<DisplayPostData>[] = keywordList.map((word) => {
            const keywordRegexp = new RegExp(word, 'i');
            return {
                title: {
                    $regex: keywordRegexp,
                },
                description: {
                    $regex: keywordRegexp,
                },
            };
        });

        const urlRegexp = new RegExp(url, 'i');
        const findQuery: Filter<DisplayPostData> = {
            $and: [
                ...keywordQueries,
                category === '' ? {} : { category: category },
                url === '' ? {} : { url: urlRegexp },
            ],
        };

        return await db
            .collection<DisplayPostData>('posts')
            .find(findQuery)
            .sort({ added_at: -1 })
            .limit(30)
            .toArray();
    }

    /**
     * Create a new post
     */
    static async createPost(postData: Omit<InsertPostData, 'added_at'>): Promise<void> {
        const { db } = await connectToDatabase();
        const added_at = new Date();
        const insertData: InsertPostData = { ...postData, added_at };

        await db.collection('posts').insertOne(insertData);

        // Also insert domain data
        const { url, category } = postData;
        const _url = new URL(url);
        const domain = _url.host;

        await db.collection('domains').insertOne({
            domain,
            category,
            added_at,
        });
    }

    /**
     * Get post by ID
     */
    static async getPostById(id: string): Promise<DisplayPostData | null> {
        const { db } = await connectToDatabase();

        const result = await db
            .collection('posts')
            .findOne({ _id: new ObjectId(id) });

        return result as unknown as DisplayPostData | null;
    }

    /**
     * Get latest 24 hours posts by category
     */
    static async getLatest24hPostsByCategory(category: string): Promise<DisplayPostData[]> {
        const { db } = await connectToDatabase();
        const now = new Date();
        const before24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return await db
            .collection<DisplayPostData>('posts')
            .find({
                added_at: {
                    $gte: before24h,
                    $lt: now,
                },
                category: category,
            })
            .sort({ added_at: -1 })
            .toArray();
    }

    /**
     * Get total count of posts for health check
     */
    static async getPostCount(): Promise<number> {
        const { db } = await connectToDatabase();
        return await db.collection('posts').countDocuments();
    }
}
