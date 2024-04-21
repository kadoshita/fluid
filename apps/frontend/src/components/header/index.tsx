import { Group, Button, Box, ActionIcon } from '@mantine/core';
import classes from './index.module.css';
import { Link, useLocation } from 'wouter';
import { IconBrandBluesky, IconBrandGithub, IconBrandMastodon, IconBrandTwitter } from '@tabler/icons-react';
import { useSession } from '../../hooks/useSession';

export function Header() {
  const [location, setLocation] = useLocation();
  const [session] = useSession();

  return (
    <Box>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group h="100%" gap={0} visibleFrom="sm">
            <Link href="/home" className={classes.link}>
              Home
            </Link>
            <Link href="/search" className={classes.link}>
              Search
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <ActionIcon
              variant="default"
              color="gray"
              component="a"
              href="https://twitter.com/fluid_share"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandTwitter></IconBrandTwitter>
            </ActionIcon>
            <ActionIcon
              variant="default"
              color="gray"
              component="a"
              href="https://mstdn.sublimer.me/@fluid"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandMastodon></IconBrandMastodon>
            </ActionIcon>
            <ActionIcon
              variant="default"
              color="gray"
              component="a"
              href="https://bsky.app/profile/fluid.sublimer.me"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandBluesky></IconBrandBluesky>
            </ActionIcon>
            <ActionIcon
              variant="default"
              color="gray"
              component="a"
              href="https://github.com/kadoshita/fluid"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithub></IconBrandGithub>
            </ActionIcon>
            {session ? (
              <Button variant="light" color='red' onClick={() => setLocation('/logout')}>
                Log out
              </Button>
            ) : (
              <>
                <Button variant="default" onClick={() => setLocation('/login')}>
                  Log in
                </Button>
                <Button onClick={() => setLocation('/signup')}>Sign up</Button>
              </>
            )}
          </Group>
        </Group>
      </header>
    </Box>
  );
}
