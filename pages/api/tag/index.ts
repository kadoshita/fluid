import { NextApiRequest, NextApiResponse } from 'next';
import { TagService } from '../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const tags = await TagService.getAllTags();
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        res.status(200).json(tags);
    }
};