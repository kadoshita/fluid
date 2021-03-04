import { DisplayPostData, InsertPostData } from '../../../@types/PostData';
import { connectToDatabase } from '../../../db/index';

export default async (req, res) => {
    if (req.method === 'GET') {
        const { db } = await connectToDatabase();
        const posts: DisplayPostData[] = await db.collection('posts').find({}).limit(10).toArray();
        res.status(200).json(posts);
    } else if (req.method === 'POST') {
        if (req.headers['authorization'] && req.headers['authorization'] === `Bearer ${process.env.API_TOKEN}`) {
            try {
                const postData: InsertPostData = { ...req.body, added_at: (new Date()) };
                const { db } = await connectToDatabase();
                await db.collection('posts').insertOne(postData);
                return res.status(200).end();
            } catch (e) {
                console.error(e);
                return res.status(500).end();
            }
        } else {
            return res.status(401).end();
        }
    }
};