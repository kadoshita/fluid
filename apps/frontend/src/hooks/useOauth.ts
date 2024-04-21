import { Provider, Session } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '../libs/supabase';

export const useOauth = (): [
  Session | null,
  (provider: Provider, redirect: string) => void,
  () => ReturnType<typeof supabase.auth.signOut>,
] => {
  const [session, setSession] = useState<Session | null>(null);

  const signupWithOAuth = (provider: Provider, redirect: string) => {
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirect,
      },
    });
  };

  const logout = () => {
    return supabase.auth.signOut();
  };

  return [session, signupWithOAuth, logout];
};
