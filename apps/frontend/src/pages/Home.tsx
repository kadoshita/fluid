import { Header } from '../components/header';
import { RecordsTable } from '../components/table/records';
import { faker } from '@faker-js/faker';
const data = new Array(100).fill(0).map(() => ({
  id: faker.string.uuid(),
  title: faker.word.words(10),
  category: faker.word.words(1),
  url: faker.internet.url(),
  addedAt: faker.date.recent(),
}));

export default function Home() {
  return <h1>Home</h1>;

  const handleEdit = (id: string) => {
    console.log('edit', id);
  };

  const handleDelete = (id: string) => {
    console.log('delete', id);
  };

  return (
    <>
      <RecordsTable data={data} onEdit={handleEdit} onDelete={handleDelete}></RecordsTable>
    </>
  );
}
