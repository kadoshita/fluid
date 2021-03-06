import { DisplayPostData } from "../../../@types/PostData";
import { connectToDatabase } from "../../../db";

export default async (req, res) => {
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
        }).toArray();
        const sortedPosts = latest24hPosts.sort((a, b) => b.added_at.getTime() - a.added_at.getTime());

        if (sortedPosts) {
            return res.status(200).json(sortedPosts);
        } else {
            return res.status(404).end();
        }
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};