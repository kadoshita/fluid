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
        language: 'ja'
    });

    const { db } = await connectToDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = (new Date(now.getTime() + (24 * 60 * 60 * 1000))).toISOString().split('T')[0];

    const todayPosts: DisplayPostData[] = await db.collection('posts').find({
        "added_at": {
            "$gte": new Date(`${today}T00:00:00+09:00`),
            "$lt": new Date(`${tomorrow}T00:00:00+09:00`)
        }
    }).toArray();

    todayPosts.forEach(post => {
        feed.item({
            title: `fluid - ${post.title}`,
            description: post.description,
            date: new Date(post.added_at),
            url: `${url}/post/${post._id}`
        });
    });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Type', 'text/xml');
    res.send(feed.xml());
};