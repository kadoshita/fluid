import { type AnyBulkWriteOperation, type Document, MongoClient, ObjectId } from 'mongodb';
import { composeSearchText, tokenizeForIndex } from '../lib/search';

const { MONGODB_URI, MONGODB_DB } = process.env;

type Args = { batch: number; force: boolean };

function parseArgs(argv: string[]): Args {
  const args: Args = { batch: 500, force: false };
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--batch=')) {
      const parsed = Number.parseInt(raw.slice('--batch='.length), 10);
      if (Number.isFinite(parsed) && parsed > 0) args.batch = parsed;
    } else if (raw === '--force' || raw === '--force=true') {
      args.force = true;
    }
  }
  return args;
}

(async () => {
  if (!MONGODB_URI || !MONGODB_DB) {
    console.error('MONGODB_URI and MONGODB_DB must be set');
    process.exit(1);
  }

  const { batch, force } = parseArgs(process.argv);
  const client = await MongoClient.connect(MONGODB_URI, {});
  const db = client.db(MONGODB_DB);

  // Ensure text index exists (idempotent).
  await db
    .collection('posts')
    .createIndex(
      { search_tokens: 'text' },
      { name: 'posts_search_tokens_text', default_language: 'none' }
    );

  const filter = force
    ? {}
    : {
        $or: [
          { search_tokens: { $exists: false } },
          { search_tokens: null },
          { search_tokens: '' },
        ],
      };

  const totalTarget = await db.collection('posts').countDocuments(filter);
  console.log(`backfill target: ${totalTarget} docs (force=${force}, batch=${batch})`);

  const cursor = db
    .collection('posts')
    .find(filter, {
      projection: { title: 1, description: 1, comment: 1, tag: 1 },
    })
    .batchSize(batch);

  let processed = 0;
  let updated = 0;
  let failed = 0;
  let ops: AnyBulkWriteOperation<Document>[] = [];

  const flush = async () => {
    if (ops.length === 0) return;
    try {
      const result = await db.collection('posts').bulkWrite(ops, { ordered: false });
      updated += result.modifiedCount ?? 0;
    } catch (e) {
      failed += ops.length;
      console.warn('bulkWrite failed', e);
    }
    ops = [];
  };

  for await (const doc of cursor) {
    processed++;
    const search_text = composeSearchText({
      title: doc.title,
      description: doc.description,
      comment: doc.comment,
      tag: doc.tag,
    });
    const search_tokens = tokenizeForIndex(search_text);
    ops.push({
      updateOne: {
        filter: { _id: new ObjectId(doc._id) },
        update: {
          $set: {
            search_text,
            search_tokens,
            search_indexed_at: new Date(),
          },
        },
      },
    });

    if (ops.length >= batch) {
      await flush();
      console.log(`  processed ${processed}/${totalTarget} (updated=${updated})`);
    }
  }

  await flush();

  console.log(`done: processed=${processed} updated=${updated} failed=${failed}`);

  await client.close();
})();
