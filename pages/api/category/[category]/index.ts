import { NextApiRequest, NextApiResponse } from 'next';
import { DisplayPostData } from '../../../../@types/PostData';
import { connectToDatabase } from '../../../../db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { category } = req.query;
        const { db } = await connectToDatabase();

        const now = new Date();
        const before7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const latest7dPosts = await db
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

        if (latest7dPosts) {
            return res.status(200).json(latest7dPosts);
        } else {
            return res.status(404).end();
        }
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};
