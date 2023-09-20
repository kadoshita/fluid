import { NextApiRequest, NextApiResponse } from 'next';
import { DisplayPostData, InsertPostData } from '../../../@types/PostData';
import { connectToDatabase } from '../../../db/index';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    if (req.method === 'GET') {
        const { db } = await connectToDatabase();
        const now = new Date();
        const before24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const latest24hPosts = await db
            .collection<DisplayPostData>('posts')
            .find({
                added_at: {
                    $gte: before24h,
                    $lt: now,
                },
            })
            .sort({ added_at: -1 })
            .toArray();
        res.status(200).json(latest24hPosts);
    } else if (req.method === 'POST') {
        if (req.headers['authorization'] && req.headers['authorization'] === `Bearer ${process.env.API_TOKEN}`) {
            try {
                const added_at = new Date();
                const postData: InsertPostData = { ...req.body, added_at };
                const { db } = await connectToDatabase();
                await db.collection('posts').insertOne(postData);

                const { url, category } = req.body;
                const _url = new URL(url);
                const domain = _url.host;

                await db.collection('domains').insertOne({
                    domain,
                    category,
                    added_at,
                });

                return res.status(200).end();
            } catch (e) {
                console.error(e);
                return res.status(500).end();
            }
        } else {
            return res.status(401).end();
        }
    } else if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
};
