import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Define BEFORE useEffect
  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
    setLoading(false);
  };

  // ✅ useEffect AFTER functions
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/dashboard'); return; }
    fetchData();
  }, [user, navigate]);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
        <h1 className="text-2xl font-black">
          Syllabus<span className="text-red-500">AI</span>
          <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-full ml-2">ADMIN</span>
        </h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-400 text-sm">👋 {user?.name}</span>
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">Back to App</Link>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm">Logout</button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-black mb-6">🛡️ Admin Dashboard</h2>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Students', value: stats.totalStudents },
              { label: 'Teachers', value: stats.totalTeachers },
              { label: 'Syllabuses', value: stats.totalSyllabuses },
              { label: 'AI Messages', value: stats.totalMessages },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-blue-400">{s.value}</div>
                <div className="text-gray-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold">👥 All Users ({users.length})</h3>
          </div>
          <div className="overflow-x-auto w-full">
  <table className="w-full min-w-150">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400">Email</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400">Role</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400">Branch</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400">Joined</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-red-900/50 text-red-400' :
                        u.role === 'teacher' ? 'bg-purple-900/50 text-purple-400' :
                        'bg-blue-900/50 text-blue-400'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.branch || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}