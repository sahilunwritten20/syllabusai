import useAuthStore from '../../store/authStore';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-black">Welcome, {user?.name}! 👋</h1>
      <p className="text-gray-400 mt-2">Dashboard coming soon...</p>
      <button onClick={logout} className="mt-4 bg-red-600 px-4 py-2 rounded-xl">Logout</button>
    </div>
  );
}