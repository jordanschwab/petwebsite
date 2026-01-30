import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.info('VITE_GOOGLE_CLIENT_ID=', clientId ? clientId : '(missing)');



const Root = () => {
  if (!clientId) {
    return (
      <div className="p-8 container">
        <h1 className="text-xl font-bold mb-2">Missing Google Client ID</h1>
        <p className="mb-2">Set <strong>VITE_GOOGLE_CLIENT_ID</strong> in <code>.env.local</code> and restart the dev server.</p>
        <p>Example:</p>
        <pre className="mt-2">VITE_GOOGLE_CLIENT_ID=your_client_id_here</pre>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
