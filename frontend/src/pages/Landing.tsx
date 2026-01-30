import LoginButton from '@/components/LoginButton';

export default function Landing() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to Pet Manager</h1>
      <p className="mb-6">Sign in to manage your pets.</p>
      <LoginButton />
    </div>
  );
}
