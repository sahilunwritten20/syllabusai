import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email!'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email 📧');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white">
            Syllabus<span className="text-blue-500">AI</span>
          </h1>
          <p className="text-gray-400 mt-2">Reset your password</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
              <p className="text-gray-400 text-sm mb-6">
                We sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-500 text-xs">Link expires in 15 minutes</p>
              <Link to="/login" className="block mt-6 text-blue-400 hover:text-blue-300 text-sm">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition"
                >
                  {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Remember password?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}