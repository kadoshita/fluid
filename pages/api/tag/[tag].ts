import { NextApiRequest, NextApiResponse } from 'next';
import { DisplayPostData } from '../../../@types/PostData';
import { TagService } from '../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { tag } = req.query;
        const latest24hPosts = await TagService.getLatest7dPostsByTag(tag as string);

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
