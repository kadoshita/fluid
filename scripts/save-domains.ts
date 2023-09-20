import { MongoClient } from 'mongodb';

const { MONGODB_URI, MONGODB_DB } = process.env;

(async () => {
    const client = await MongoClient.connect(MONGODB_URI, {});
    const db = client.db(MONGODB_DB);

    await db.collection('domains').createIndex({ domain: 1 }, { unique: false });

    const insertData = [];

    const posts = await db.collection('posts').find().toArray();

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const { category, added_at } = post;
        const url = new URL(post.url);
        const domain = url.host;

        insertData.push({
            domain,
            category,
            added_at,
        });
    }

    await db.collection('domains').insertMany(insertData);

    await client.close();
})();
