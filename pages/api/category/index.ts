import type { NextApiRequest, NextApiResponse } from 'next';
import { CategoryService } from '../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { domain } = req.query;
    const categories = await CategoryService.getCategoriesWithDomainFrequency(
      typeof domain === 'string' ? domain : undefined
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.status(200).json(categories);
  }
};
