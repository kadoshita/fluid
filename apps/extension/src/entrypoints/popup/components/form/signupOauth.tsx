import { Box, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';

export function SignupOauthForm({
  handleSubmit,
}: {
  handleSubmit: (values: { provider: 'github' | 'google' }) => void;
}) {
  const githubSignupForm = useForm<{ provider: 'github' }>({
    initialValues: { provider: 'github' },
  });
  const googleSignupForm = useForm<{ provider: 'google' }>({
    initialValues: { provider: 'google' },
  });

  return (
    <Box maw={340} mx="auto" mb="md">
      <form onSubmit={githubSignupForm.onSubmit(handleSubmit)}>
        <Group justify="center" mt="md">
          <Button fullWidth color="dark" type="submit" leftSection={<IconBrandGithub></IconBrandGithub>}>
            GitHub
          </Button>
        </Group>
      </form>

      <form onSubmit={googleSignupForm.onSubmit(handleSubmit)}>
        <Group justify="center" mt="md">
          <Button fullWidth color="blue" type="submit" leftSection={<IconBrandGoogle></IconBrandGoogle>}>
            Google
          </Button>
        </Group>
      </form>
    </Box>
  );
}
