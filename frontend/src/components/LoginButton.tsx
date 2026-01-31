import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';

export default function LoginButton() {
  const { setUserFromBackend } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const idToken = credentialResponse.credential;
            if (!idToken) {
              setError('Google login failed. Please try again.');
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
              setError(null);
              await setUserFromBackend();
            } else {
              setError('Login failed. Please try again.');
            }
          } catch {
            setError('Login failed. Please try again.');
          }
        }}
        onError={() => setError('Google login failed. Please try again.')}
      />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
