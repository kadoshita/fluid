import type { NextApiRequest, NextApiResponse } from 'next';
import { PostService } from '../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  if (req.method === 'GET') {
    const latest24hPosts = await PostService.getLatest24hPosts();
    res.status(200).json(latest24hPosts);
  } else if (req.method === 'POST') {
    if (
      req.headers['authorization'] &&
      req.headers['authorization'] === `Bearer ${process.env.API_TOKEN}`
    ) {
      try {
        await PostService.createPost(req.body);
        return res.status(200).end();
      } catch (e) {
        console.error(e);
        return res.status(500).end();
      }
    } else {
      return res.status(401).end();
    }
  } else if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
};
