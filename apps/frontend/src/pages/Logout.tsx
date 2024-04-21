import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { useOauth } from '../hooks/useOauth';

export default function Logout() {
  const [_, __, logout] = useOauth();
  const [____, setLocation] = useLocation();

  useEffect(() => {
    logout().then(({ error }) => {
      if (!error) {
        setLocation('/');
      }
    });
  }, []);

  return (
    <>
      <h1>Log out...</h1>
    </>
  );
}
