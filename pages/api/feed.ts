import { NextApiRequest, NextApiResponse } from 'next';
import RSS from 'rss';
import { DisplayPostData } from '../../@types/PostData';
import { connectToDatabase } from '../../db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const url = 'https://fluid.sublimer.me';
    const feed = new RSS({
        title: 'fluid',
        description: 'An application for Web clipping and sharing.',
        site_url: url,
        feed_url: `${url}/api/feed`,
        language: 'ja',
        ttl: 60,
    });

    const { db } = await connectToDatabase();
    const now = new Date();
    const before24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const latest24hPosts = await db
        .collection<DisplayPostData>('posts')
        .find({
            added_at: {
                $gte: before24h,
                $lt: now,
            },
        })
        .sort({ added_at: -1 })
        .toArray();

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
};
