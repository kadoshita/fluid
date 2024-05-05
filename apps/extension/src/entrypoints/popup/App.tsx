import { Box, TextInput, Group, Button, MantineProvider, Textarea, Image, Input } from '@mantine/core';
import '@mantine/core/styles.css';
import './App.css';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { SignupOauthForm } from './components/form/signupOauth';
import { useOauth } from './hooks/useOauth';
import { Provider } from '../background';

type Record = {
  title: string;
  url: string;
  category: string;
  description: string;
  image?: string;
  comment?: string;
};

const getPageInfo = () => {
  const title = document.title;
  const url = document.location.href;
  const meta = Array.from(document.getElementsByTagName('meta'));
  const description =
    meta.find((m) => m.getAttribute('property') === 'og:description')?.getAttribute('content') ||
    meta.find((m) => m.getAttribute('name') === 'description')?.getAttribute('content') ||
    '';
  const image =
    meta.find((m) => m.getAttribute('property') === 'og:image')?.getAttribute('content') ||
    meta.find((m) => m.getAttribute('name') === 'image')?.getAttribute('content') ||
    '';
  const pageInfo = {
    title,
    url,
    description,
    image,
  };
  return pageInfo;
};

function App() {
  const form = useForm<Record>({
    mode: 'uncontrolled',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [accessToken, getAccessToken, signupWithOAuth] = useOauth();

  useEffect(() => {
    getAccessToken();
    (async () => {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      const [res] = await browser.scripting.executeScript({
        target: { tabId: tab.id || 0, allFrames: true },
        func: getPageInfo,
        injectImmediately: true,
      });
      form.setFieldValue('title', res.result?.title ?? '');
      form.setFieldValue('url', res.result?.url ?? '');
      form.setFieldValue('description', res.result?.description ?? '');
      form.setFieldValue('image', res.result?.image ?? '');
      setImageUrl(res.result?.image ?? '');
    })();
  }, []);

  const handleSubmit = (values: { provider: Provider }) => {
    switch (values.provider) {
      case 'github':
      case 'google':
        signupWithOAuth(values.provider);
        break;
    }
  };

  return (
    <MantineProvider>
      {accessToken ? (
        <Box maw={340} mx="auto">
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <TextInput
              withAsterisk
              required
              label="Title"
              placeholder="title"
              radius="sm"
              key={form.key('title')}
              {...form.getInputProps('title')}
            />
            <TextInput
              withAsterisk
              required
              label="URL"
              placeholder="url"
              radius="sm"
              key={form.key('url')}
              {...form.getInputProps('url')}
            />
            <TextInput
              withAsterisk
              required
              label="Category"
              placeholder="categoy"
              radius="sm"
              key={form.key('categoy')}
              {...form.getInputProps('categoy')}
            />
            <Textarea
              label="Description"
              placeholder="description"
              rows={5}
              radius="sm"
              key={form.key('description')}
              {...form.getInputProps('description')}
            />
            <Input type="hidden" key={form.key('image')} {...form.getInputProps('image')}></Input>
            <Image style={{ marginTop: '8px' }} radius="sm" src={imageUrl} />
            <Textarea
              label="Comment"
              placeholder="comment"
              maxLength={140}
              rows={5}
              radius="sm"
              key={form.key('comment')}
              {...form.getInputProps('comment')}
            />

            <Group justify="flex-end" mt="md" mb="md">
              <Button fullWidth type="submit">
                Submit
              </Button>
            </Group>
          </form>
        </Box>
      ) : (
        <SignupOauthForm handleSubmit={handleSubmit} />
      )}
    </MantineProvider>
  );
}

export default App;
