import { NextApiRequest, NextApiResponse } from 'next';
import { DisplayPostData } from '../../@types/PostData';
import { PostService } from '../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const keyword: string = req.query.keyword as string;
        const category: string = req.query.category as string;
        const url: string = req.query.url as string;

        const searchByKeywordResult = await PostService.searchPosts(keyword, category, url);
        return res.status(200).json(searchByKeywordResult);
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
};
