// @vitest-environment node
import { vi } from 'vitest';
import { randomUUID } from 'crypto';
import background, { Provider, SUPABASE_SECRETS_KEYS } from '../src/entrypoints/background';
import { AuthClient, AuthError } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

describe('background', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe('signin', () => {
    it.each<Provider>(['github', 'google'])(
      'accessTokenが存在しない場合、signin処理が実行され、新しい認証情報が保存されること(%s)',
      async (provider) => {
        const fakeQuery = {
          access_token: randomUUID() as string,
          expires_at: Math.ceil(Date.now() / 1000).toString(),
          expires_in: Math.ceil(Date.now() / 1000).toString(),
          provider_token: randomUUID() as string,
          refresh_token: randomUUID() as string,
          token_type: 'bearer',
        };
        const signinSpy = vi.spyOn(AuthClient.prototype, 'signInWithOAuth').mockResolvedValue({
          data: {
            provider,
            url: `${import.meta.env.VITE_FLUID_URL}/#${new URLSearchParams(fakeQuery).toString()}`,
          },
          error: null,
        });
        const fakeTab = {
          id: 1,
          index: 1,
          highlighted: false,
          active: true,
          pinned: false,
          incognito: false,
          url: `${import.meta.env.VITE_FLUID_URL}/#${new URLSearchParams(fakeQuery).toString()}`,
        };
        const browserTabsCreateSpy = vi.spyOn(fakeBrowser.tabs, 'create').mockImplementation(async () => {
          return fakeTab;
        });
        const browserTabsOnUpdateSpy = vi
          .spyOn(fakeBrowser.tabs.onUpdated, 'addListener')
          .mockImplementation((callback) => {
            return callback(1, { status: 'complete' }, fakeTab);
          });
        background.main();

        const resultPromise = fakeBrowser.runtime.sendMessage({ action: 'signin', payload: { provider } });
        await fakeBrowser.tabs.onUpdated.trigger(1, { status: 'complete' }, fakeTab);
        const result = await resultPromise;

        expect(result).toStrictEqual({
          action: 'signin',
          payload: {
            accessToken: expect.any(String),
          },
        });
        expect(signinSpy).toHaveBeenCalledWith({ provider });
        const secrets = await fakeBrowser.storage.local.get([
          SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
          SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
          SUPABASE_SECRETS_KEYS.EXPIRES_AT,
        ]);
        expect(secrets[SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]).toBe(fakeQuery.access_token);
        expect(secrets[SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]).toBe(fakeQuery.refresh_token);
        expect(secrets[SUPABASE_SECRETS_KEYS.EXPIRES_AT]).toBe(Number(fakeQuery.expires_at));

        signinSpy.mockRestore();
        browserTabsCreateSpy.mockRestore();
        browserTabsOnUpdateSpy.mockRestore();
      },
    );

    it('signin処理中にエラーが返された場合、エラー情報が返されること', async () => {
      const authError = new AuthError('signin failed');
      const signinSpy = vi.spyOn(AuthClient.prototype, 'signInWithOAuth').mockResolvedValue({
        data: {
          provider: 'google',
          url: null,
        },
        error: authError,
      });

      background.main();

      const result = await fakeBrowser.runtime.sendMessage({ action: 'signin', payload: { provider: 'google' } });

      expect(result).toStrictEqual({
        action: 'signin',
        payload: {
          error: authError,
        },
      });
      expect(signinSpy).toHaveBeenCalledWith({ provider: 'google' });

      signinSpy.mockRestore();
    });

    it.each<[Record<string, string>, string]>([
      [
        {
          expires_at: Math.ceil(Date.now() / 1000).toString(),
          expires_in: Math.ceil(Date.now() / 1000).toString(),
          provider_token: randomUUID() as string,
          refresh_token: randomUUID() as string,
          token_type: 'bearer',
        },
        'expires_at, expires_in, provider_token, refresh_token, token_type',
      ],
      [
        {
          access_token: randomUUID() as string,
          expires_in: Math.ceil(Date.now() / 1000).toString(),
          provider_token: randomUUID() as string,
          refresh_token: randomUUID() as string,
          token_type: 'bearer',
        },
        'access_token, expires_in, provider_token, refresh_token, token_type',
      ],
      [
        {
          access_token: randomUUID() as string,
          expires_at: Math.ceil(Date.now() / 1000).toString(),
          provider_token: randomUUID() as string,
          refresh_token: randomUUID() as string,
          token_type: 'bearer',
        },
        'access_token, expires_at, provider_token, refresh_token, token_type',
      ],
      [
        {
          access_token: randomUUID() as string,
          expires_at: Math.ceil(Date.now() / 1000).toString(),
          expires_in: Math.ceil(Date.now() / 1000).toString(),
          refresh_token: randomUUID() as string,
          token_type: 'bearer',
        },
        'access_token, expires_at, expires_in, refresh_token, token_type',
      ],
      [
        {
          access_token: randomUUID() as string,
          expires_at: Math.ceil(Date.now() / 1000).toString(),
          expires_in: Math.ceil(Date.now() / 1000).toString(),
          provider_token: randomUUID() as string,
          token_type: 'bearer',
        },
        'access_token, expires_at, expires_in, provider_token, token_type',
      ],
      [
        {
          access_token: randomUUID() as string,
          expires_at: Math.ceil(Date.now() / 1000).toString(),
          expires_in: Math.ceil(Date.now() / 1000).toString(),
          provider_token: randomUUID() as string,
          refresh_token: randomUUID() as string,
        },
        'access_token, expires_at, expires_in, provider_token, refresh_token',
      ],
    ])('signin処理のタブ遷移先のURLが不正な場合、エラー情報が返されること(%s)', async (fakeQuery, keys) => {
      const signinSpy = vi.spyOn(AuthClient.prototype, 'signInWithOAuth').mockResolvedValue({
        data: {
          provider: 'google',
          url: `${import.meta.env.VITE_FLUID_URL}/#${new URLSearchParams(fakeQuery).toString()}`,
        },
        error: null,
      });
      const fakeTab = {
        id: 1,
        index: 1,
        highlighted: false,
        active: true,
        pinned: false,
        incognito: false,
        url: `${import.meta.env.VITE_FLUID_URL}/#${new URLSearchParams(fakeQuery).toString()}`,
      };
      const browserTabsCreateSpy = vi.spyOn(fakeBrowser.tabs, 'create').mockImplementation(async () => {
        return fakeTab;
      });
      const browserTabsOnUpdateSpy = vi
        .spyOn(fakeBrowser.tabs.onUpdated, 'addListener')
        .mockImplementation((callback) => {
          return callback(1, { status: 'complete' }, fakeTab);
        });
      background.main();

      const resultPromise = fakeBrowser.runtime.sendMessage({ action: 'signin', payload: { provider: 'google' } });
      await fakeBrowser.tabs.onUpdated.trigger(1, { status: 'complete' }, fakeTab);
      const result = await resultPromise;

      expect(result).toStrictEqual({
        action: 'signin',
        payload: {
          error: `query not found. queryKeys: ${keys}`,
        },
      });
      expect(signinSpy).toHaveBeenCalledWith({ provider: 'google' });

      signinSpy.mockRestore();
      browserTabsCreateSpy.mockRestore();
      browserTabsOnUpdateSpy.mockRestore();
    });

    it.each<Provider>(['github', 'google'])(
      '認証情報が期限切れの場合、更新処理が行われ、新しい認証情報がストレージに保存されること(%s)',
      async (provider) => {
        const newSession = {
          access_token: randomUUID() as string,
          expires_at: Math.ceil(Date.now() / 1000),
          expires_in: Math.ceil(Date.now() / 1000),
          provider_token: randomUUID() as string,
          refresh_token: randomUUID() as string,
          token_type: 'bearer',
          user: {} as User,
        };
        const refreshSessionSpy = vi.spyOn(AuthClient.prototype, 'refreshSession').mockResolvedValue({
          data: {
            session: newSession,
            user: null,
          },
          error: null,
        });
        background.main();
        const currentSecrets = {
          [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: randomUUID(),
          [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: randomUUID(),
          [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Math.ceil(Date.now() / 1000) - 1,
        };
        await fakeBrowser.storage.local.set(currentSecrets);

        const result = await fakeBrowser.runtime.sendMessage({ action: 'signin', payload: { provider } });

        expect(result).toStrictEqual({
          action: 'signin',
          payload: {
            accessToken: expect.any(String),
          },
        });
        expect(refreshSessionSpy).toHaveBeenCalledWith({
          refresh_token: currentSecrets.refreshToken,
        });
        const secrets = await fakeBrowser.storage.local.get([
          SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
          SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
          SUPABASE_SECRETS_KEYS.EXPIRES_AT,
        ]);
        expect(secrets[SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]).toBe(newSession.access_token);
        expect(secrets[SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]).toBe(newSession.refresh_token);
        expect(secrets[SUPABASE_SECRETS_KEYS.EXPIRES_AT]).toBe(Number(newSession.expires_at));

        refreshSessionSpy.mockRestore();
      },
    );

    it.each<Provider>(['github', 'google'])('認証情報が存在する場合、その情報が返されること(%s)', async (provider) => {
      background.main();
      const currentSecrets = {
        [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Math.ceil(Date.now() / 1000) + 1,
      };
      await fakeBrowser.storage.local.set(currentSecrets);

      const result = await fakeBrowser.runtime.sendMessage({ action: 'signin', payload: { provider } });

      expect(result).toStrictEqual({
        action: 'signin',
        payload: {
          accessToken: currentSecrets[SUPABASE_SECRETS_KEYS.ACCESS_TOKEN],
        },
      });
      const secrets = await fakeBrowser.storage.local.get([
        SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
        SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
        SUPABASE_SECRETS_KEYS.EXPIRES_AT,
      ]);
      expect(secrets).toStrictEqual(currentSecrets);
    });
  });

  describe('getAccessToken', () => {
    it('初めて呼んだ場合、何も返されないこと', async () => {
      background.main();

      const result = await fakeBrowser.runtime.sendMessage({ action: 'getAccessToken' });

      expect(result).toStrictEqual({
        action: 'getAccessToken',
        payload: {},
      });
    });

    it('認証情報が期限切れの場合、更新処理が行われ、新しい認証情報がストレージに保存されること', async () => {
      const newSession = {
        access_token: randomUUID() as string,
        expires_at: Math.ceil(Date.now() / 1000),
        expires_in: Math.ceil(Date.now() / 1000),
        provider_token: randomUUID() as string,
        refresh_token: randomUUID() as string,
        token_type: 'bearer',
        user: {} as User,
      };
      const refreshSessionSpy = vi.spyOn(AuthClient.prototype, 'refreshSession').mockResolvedValue({
        data: {
          session: newSession,
          user: null,
        },
        error: null,
      });
      background.main();
      const currentSecrets = {
        [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Math.ceil(Date.now() / 1000) - 1,
      };
      await fakeBrowser.storage.local.set(currentSecrets);
      const now = Date.now();
      const dateNowSpy = vi.spyOn(global.Date, 'now').mockReturnValue(now);

      const result = await fakeBrowser.runtime.sendMessage({ action: 'getAccessToken' });
      expect(result).toStrictEqual({
        action: 'getAccessToken',
        payload: {
          accessToken: expect.any(String),
        },
      });
      expect(refreshSessionSpy).toHaveBeenCalledWith({
        refresh_token: currentSecrets[SUPABASE_SECRETS_KEYS.REFRESH_TOKEN],
      });
      const { accessToken, expiresAt } = await fakeBrowser.storage.local.get([
        SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
        SUPABASE_SECRETS_KEYS.EXPIRES_AT,
      ]);
      expect(accessToken).toEqual(result.payload.accessToken);
      expect(expiresAt).toBe(newSession.expires_at);

      dateNowSpy.mockRestore();
      refreshSessionSpy.mockRestore();
    });

    it('認証情報の更新処理でエラーが起きた場合、エラー情報が返されること', async () => {
      const refreshSessionError = new AuthError('refresh session failed');
      const refreshSessionSpy = vi.spyOn(AuthClient.prototype, 'refreshSession').mockResolvedValue({
        data: {
          session: null,
          user: null,
        },
        error: refreshSessionError,
      });
      background.main();
      const currentSecrets = {
        [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Math.ceil(Date.now() / 1000) - 1,
      };
      await fakeBrowser.storage.local.set(currentSecrets);
      const now = Date.now();
      const dateNowSpy = vi.spyOn(global.Date, 'now').mockReturnValue(now);

      const result = await fakeBrowser.runtime.sendMessage({ action: 'getAccessToken' });
      expect(result).toStrictEqual({
        action: 'getAccessToken',
        payload: {
          error: refreshSessionError,
        },
      });
      const secrets = await fakeBrowser.storage.local.get([
        SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
        SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
        SUPABASE_SECRETS_KEYS.EXPIRES_AT,
      ]);
      expect(secrets).toStrictEqual(currentSecrets);

      dateNowSpy.mockRestore();
      refreshSessionSpy.mockRestore();
    });

    it('認証情報が存在する場合、その情報が返されること', async () => {
      background.main();
      const currentSecrets = {
        [SUPABASE_SECRETS_KEYS.ACCESS_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.REFRESH_TOKEN]: randomUUID(),
        [SUPABASE_SECRETS_KEYS.EXPIRES_AT]: Math.ceil(Date.now() / 1000) + 1,
      };
      await fakeBrowser.storage.local.set(currentSecrets);
      const now = Date.now();
      const dateNowSpy = vi.spyOn(global.Date, 'now').mockReturnValue(now);

      const result = await fakeBrowser.runtime.sendMessage({ action: 'getAccessToken' });
      expect(result).toStrictEqual({
        action: 'getAccessToken',
        payload: {
          accessToken: currentSecrets[SUPABASE_SECRETS_KEYS.ACCESS_TOKEN],
        },
      });
      const secrets = await fakeBrowser.storage.local.get([
        SUPABASE_SECRETS_KEYS.ACCESS_TOKEN,
        SUPABASE_SECRETS_KEYS.REFRESH_TOKEN,
        SUPABASE_SECRETS_KEYS.EXPIRES_AT,
      ]);
      expect(secrets).toStrictEqual(currentSecrets);

      dateNowSpy.mockRestore();
    });
  });
});
