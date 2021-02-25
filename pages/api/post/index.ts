import { PostData } from "../../../@types/PostData";

const TOKEN = 'fuga';

const ListData: PostData[] = [
    { id: 1, title: 'Google', url: 'https://www.google.com/', added_at: '2021/2/24 17:41:27' },
    { id: 2, title: 'mstdn.sublimer.me - あすてろいどん', url: 'https://mstdn.sublimer.me/about', added_at: '2021/2/24 17:41:40' }
];

export default (req, res) => {
    if (req.method === 'GET') {
        res.status(200).json(ListData);
    } else if (req.method === 'POST') {
        if (req.headers['authorization'] && req.headers['authorization'] === `Bearer ${TOKEN}`) {
            res.status(200).end();
        } else {
            res.status(401).end();
        }
    }
};