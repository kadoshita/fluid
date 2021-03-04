import { connectToDatabase } from '../../../db/index';

export default async (req, res) => {
    if (req.method === 'GET') {
        const { db } = await connectToDatabase();
        const categories = await db.collection('posts').distinct('category');
        res.status(200).json(categories);
    }
};