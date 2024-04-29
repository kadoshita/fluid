import cx from 'clsx';
import { useState } from 'react';
import { Table, ScrollArea, ActionIcon } from '@mantine/core';
import classes from './records.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Record } from '../../libs/backend';

export function RecordsTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Record[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>{row.title}</Table.Td>
      <Table.Td>{row.category}</Table.Td>
      <Table.Td>
        <a href={row.url} target="_blang" rel="noopener noreferrer">
          {row.url}
        </a>
      </Table.Td>
      <Table.Td>{row.addedAt.toLocaleString()}</Table.Td>
      <Table.Td>
        <ActionIcon variant="default" color="gray" component="button" onClick={() => onEdit(row.id)}>
          <IconEdit></IconEdit>
        </ActionIcon>
      </Table.Td>
      <Table.Td>
        <ActionIcon variant="default" color="red" component="button" onClick={() => onDelete(row.id)}>
          <IconTrash></IconTrash>
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea className={classes.scrollArea} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>URL</Table.Th>
            <Table.Th>Added at</Table.Th>
            <Table.Th>
              <IconEdit></IconEdit>
            </Table.Th>
            <Table.Th>
              <IconTrash></IconTrash>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
