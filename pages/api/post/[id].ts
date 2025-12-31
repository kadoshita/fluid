import { NextApiRequest, NextApiResponse } from 'next';
import { PostService } from '../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        if (typeof id !== 'string' || id.length !== 24) {
            return res.status(400).end();
        }
        
        const post = await PostService.getPostById(id);
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
