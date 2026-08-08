import type { NextApiRequest, NextApiResponse } from 'next';
import { PostService } from '../../lib/services';

function parseLimit(raw: unknown): number | undefined {
  if (typeof raw !== 'string' || raw === '') return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(1, Math.min(100, parsed));
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const keyword: string = (req.query.keyword as string) ?? '';
    const category: string = (req.query.category as string) ?? '';
    const url: string = (req.query.url as string) ?? '';
    const limit = parseLimit(req.query.limit);
    const disableLexical = req.query.nolexical === '1';

    const searchByKeywordResult = await PostService.searchPosts(keyword, category, url, {
      ...(limit !== undefined ? { limit } : {}),
      ...(disableLexical ? { disableLexical: true } : {}),
    });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
    return res.status(200).json(searchByKeywordResult);
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
