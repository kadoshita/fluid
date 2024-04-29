import { Autocomplete, Box, Button, Group, Input, Modal } from '@mantine/core';
import type { Record } from '../../libs/backend';
import { useForm } from '@mantine/form';

export function RecordEditModal({
  opened,
  data,
  categories,
  onClose,
}: {
  opened: boolean;
  data: Record;
  categories: string[];
  onClose: (modified?: Record) => void;
}) {
  const recordEditForm = useForm<Record>({
    initialValues: data,
  });
  const handleSubmit = (values: Record) => {
    onClose(values);
  };

  return (
    <Modal opened={opened} onClose={() => onClose(recordEditForm.getValues())}>
      <Box maw={340} mx="auto">
        <form onSubmit={recordEditForm.onSubmit(handleSubmit)}>
          <Input type="hidden" {...recordEditForm.getInputProps('id')} />
          <Group justify="center">
            <Input.Wrapper label="Title" style={{ width: '100%' }}>
              <Input required {...recordEditForm.getInputProps('title')} />
            </Input.Wrapper>
            <Input.Wrapper style={{ width: '100%' }}>
              <Autocomplete
                required
                data={categories}
                label="Category"
                {...recordEditForm.getInputProps('category')}
              ></Autocomplete>
            </Input.Wrapper>
            <Input.Wrapper label="URL" style={{ width: '100%' }}>
              <Input required {...recordEditForm.getInputProps('url')} />
            </Input.Wrapper>
          </Group>
          <Group justify="center" mt="md">
            <Button type="submit" variant="outline" color="gray">
              Save
            </Button>
            <Button variant="outline" color="gray" onClick={() => onClose()}>
              Cancel
            </Button>
          </Group>
        </form>
      </Box>
    </Modal>
  );
}
