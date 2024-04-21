import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../libs/supabase';

export const useSession = (): [Session | null, () => Promise<Session | null>] => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getSession = () =>
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      return session;
    });

  return [session, getSession];
};
