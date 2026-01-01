import type { NextApiRequest, NextApiResponse } from 'next';
import RSS from 'rss';
import { PostService } from '../../../../lib/services';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { category } = req.query;
    const url = 'https://fluid.sublimer.me';
    const feed = new RSS({
      title: `fluid - ${category}`,
      description: 'An application for Web clipping and sharing.',
      site_url: `${url}/category/${category}`,
      feed_url: `${url}/api/category/${category}/feed`,
      language: 'ja',
      ttl: 60,
    });

    const latest24hPosts = await PostService.getLatest24hPostsByCategory(category as string);

    latest24hPosts.forEach((post) => {
      feed.item({
        title: `fluid - ${post.title}`,
        description: post.description,
        date: new Date(post.added_at),
        url: `${url}/post/${post._id}`,
        enclosure: {
          url: post.image ? post.image : 'https://fluid.sublimer.me/logo.png',
        },
      });
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'text/xml');
    res.send(feed.xml());
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
