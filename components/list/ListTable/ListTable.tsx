import React, { FC } from "react";
import { Table } from "react-bootstrap";
import { IListData } from "../../../pages";
import ListItem from "../ListItem";

interface Props {
    data: IListData[];
};

const ListTable: FC<Props> = ({ data }) => {
    return (
        <Table striped bordered hover variant="dark">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Title</th>
                    <th>URL</th>
                    <th>Added at</th>
                </tr>
            </thead>
            <tbody>
                {data.map((d, i) => <ListItem key={i} data={d}></ListItem>)}
            </tbody>
        </Table>
    );
};

export default ListTable;