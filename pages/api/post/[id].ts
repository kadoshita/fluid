import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        if (id.length != 24) {
            return res.status(400).end();
        }
        const oid = new ObjectId(id.toString());
        const { db } = await connectToDatabase();
        const post = await db.collection('posts').findOne({ _id: oid });
        if (post) {
            return res.status(200).json(post);
        } else {
            return res.status(404).end();
        }
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};
