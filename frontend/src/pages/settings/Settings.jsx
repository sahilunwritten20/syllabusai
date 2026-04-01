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
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Load Razorpay safely
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const fetchData = async () => {
    try {
      const [keysRes, subRes, userRes] = await Promise.all([
        API.get('/keys'),
        API.get('/subscription'),
        API.get('/auth/me')
      ]);

      setApiKeys(keysRes.data.keys);
      setSubscription(subRes.data.subscription);
      setUser(userRes.data.user);

    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const handleUpgrade = async (plan) => {
    setPayLoading(plan);

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Payment system failed to load');
      setPayLoading('');
      return;
    }

    try {
      const res = await API.post('/payment/create-order', { plan });
      const { order, key, name } = res.data;

      const options = {
        key,
        order_id: order.id,
        name: 'SyllabusAI',
        description: name,

        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            });

            toast.success(verifyRes.data.message);
            setTimeout(fetchData, 1000);

          } catch {
            toast.error('Payment verification failed');
          }
        },

        prefill: {
          name: user?.name || 'User',
          email: user?.email || ''
        },

        theme: { color: '#3B82F6' }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function () {
        toast.error('❌ Payment failed. Try again.');
      });

      rzp.open();

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed');
    }

    setPayLoading('');
  };

  const createKey = async () => {
    if (!keyName) {
      toast.error('Enter key name!');
      return;
    }

    setLoading(true);

    try {
      await API.post('/keys', { name: keyName });
      toast.success('API Key created! 🎉');
      setKeyName('');
      fetchData();
    } catch {
      toast.error('Failed to create key');
    }

    setLoading(false);
  };

  const deleteKey = async (id) => {
    try {
      await API.delete(`/keys/${id}`);
      toast.success('Key deleted!');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
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
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-6">⚙️ Settings</h1>

        {/* Current Plan */}
        {subscription && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="text-2xl">💎</div>
            <div>
              <div className="font-bold">
                Current Plan: <span className="text-blue-400 capitalize">{subscription.plan}</span>
              </div>
              <div className="text-sm text-gray-400">
                {subscription.plan === 'free'
                  ? 'Upgrade to unlock all features'
                  : `Active until ${new Date(subscription.endDate).toLocaleDateString()}`}
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">💎 Subscription Plans</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                plan: 'free',
                name: '🆓 Free',
                price: '₹0',
                features: ['1 upload', '50 messages', 'Basic AI']
              },
              {
                plan: 'pro',
                name: '⭐ Pro',
                price: '₹299/month',
                features: ['10 uploads', '1000 messages', 'All AI + Voice']
              },
              {
                plan: 'college',
                name: '🏫 College',
                price: '₹9,999/month',
                features: ['Unlimited everything']
              }
            ].map((p) => (
              <div
                key={p.plan}
                className={`border rounded-2xl p-5 ${
                  subscription?.plan === p.plan
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700'
                }`}
              >
                <div className="font-black text-xl mb-1">{p.name}</div>
                <div className="text-yellow-400 font-bold text-lg mb-3">{p.price}</div>

                <div className="space-y-1 mb-4">
                  {p.features.map((f, i) => (
                    <div key={i} className="text-xs text-gray-300">
                      ✓ {f}
                    </div>
                  ))}
                </div>

                {subscription?.plan === p.plan ? (
                  <div className="text-green-400 text-sm font-bold text-center">
                    ✅ Current Plan
                  </div>
                ) : p.plan === 'free' ? (
                  <div className="text-gray-500 text-sm text-center">Basic</div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.plan)}
                    disabled={payLoading === p.plan}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-bold text-sm"
                  >
                    {payLoading === p.plan
                      ? '⏳ Processing...'
                      : `🚀 Upgrade`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">🔑 API Keys</h2>

          <div className="flex gap-3 mb-4">
            <input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Key name"
              className="flex-1 bg-gray-800 px-4 py-3 rounded-xl"
            />
            <button
              onClick={createKey}
              disabled={loading}
              className="bg-blue-600 px-6 py-3 rounded-xl font-bold"
            >
              {loading ? '...' : 'Generate'}
            </button>
          </div>

          {apiKeys.map((k) => (
            <div key={k._id} className="flex justify-between bg-gray-800 p-3 rounded-xl mb-2">
              <div>
                <div>{k.name}</div>
                <div className="text-xs text-gray-400">{k.key.slice(0, 25)}...</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyKey(k.key)}>Copy</button>
                <button onClick={() => deleteKey(k._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


