import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../db/index';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const { db } = await connectToDatabase();
        const categories = await db.collection('posts').distinct('category');

        const { domain } = req.query;
        if (typeof domain === 'string' && domain !== '') {
            const results = await db
                .collection('domains')
                .aggregate([
                    {
                        $match: {
                            domain: domain,
                        },
                    },
                    {
                        $group: {
                            _id: '$category',
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: {
                            count: -1,
                        },
                    },
                ])
                .toArray();

            if (results.length === 0) {
                // Chrome拡張機能では、カテゴリーの入力欄に、デフォルトで配列の先頭の要素が入るような仕様になっている
                // したがって、これまで登録されていないdomainについてChrome拡張機能で登録しようとした際に、常に先頭のカテゴリーが入力欄に入ってしまう
                // これをその都度消して選択し直すのは面倒なので、そのケースにおいてはレスポンスの先頭の要素を空文字列にする
                // これによって、デフォルトで入るのは空文字列となり、datalist要素で全選択肢が表示されるため、選択肢を選びやすくなる
                categories.unshift('');
            } else {
                categories.sort((a, b) => {
                    const countA = results.find((r) => r._id === a)?.count || 0;
                    const countB = results.find((r) => r._id === b)?.count || 0;
                    return countB - countA;
                });
            }
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.status(200).json(categories);
    }
};
