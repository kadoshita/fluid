import { NextApiRequest, NextApiResponse } from "next";
import { DisplayPostData } from "../../../@types/PostData";
import { connectToDatabase } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { tag } = req.query;
        const { db } = await connectToDatabase();

        const now = new Date();
        const before7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        const latest24hPosts: DisplayPostData[] = await db.collection('posts').find({
            "added_at": {
                "$gte": before7d,
                "$lt": now
            },
            "tag": {
                "$in": [tag]
            }
        }).sort({ added_at: -1 }).toArray();

        if (latest24hPosts) {
            return res.status(200).json(latest24hPosts);
        } else {
            return res.status(404).end();
        }
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};