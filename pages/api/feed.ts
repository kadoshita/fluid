import { NextApiRequest, NextApiResponse } from "next";
import RSS from 'rss';
import { DisplayPostData } from "../../@types/PostData";
import { connectToDatabase } from "../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const url = 'https://fluid-portal.azurewebsites.net';
    const feed = new RSS({
        title: 'fluid',
        description: 'An application for Web clipping and sharing.',
        site_url: url,
        feed_url: `${url}/api/feed`,
        language: 'ja',
        ttl: 60
    });

    const { db } = await connectToDatabase();
    const now = new Date();
    const before24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const latest24hPosts: DisplayPostData[] = await db.collection('posts').find({
        "added_at": {
            "$gte": before24h,
            "$lt": now
        }
    }).toArray();
    const sortedPosts = latest24hPosts.sort((a, b) => b.added_at.getTime() - a.added_at.getTime());

    sortedPosts.forEach(post => {
        feed.item({
            title: `fluid - ${post.title}`,
            description: post.description,
            date: new Date(post.added_at),
            url: `${url}/post/${post._id}`
        });
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'text/xml');
    res.send(feed.xml());
};