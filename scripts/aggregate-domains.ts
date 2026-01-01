import { MongoClient } from 'mongodb';

const { MONGODB_URI, MONGODB_DB } = process.env;

(async () => {
  const client = await MongoClient.connect(MONGODB_URI, {});
  const db = client.db(MONGODB_DB);

  await db.collection('domains').createIndex({ domain: 1 }, { unique: false });

  const counts = new Map<string, Map<string, number>>();

  const posts = await db.collection('posts').find().toArray();

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const { category } = post;
    const url = new URL(post.url);
    const domain = url.host;

    const countByDomain = counts.get(domain);
    if (countByDomain === undefined) {
      const m = new Map<string, number>([[category, 1]]);
      counts.set(domain, m);
    } else {
      const countByCategory = countByDomain.get(category);
      if (countByCategory === undefined) {
        countByDomain.set(category, 1);
      } else {
        countByDomain.set(category, countByCategory + 1);
      }
    }
  }

  counts.forEach((v, k) => {
    v.forEach((v2, k2) => {
      if (v2 > 1) console.log(`${k} ${k2} ${v2}`);
    });
  });

  await client.close();
})();
