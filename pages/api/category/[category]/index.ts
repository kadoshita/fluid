import type { NextApiRequest, NextApiResponse } from 'next';
import { PostService } from '../../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { category } = req.query;
    const latest7dPosts = await PostService.getLatest7dPostsByCategory(category as string);

    if (latest7dPosts) {
      return res.status(200).json(latest7dPosts);
    } else {
      return res.status(404).end();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
