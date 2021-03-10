import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../db/index';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const { db } = await connectToDatabase();
        const categories = await db.collection('posts').distinct('category');
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        res.status(200).json(categories);
    }
};