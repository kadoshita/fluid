import { PostData } from "../../../@types/PostData";

const ListData: PostData[] = [
    { id: 1, title: 'Google', url: 'https://www.google.com/', added_at: '2021/2/24 17:41:27' },
    { id: 2, title: 'mstdn.sublimer.me - あすてろいどん', url: 'https://mstdn.sublimer.me/about', added_at: '2021/2/24 17:41:40' }
];

export default (req, res) => {
    const { id } = req.query;
    const _id = parseInt(id, 10);
    const post = ListData.find(d => d.id === _id) || [];
    res.status(200).json(post);
};