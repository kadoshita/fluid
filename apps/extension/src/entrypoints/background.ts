import qs from 'qs';
import { createClient } from '@supabase/supabase-js';
import type { Provider as SupabaseProvider } from '@supabase/supabase-js';

export type Provider = Extract<SupabaseProvider, 'github' | 'google'>;

export type SigninMessage = {
  action: 'signin';
  payload: {
    provider: Provider;
  };
};
export type SigninResponse = {
  action: 'signin';
  payload:
    | {
        accessToken: string;
      }
    | {
        error: any;
      };
};

export type GetAccessTokenMessage = {
  action: 'getAccessToken';
};

export type GetAccessTokenResponse = {
  action: 'getAccessToken';
  payload:
    | {
        accessToken?: string;
      }
    | {
        error: any;
      };
};

export const SUPABASE_SECRETS_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  EXPIRES_AT: 'expiresAt',
};

type CallbackQuery = {
  access_token: string;
  expires_at: string;
  expires_in: string;
  provider_token: string;
  refresh_token: string;
  token_type: string;
};

async function signin(provider: Provider) {
  console.info('signin start', { provider });
  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL ?? '', import.meta.env.VITE_SUPABASE_API_KEY ?? '');
  const { expiresAt, accessToken, refreshToken } = await browser.storage.local.get([
    SUPABASE_SECRETS_KEYS.EXPIRES_AT,
    SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
    SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
  ]);
  console.debug('getAccessToken:', {
    accessToken: accessToken !== '' ? accessToken !== undefined : false,
    expiresAt,
    refreshToken: refreshToken !== '' ? refreshToken !== undefined : false,
  });
  if (!accessToken) {
    try {
      console.debug('accessToken not found. signin with OAuth');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) {
        console.error(error);
        return { action: 'signin', payload: { error } };
      }
      console.debug(`authTab url: ${data.url}`);

      const authTab = await browser.tabs.create({
        url: data.url!,
        active: true,
      });

      const query = await new Promise<CallbackQuery>((resolve, reject) => {
        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
          if (tabId !== authTab.id) return;

          const url = new URL(tab.url!);
          if (changeInfo.status === 'complete' && url.origin === import.meta.env.VITE_FLUID_URL) {
            if (!url.hash || url.hash === '') {
              reject(`hash not found. hash: ${url.hash}`);
              return;
            }

            const queryRaw = qs.parse(url.hash.replace('#', ''));
            if (
              'access_token' in queryRaw &&
              typeof queryRaw.access_token === 'string' &&
              'expires_at' in queryRaw &&
              typeof queryRaw.expires_at === 'string' &&
              'expires_in' in queryRaw &&
              typeof queryRaw.expires_in === 'string' &&
              'provider_token' in queryRaw &&
              typeof queryRaw.provider_token === 'string' &&
              'refresh_token' in queryRaw &&
              typeof queryRaw.refresh_token === 'string' &&
              'token_type' in queryRaw &&
              typeof queryRaw.token_type === 'string'
            ) {
              console.debug('callback query:', {
                access_token: queryRaw.access_token !== '' ? queryRaw.access_token !== undefined : false,
                expires_at: queryRaw.expires_at,
                expires_in: queryRaw.expires_in,
                provider_token: queryRaw.provider_token !== '' ? queryRaw.provider_token !== undefined : false,
                refresh_token: queryRaw.refresh_token !== '' ? queryRaw.refresh_token !== undefined : false,
                token_type: queryRaw.token_type,
              });
              resolve(queryRaw as CallbackQuery);
            } else {
              reject(`query not found. queryKeys: ${Object.keys(queryRaw).join(', ')}`);
            }
          }
        });
      });

      await browser.storage.local.set({
        [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: query.access_token,
        [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: query.refresh_token,
        [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Number(query.expires_at),
      });
      console.debug('signin success');

      return { action: 'signin', payload: { accessToken: query.access_token } };
    } catch (error) {
      console.error('signing failed', provider, error);
      return { action: 'signin', payload: { error } };
    }
  } else if (expiresAt <= Math.ceil(Date.now() / 1000)) {
    console.debug('accessToken expired. refresh session', {
      expiresAt,
      now: Math.ceil(Date.now() / 1000),
    });
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) {
      console.error(error);
      return { action: 'signin', payload: { error } };
    }
    if (!data.session) {
      console.error('session not found');
      return { action: 'signin', payload: { error: new Error('session not found') } };
    }
    await browser.storage.local.set({
      [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: data.session.access_token,
      [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: data.session.refresh_token,
      [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Number(data.session.expires_at),
    });
    console.debug('signin success');

    return { action: 'signin', payload: { accessToken: data.session.access_token } };
  } else {
    console.debug('accessToken found');
    return { action: 'signin', payload: { accessToken } };
  }
}

async function getAccessToken() {
  console.info('getAccessToken start');
  const { accessToken, expiresAt, refreshToken } = await browser.storage.local.get([
    SUPABASE_SECRETS_KEYS.EXPIRES_AT,
    SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
    SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
  ]);
  console.debug('getAccessToken:', {
    accessToken: accessToken !== '' ? accessToken !== undefined : false,
    expiresAt,
    refreshToken: refreshToken !== '' ? refreshToken !== undefined : false,
  });
  if (!accessToken) {
    console.debug('accessToken not found');
    return { action: 'getAccessToken', payload: {} };
  } else if (expiresAt <= Math.ceil(Date.now() / 1000)) {
    console.debug('accessToken expired. refresh session', {
      expiresAt,
      now: Math.ceil(Date.now() / 1000),
    });
    const supabase = createClient(import.meta.env.VITE_SUPABASE_URL ?? '', import.meta.env.VITE_SUPABASE_API_KEY ?? '');
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) {
      console.error(error);
      return { action: 'getAccessToken', payload: { error } };
    }
    if (!data.session) {
      console.error('session not found');
      return { action: 'getAccessToken', payload: { error: new Error('session not found') } };
    }
    console.debug('token refresh:', {
      access_token: data.session.access_token !== '' ? data.session.access_token !== undefined : false,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      provider_token: data.session.provider_token !== '' ? data.session.provider_token !== undefined : false,
      refresh_token: data.session.refresh_token !== '' ? data.session.refresh_token !== undefined : false,
      token_type: data.session.token_type,
    });
    await browser.storage.local.set({
      [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: data.session.access_token,
      [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: data.session.refresh_token,
      [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Number(data.session.expires_at),
    });
    console.debug('getAccessToken success');
    return { action: 'getAccessToken', payload: { accessToken: data.session?.access_token } };
  } else {
    console.debug('accessToken found');
    return { action: 'getAccessToken', payload: { accessToken } };
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender) => {
    console.debug('message:', message.action);
    switch (message.action) {
      case 'signin':
        return Promise.resolve(signin(message.payload.provider));
      case 'getAccessToken':
        return Promise.resolve(getAccessToken());
    }

    return true;
  });
});
