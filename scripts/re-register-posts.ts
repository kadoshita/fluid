import { MongoClient } from 'mongodb';
import { DisplayPostData, InsertPostData } from '../@types/PostData';
import { writeFile } from 'fs/promises';

const { MONGODB_URI, MONGODB_DB } = process.env;

(async () => {
    const client = await MongoClient.connect(MONGODB_URI, {});
    const db = client.db(MONGODB_DB);

    const posts = await db.collection<DisplayPostData>('posts').find().toArray();

    await db.dropCollection('posts');
    console.log('drop collection posts');

    await db.createCollection('posts');
    console.log('create collection posts');

    await db.collection('posts').createIndex({ url: 1 }, { unique: true });
    console.log('create index url');

    const failedPosts: { error: Error; data: InsertPostData }[] = [];
    let dupCount = 0;
    for (let i = 0; i < posts.length; i++) {
        try {
            await db.collection<DisplayPostData>('posts').insertOne({
                ...posts[i],
                added_at: posts[i].added_at!,
            });
        } catch (e) {
            if (e.code === 11000) {
                console.info('duplicate key error', i);
                dupCount++;
                continue;
            }
            failedPosts.push({
                error: e,
                data: posts[i],
            });
            console.warn(`failed to insert ${i}th post`, e);
        }
    }

    console.log({ dupCount });

    await writeFile('failed.json', JSON.stringify(failedPosts), {
        encoding: 'utf-8',
    });

    await client.close();
})();
