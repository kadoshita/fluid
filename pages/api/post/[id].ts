import { ObjectId } from "mongodb";
import { DisplayPostData } from "../../../@types/PostData";
import { connectToDatabase } from "../../../db";

export default async (req, res) => {
    try {
        const { id } = req.query;
        if(id.length!=24){
            return res.status(400).end();
        }
        const oid = new ObjectId(id);
        const { db } = await connectToDatabase();
        const post: DisplayPostData = await db.collection('posts').findOne({ _id: oid });
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