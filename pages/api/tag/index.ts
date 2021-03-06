import { connectToDatabase } from '../../../db/index';

export default async (req, res) => {
    if (req.method === 'GET') {
        const { db } = await connectToDatabase();
        const tags = await db.collection('posts').distinct('tag');
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        res.status(200).json(tags);
    }
};