import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-8 container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          {user && <span className="mr-4">{user.displayName ?? user.email}</span>}
          <button onClick={() => signOut()} className="btn-primary">Sign out</button>
        </div>
      </div>
      <p>Welcome — your dashboard will appear here.</p>
    </div>
  );
}
