import Link from 'next/link';
import { useRouter } from 'next/router';
import type React from 'react';
import type { FC } from 'react';
import type { DisplayPostData } from '../../../@types/PostData';

interface Props {
  data: DisplayPostData;
}

const ListItem: FC<Props> = ({ data }) => {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    if ((e.target as HTMLElement).tagName === 'A') {
      return;
    }
    e.preventDefault();
    router.push(`/post/${data._id}`);
  };

  const added_at = new Date(data.added_at).toLocaleString('ja-JP');
  return (
    <tr onClick={handleClick} style={{ cursor: 'pointer' }}>
      <td>{data.title}</td>
      <td>
        <Link href={`/category/${data.category}`}>{data.category}</Link>
      </td>
      <td style={{ overflowX: 'hidden', whiteSpace: 'nowrap' }}>
        <a href={data.url} target='_blank'>
          {data.url}
        </a>
      </td>
      <td>{added_at}</td>
    </tr>
  );
};

export default ListItem;
