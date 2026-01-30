import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';

export default function LoginButton() {
  const { setUserFromBackend } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const idToken = credentialResponse.credential;
          if (!idToken) {
            console.error('Google login error: missing id token');
            return;
          }

          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            credentials: 'include',
          });

          if (res.ok) {
            const json = await res.json();
            if (json.data?.accessToken) {
              localStorage.setItem('accessToken', json.data.accessToken);
            }
            await setUserFromBackend();
          } else {
            console.error('Login failed', await res.text());
          }
        } catch (err) {
          console.error(err);
        }
      }}
      onError={() => console.error('Google login error')}
    />
  );
}
