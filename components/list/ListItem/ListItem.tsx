import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { IListData } from '../../../pages';

interface Props {
    data: IListData;
};

const ListItem: FC<Props> = ({ data }) => {
    const router = useRouter();
    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        router.push(`/post/${data.id}`);
    };

    return (
        <tr onClick={handleClick} style={{ cursor: 'pointer' }}>
            <td>{data.id}</td>
            <td>{data.title}</td>
            <td><a href={data.url}>{data.url}</a></td>
            <td>{data.added_at}</td>
        </tr>
    );
};

export default ListItem;