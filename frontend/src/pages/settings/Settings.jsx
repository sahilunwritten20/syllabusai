import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [apiKeys, setApiKeys] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState('');

  useEffect(() => {
    fetchData();
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const fetchData = async () => {
    try {
      const [keysRes, subRes] = await Promise.all([
        API.get('/keys'),
        API.get('/payment/subscription')
      ]);
      setApiKeys(keysRes.data.keys);
      setSubscription(subRes.data.subscription);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpgrade = async (plan) => {
    setPayLoading(plan);
    try {
      const res = await API.post('/payment/create-order', { plan });
      const { order, key, amount, name } = res.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'SyllabusAI',
        description: name,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            });
            if (verifyRes.data.success) {
              toast.success(verifyRes.data.message);
              fetchData();
            }
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: 'Student', email: '' },
        theme: { color: '#3B82F6' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment failed: ' + err.message);
    }
    setPayLoading('');
  };

  const createKey = async () => {
    if (!keyName) { toast.error('Enter key name!'); return; }
    setLoading(true);
    try {
      await API.post('/keys', { name: keyName });
      toast.success('API Key created! 🎉');
      setKeyName('');
      fetchData();
    } catch { toast.error('Failed to create key'); }
    setLoading(false);
  };

  const deleteKey = async (id) => {
    try {
      await API.delete(`/keys/${id}`);
      toast.success('Key deleted!');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API Key copied!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
        <Link to="/dashboard" className="text-2xl font-black">
          Syllabus<span className="text-blue-500">AI</span>
        </Link>
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-6">⚙️ Settings</h1>

        {/* Current Plan */}
        {subscription && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="text-2xl">💎</div>
            <div>
              <div className="font-bold">Current Plan: <span className="text-blue-400 capitalize">{subscription.plan}</span></div>
              <div className="text-sm text-gray-400">
                {subscription.plan === 'free' ? 'Upgrade to unlock all features' : `Active until ${new Date(subscription.endDate).toLocaleDateString()}`}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">💎 Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                plan: 'free',
                name: '🆓 Free',
                price: '₹0',
                color: 'gray',
                features: ['1 syllabus upload', '50 AI messages/month', 'Basic agents only', 'No voice features']
              },
              {
                plan: 'pro',
                name: '⭐ Pro',
                price: '₹299/month',
                color: 'blue',
                features: ['10 syllabus uploads', '1000 AI messages/month', 'All 6 AI agents', 'Voice features', 'Priority support']
              },
              {
                plan: 'college',
                name: '🏫 College',
                price: '₹9,999/month',
                color: 'purple',
                features: ['Unlimited uploads', 'Unlimited messages', 'All features', 'Teacher dashboard', 'Custom branding', 'Priority support']
              }
            ].map((p) => (
              <div key={p.plan} className={`border rounded-2xl p-5 ${
                subscription?.plan === p.plan
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              } transition`}>
                <div className="font-black text-xl mb-1">{p.name}</div>
                <div className="text-yellow-400 font-bold text-lg mb-3">{p.price}</div>
                <div className="space-y-1 mb-4">
                  {p.features.map((f, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-center gap-1">
                      <span className="text-green-400">✓</span> {f}
                    </div>
                  ))}
                </div>

                {subscription?.plan === p.plan ? (
                  <div className="text-center text-green-400 text-sm font-bold py-2 bg-green-900/20 rounded-xl">
                    ✅ Current Plan
                  </div>
                ) : p.plan === 'free' ? (
                  <div className="text-center text-gray-500 text-sm py-2">Basic</div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.plan)}
                    disabled={payLoading === p.plan}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-xl text-sm font-bold transition"
                  >
                    {payLoading === p.plan ? '⏳ Processing...' : `Upgrade to ${p.name}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">🔑 API Keys</h2>
          <p className="text-gray-400 text-sm mb-4">Use these keys to access SyllabusAI API in your own apps</p>

          <div className="flex gap-3 mb-4">
            <input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Key name (e.g. My Mobile App)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && createKey()}
            />
            <button
              onClick={createKey}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition text-sm"
            >
              {loading ? '...' : 'Generate'}
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No API keys yet. Generate one above!</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((k, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl p-3">
                  <div>
                    <div className="font-medium text-sm">{k.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">{k.key?.slice(0, 30)}...</div>
                    <div className="text-xs text-gray-500">Used {k.usageCount} times</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyKey(k.key)}
                      className="text-blue-400 hover:text-blue-300 text-xs bg-blue-900/30 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => deleteKey(k._id)}
                      className="text-red-400 hover:text-red-300 text-xs bg-red-900/30 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}