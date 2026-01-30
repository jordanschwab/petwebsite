import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';

export default function LoginButton() {
  const { setUserFromBackend } = useAuth();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // tokenResponse contains access_token; backend expects id token in some setups
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: tokenResponse.access_token }),
          credentials: 'include',
        });
        if (res.ok) {
          await setUserFromBackend();
        } else {
          console.error('Login failed', await res.text());
        }
      } catch (err) {
        console.error(err);
      }
    },
    onError: (err) => console.error('Google login error', err),
  });

  return (
    <button onClick={() => login()} className="btn-primary">
      Sign in with Google
    </button>
  );
}
