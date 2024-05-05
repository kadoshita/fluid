import { useState } from 'react';
import { GetAccessTokenResponse, Provider, SigninResponse } from '../../background';

export const useOauth = (): [string | undefined, () => void, (provider: Provider) => void] => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  const getAccessToken = async () => {
    const result: GetAccessTokenResponse = await browser.runtime.sendMessage({
      action: 'getAccessToken',
    });

    if ('error' in result.payload) {
      console.error(result.payload.error);
      throw result.payload.error;
    }
    setAccessToken(result.payload.accessToken);
  };

  const signinWithOAuth = async (provider: Provider) => {
    const result: SigninResponse = await browser.runtime.sendMessage({
      action: 'signin',
      payload: {
        provider,
      },
    });
    if ('error' in result.payload) {
      console.error(result.payload.error);
      throw result.payload.error;
    }
    setAccessToken(result.payload.accessToken);
  };

  return [accessToken, getAccessToken, signinWithOAuth];
};
