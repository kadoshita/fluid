export interface PostData {
    title: string;
    url: string;
};

export interface InsertPostData extends PostData {
    added_at: Date;
}
export interface DisplayPostData extends InsertPostData {
    _id: string;
}