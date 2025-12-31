import { NextApiRequest, NextApiResponse } from 'next';
import { PostService } from '../../lib/services';
import { version } from '../../package.json';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const count = await PostService.getPostCount();
    res.status(200).json({ db: { records: count }, version });
};
