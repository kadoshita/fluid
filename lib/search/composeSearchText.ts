import type { PostData } from '../../@types/PostData';

/**
 * Combine the human-meaningful fields of a post into a single canonical
 * string used for building `search_text` and, in turn, `search_tokens`.
 *
 * `url` is intentionally excluded — URL substring search remains served by
 * the dedicated `url` filter path in searchPosts, and mixing URLs into the
 * full-text corpus tends to pollute token statistics.
 */
export function composeSearchText(
  post: Pick<PostData, 'title' | 'description' | 'comment' | 'tag'>
): string {
  const parts: string[] = [];
  if (post.title) parts.push(post.title);
  if (post.description) parts.push(post.description);
  if (post.comment) parts.push(post.comment);
  if (post.tag && post.tag.length > 0) parts.push(post.tag.join(' '));
  return parts.join('\n');
}
