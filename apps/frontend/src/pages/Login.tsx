import { SignupOauthForm } from '../components/form/signupOauth';
import { useOauth } from '../hooks/useOauth';

export default function Login() {
  const [session, signupWithOAuth] = useOauth();

  const handleSubmit = (values: { provider: 'github' | 'google' }) => {
    switch (values.provider) {
      case 'github':
      case 'google':
        signupWithOAuth(values.provider, `${location.origin}/home`);
        break;
    }
  };

  return (
    <>
      <h1>Log in</h1>
      <SignupOauthForm handleSubmit={handleSubmit} />
    </>
  );
}
