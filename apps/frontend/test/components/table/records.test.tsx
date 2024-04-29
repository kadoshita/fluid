import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../utils';
import { vi } from 'vitest';
import { RecordsTable } from '../../../src/components/table/records';
import { Record } from '../../../src/libs/backend';
import { faker } from '@faker-js/faker';

describe('RecordsTable', () => {
  it('should render', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const data: Record[] = [
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
    ];
    render(<RecordsTable data={data} onEdit={onEdit} onDelete={onDelete}></RecordsTable>);
    await waitFor(() => {
      expect(screen.getByText(data[0].title)).toBeInTheDocument();
      expect(screen.getByText(data[0].category)).toBeInTheDocument();
      expect(screen.getByText(data[0].url)).toBeInTheDocument();
      expect(screen.getByText(data[0].addedAt.toLocaleString())).toBeInTheDocument();

      expect(screen.getByText(data[1].title)).toBeInTheDocument();
      expect(screen.getByText(data[1].category)).toBeInTheDocument();
      expect(screen.getByText(data[1].url)).toBeInTheDocument();
      expect(screen.getByText(data[1].addedAt.toLocaleString())).toBeInTheDocument();

      expect(screen.getByText(data[2].title)).toBeInTheDocument();
      expect(screen.getByText(data[2].category)).toBeInTheDocument();
      expect(screen.getByText(data[2].url)).toBeInTheDocument();
      expect(screen.getByText(data[2].addedAt.toLocaleString())).toBeInTheDocument();
    });
  });

  it('should onEdit call', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const data: Record[] = [
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
    ];
    render(<RecordsTable data={data} onEdit={onEdit} onDelete={onDelete}></RecordsTable>);
    await waitFor(() => {
      expect(screen.getByText(data[0].title)).toBeInTheDocument();
      expect(screen.getByText(data[0].category)).toBeInTheDocument();
      expect(screen.getByText(data[0].url)).toBeInTheDocument();
      expect(screen.getByText(data[0].addedAt.toLocaleString())).toBeInTheDocument();

      expect(screen.getByText(data[1].title)).toBeInTheDocument();
      expect(screen.getByText(data[1].category)).toBeInTheDocument();
      expect(screen.getByText(data[1].url)).toBeInTheDocument();
      expect(screen.getByText(data[1].addedAt.toLocaleString())).toBeInTheDocument();

      expect(screen.getByText(data[2].title)).toBeInTheDocument();
      expect(screen.getByText(data[2].category)).toBeInTheDocument();
      expect(screen.getByText(data[2].url)).toBeInTheDocument();
      expect(screen.getByText(data[2].addedAt.toLocaleString())).toBeInTheDocument();
    });

    screen.getAllByRole('button')[0].click();

    expect(onEdit).toHaveBeenCalledWith(data[0].id);
  });

  it('should onDelete call', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const data: Record[] = [
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        title: faker.word.words(10),
        category: faker.word.words(1),
        url: faker.internet.url(),
        addedAt: faker.date.recent(),
      },
    ];
    render(<RecordsTable data={data} onEdit={onEdit} onDelete={onDelete}></RecordsTable>);
    await waitFor(() => {
      expect(screen.getByText(data[0].title)).toBeInTheDocument();
      expect(screen.getByText(data[0].category)).toBeInTheDocument();
      expect(screen.getByText(data[0].url)).toBeInTheDocument();
      expect(screen.getByText(data[0].addedAt.toLocaleString())).toBeInTheDocument();

      expect(screen.getByText(data[1].title)).toBeInTheDocument();
      expect(screen.getByText(data[1].category)).toBeInTheDocument();
      expect(screen.getByText(data[1].url)).toBeInTheDocument();
      expect(screen.getByText(data[1].addedAt.toLocaleString())).toBeInTheDocument();

      expect(screen.getByText(data[2].title)).toBeInTheDocument();
      expect(screen.getByText(data[2].category)).toBeInTheDocument();
      expect(screen.getByText(data[2].url)).toBeInTheDocument();
      expect(screen.getByText(data[2].addedAt.toLocaleString())).toBeInTheDocument();
    });

    screen.getAllByRole('button')[1].click();

    expect(onDelete).toHaveBeenCalledWith(data[0].id);
  });
});
