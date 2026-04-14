import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) { toast.error('Fill all fields!'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match!'); return; }
    if (password.length < 6) { toast.error('Min 6 characters!'); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully! 🎉');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-white text-xl font-bold">Invalid Reset Link</h2>
          <Link to="/forgot-password" className="text-blue-400 block mt-4">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white">
            Syllabus<span className="text-blue-500">AI</span>
          </h1>
          <p className="text-gray-400 mt-2">Set your new password</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-2">New Password</h2>
          <p className="text-gray-400 text-sm mb-6">Choose a strong password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {password && (
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">Password strength:</div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${
                      password.length < 6 ? 'w-1/4 bg-red-500' :
                      password.length < 10 ? 'w-2/4 bg-yellow-500' :
                      'w-full bg-green-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition"
            >
              {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}