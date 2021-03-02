import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { DisplayPostData } from '../../../@types/PostData';

interface Props {
    data: DisplayPostData;
};

const ListItem: FC<Props> = ({ data }) => {
    const router = useRouter();
    const handleClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        if ((e.target as HTMLElement).tagName === 'A') {
            return;
        }
        e.preventDefault();
        router.push(`/post/${data._id}`);
    };

    return (
        <tr onClick={handleClick} style={{ cursor: 'pointer' }}>
            <td>{data.title}</td>
            <td><a href={data.url} target="_blank">{data.url}</a></td>
            <td>{data.added_at}</td>
        </tr>
    );
};

export default ListItem;