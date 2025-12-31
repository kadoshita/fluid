import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import { DisplayPostData } from '../../../@types/PostData';
import ListItem from '../ListItem';

interface Props {
  data: DisplayPostData[];
}

const ListTable: FC<Props> = ({ data }) => {
  return (
    <Table striped bordered hover variant='dark' style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>URL</th>
          <th>Added at</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <ListItem key={i} data={d}></ListItem>
        ))}
      </tbody>
    </Table>
  );
};

export default ListTable;
