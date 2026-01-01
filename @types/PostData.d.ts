export interface PostData {
  title: string;
  url: string;
  category: string;
  description?: string;
  comment?: string;
  image?: string;
  tag?: string[];
}

export interface InsertPostData extends PostData {
  added_at: Date;
}
export interface DisplayPostData extends PostData {
  _id: string;
  added_at: string;
}
