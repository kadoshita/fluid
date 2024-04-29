import { useSession } from '../hooks/useSession';
import { RecordsTable } from '../components/table/records';
import { faker } from '@faker-js/faker';
import { RecordEditModal } from '../components/modal/recordEdit';
import { useState } from 'react';
import { Record } from '../libs/backend';
import { useDisclosure } from '@mantine/hooks';

const data = new Array(100).fill(0).map(() => ({
  id: faker.string.uuid(),
  title: faker.word.words(10),
  category: faker.word.words(1),
  url: faker.internet.url(),
  addedAt: faker.date.recent(),
}));

export default function Home() {
  const [session] = useSession();
  const [recordEditModalOpened, { open, close }] = useDisclosure(false);
  const [currentRecord, setCurrentRecord] = useState<Record>(data[0]);

  const handleEdit = (id: string) => {
    console.log('edit', id);
    setCurrentRecord(data.find((record) => record.id === id)!);
    open();
  };

  const handleDelete = (id: string) => {
    console.log('delete', id);
  };

  const handleRecordEditModalClose = (modified?: Record) => {
    console.log('close', modified);
    close();
  };

  return (
    <>
      <RecordsTable data={data} onEdit={handleEdit} onDelete={handleDelete}></RecordsTable>
      <RecordEditModal
        opened={recordEditModalOpened}
        data={currentRecord}
        categories={[...new Set(data.map((d) => d.category))]}
        onClose={handleRecordEditModalClose}
      ></RecordEditModal>
    </>
  );
}
