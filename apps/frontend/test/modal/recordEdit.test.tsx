import '@testing-library/jest-dom';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../utils';
import { vi } from 'vitest';
import { RecordEditModal } from '../../src/components/modal/recordEdit';
import { Record } from '../../src/libs/backend';
import { faker } from '@faker-js/faker';

describe('RecordEditModal', () => {
  it('should render', async () => {
    const data: Record = {
      id: faker.string.uuid(),
      title: faker.word.words(10),
      category: faker.word.words(1),
      url: faker.internet.url(),
      addedAt: faker.date.recent(),
    };
    const categories = [data.category, faker.word.words(1), faker.word.words(1)];
    const onClose = vi.fn();

    render(<RecordEditModal opened data={data} categories={categories} onClose={onClose}></RecordEditModal>);
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('URL')).toBeInTheDocument();

      expect(screen.getByDisplayValue(data.title)).toBeInTheDocument();
      expect(screen.getByDisplayValue(data.category)).toBeInTheDocument();
      expect(screen.getByDisplayValue(data.url)).toBeInTheDocument();
    });
  });

  it('receive modified value on close', async () => {
    const data: Record = {
      id: faker.string.uuid(),
      title: faker.word.words(10),
      category: faker.word.words(1),
      url: faker.internet.url(),
      addedAt: faker.date.recent(),
    };
    const categories = [data.category, faker.word.words(1), faker.word.words(1)];
    const onClose = vi.fn();

    render(<RecordEditModal opened data={data} categories={categories} onClose={onClose}></RecordEditModal>);

    const newTitle = faker.word.words(10);
    const newCategory = faker.word.words(1);
    const newUrl = faker.internet.url();

    await waitFor(() => {
      const title = screen.getByLabelText('Title');
      // AutocompleteはgetByLabelTextで要素を取得できないので、getByDisplayValueで取得するï
      const category = screen.getByDisplayValue(data.category);
      const url = screen.getByLabelText('URL');

      fireEvent.change(title, { target: { value: newTitle } });
      fireEvent.change(category, { target: { value: newCategory } });
      fireEvent.change(url, { target: { value: newUrl } });

      fireEvent.click(screen.getByText('Save'));
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith({
        id: data.id,
        title: newTitle,
        category: newCategory,
        url: newUrl,
        addedAt: data.addedAt,
      });
    });
  });

  it('close', async () => {
    const data: Record = {
      id: faker.string.uuid(),
      title: faker.word.words(10),
      category: faker.word.words(1),
      url: faker.internet.url(),
      addedAt: faker.date.recent(),
    };
    const categories = [data.category, faker.word.words(1), faker.word.words(1)];
    const onClose = vi.fn();

    render(<RecordEditModal opened data={data} categories={categories} onClose={onClose}></RecordEditModal>);

    const newTitle = faker.word.words(10);
    const newCategory = faker.word.words(1);
    const newUrl = faker.internet.url();

    await waitFor(() => {
      const title = screen.getByLabelText('Title');
      // AutocompleteはgetByLabelTextで要素を取得できないので、getByDisplayValueで取得するï
      const category = screen.getByDisplayValue(data.category);
      const url = screen.getByLabelText('URL');

      fireEvent.change(title, { target: { value: newTitle } });
      fireEvent.change(category, { target: { value: newCategory } });
      fireEvent.change(url, { target: { value: newUrl } });

      fireEvent.click(screen.getByText('Cancel'));
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
