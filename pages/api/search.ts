import { NextApiRequest, NextApiResponse } from 'next';
import { DisplayPostData } from '../../@types/PostData';
import { connectToDatabase } from '../../db';
import { Filter } from 'mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const keyword: string = req.query.keyword as string;
        const category: string = req.query.category as string;
        const url: string = req.query.url as string;
        const { db } = await connectToDatabase();

        const keywordList = keyword.split(/\s+/);
        const keywordQueries: Filter<DisplayPostData>[] = keywordList.map((word) => {
            const keywordRegexp = new RegExp(word, 'i');
            return {
                title: {
                    $regex: keywordRegexp,
                },
                description: {
                    $regex: keywordRegexp,
                },
            };
        });

        const urlRegexp = new RegExp(url, 'i');
        const findQuery: Filter<DisplayPostData> = {
            $and: [
                ...keywordQueries,
                category === '' ? {} : { category: category },
                url === '' ? {} : { url: urlRegexp },
            ],
        };
        const searchByKeywordResult = await db
            .collection<DisplayPostData>('posts')
            .find(findQuery)
            .sort({ added_at: -1 })
            .limit(30)
            .toArray();
        return res.status(200).json(searchByKeywordResult);
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};
