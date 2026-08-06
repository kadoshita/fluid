export interface PostData {
  title: string;
  url: string;
  category: string;
  description?: string;
  comment?: string;
  image?: string;
  tag?: string[];
}

/**
 * Fields that are populated by the search-indexing pipeline and stored on
 * every `posts` document. All optional so that documents written before the
 * search feature was introduced remain valid.
 */
export interface StoredPostSearchFields {
  search_text?: string;
  search_tokens?: string;
  search_indexed_at?: Date;
}

export interface InsertPostData extends PostData, StoredPostSearchFields {
  added_at: Date;
}
export interface DisplayPostData extends PostData {
  _id: string;
  added_at: string;
  /** MongoDB text-index score when the result came from the lexical path. */
  score?: number;
}
