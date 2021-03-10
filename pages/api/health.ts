import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../db/index';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { client } = await connectToDatabase();
    const isConnected = await client.isConnected();
    res.status(200).json({ db: isConnected });
};