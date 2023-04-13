import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../db/index';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { db } = await connectToDatabase();
    const count = await db.collection('posts').countDocuments();
    res.status(200).json({ db: { records: count } });
};
