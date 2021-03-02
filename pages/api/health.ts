import { connectToDatabase } from '../../db/index';

export default async (req, res) => {
    const { client } = await connectToDatabase();
    const isConnected = await client.isConnected();
    res.status(200).json({ db: isConnected });
};