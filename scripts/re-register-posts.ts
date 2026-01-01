import { writeFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import type { InsertPostData } from '../@types/PostData';

const { MONGODB_URI, MONGODB_DB } = process.env;

(async () => {
  const client = await MongoClient.connect(MONGODB_URI, {});
  const db = client.db(MONGODB_DB);

  const posts = await db.collection('posts').find().toArray();

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
      const { _id, ...postData } = posts[i];
      await db.collection('posts').insertOne({
        ...postData,
        added_at:
          postData.added_at instanceof Date ? postData.added_at : new Date(postData.added_at),
      });
    } catch (e) {
      if (e.code === 11000) {
        console.info('duplicate key error', i);
        dupCount++;
        continue;
      }
      const { _id, ...postData } = posts[i];
      failedPosts.push({
        error: e,
        data: {
          ...postData,
          added_at:
            postData.added_at instanceof Date ? postData.added_at : new Date(postData.added_at),
        } as InsertPostData,
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
