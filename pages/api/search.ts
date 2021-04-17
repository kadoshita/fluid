import { NextApiRequest, NextApiResponse } from "next";
import { DisplayPostData } from "../../@types/PostData";
import { connectToDatabase } from "../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const keyword: string = req.query.keyword as string;
        const category: string = req.query.category as string;
        const url: string = req.query.url as string;
        const { db } = await connectToDatabase();

        const keywordRegexp = new RegExp(keyword, 'i');
        const urlRegexp = new RegExp(url, 'i');
        const findQuery = {
            $and: [
                {
                    $or: [
                        { title: keywordRegexp },
                        { description: keywordRegexp }
                    ]
                },
                (category === '') ? {} : { category: category },
                (url === '') ? {} : { url: urlRegexp }
            ]
        };
        const searchByKeywordResult: DisplayPostData[] = await db.collection('posts').find(findQuery).sort({ added_at: -1 }).limit(30).toArray();
        return res.status(200).json(searchByKeywordResult);
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};