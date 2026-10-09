import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const NavLink = ({ to, label }) => (
  <Link to={to} className="settings-nav-link">
    {label}
  </Link>
);

export default function Settings() {
  const [apiKeys, setApiKeys] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState('');
  const [activeTab, setActiveTab] = useState('subscription');
  const [dataLoading, setDataLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState('');

  useEffect(() => {
    fetchData();

    if (!window.Razorpay) {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  const fetchData = async () => {
  try {
    const results = await Promise.allSettled([
      API.get('/keys'),
      API.get('/payment/subscription'),
    ]);

    const [keysResult, subscriptionResult] = results;

    const keysLoaded = keysResult.status === 'fulfilled';
    const subscriptionLoaded = subscriptionResult.status === 'fulfilled';

    // Update API keys independently.
    if (keysLoaded) {
      setApiKeys(keysResult.value.data.keys || []);
    } else {
      console.error(
        'Unable to load API keys:',
        keysResult.reason
      );
    }

    // Update subscription independently.
    if (subscriptionLoaded) {
      setSubscription(
        subscriptionResult.value.data.subscription || null
      );
    } else {
      console.error(
        'Unable to load subscription:',
        subscriptionResult.reason
      );
    }

    // Show an error only if BOTH requests fail.
    // A partial failure will no longer trigger a misleading popup.
    if (!keysLoaded && !subscriptionLoaded) {
      toast.error('Unable to load settings. Please try again.');
    }
  } finally {
    setDataLoading(false);
  }
};

  const handleUpgrade = async (plan) => {
    if (payLoading) return;

    setPayLoading(plan);

    try {
      if (!window.Razorpay) {
        toast.error('Payment system is still loading. Please try again.');
        return;
      }

      const res = await API.post('/payment/create-order', { plan });
      const { order, key, name } = res.data;

      if (!order?.id || !key) {
        toast.error('Unable to initialize payment');
        return;
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'SyllabusAI',
        description: name || `SyllabusAI ${plan} plan`,
        order_id: order.id,

        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payment/verify', {
              ...response,
              plan
            });

            if (verifyRes.data.success) {
              toast.success('Plan activated successfully');
              await fetchData();
            } else {
              toast.error('Payment verification failed');
            }
          } catch {
            toast.error('Payment verification failed');
          }
        },

        modal: {
          ondismiss: () => {
            setPayLoading('');
          }
        },

        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPayLoading('');
      });

      rzp.open();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Unable to start payment'
      );
    } finally {
      setPayLoading('');
    }
  };

  const createKey = async () => {
    if (!keyName.trim()) {
      toast.error('Enter a name for your API key');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await API.post('/keys', {
        name: keyName.trim()
      });

      toast.success('API key created successfully');
      setKeyName('');
      await fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to create API key'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id) => {
    if (!id || deletingKey) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this API key? This action cannot be undone.'
    );

    if (!confirmed) return;

    setDeletingKey(id);

    try {
      await API.delete(`/keys/${id}`);
      toast.success('API key deleted');
      await fetchData();
    } catch {
      toast.error('Failed to delete API key');
    } finally {
      setDeletingKey('');
    }
  };

  const copyKey = async (key) => {
    if (!key) {
      toast.error('API key is unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(key);
      toast.success('API key copied');
    } catch {
      toast.error('Unable to copy API key');
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Get started with the essentials',
      features: [
        '50 messages / month',
        '1 syllabus upload',
        'Basic agents',
        'Chat history'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹299',
      period: '/ month',
      description: 'For focused, everyday learning',
      features: [
        '1,000 messages / month',
        '10 uploads',
        'All 6 agents',
        'Voice input',
        'Memory system'
      ],
      popular: true
    },
    {
      id: 'college',
      name: 'College',
      price: '₹9,999',
      period: '/ month',
      description: 'For institutions and teams',
      features: [
        'Unlimited everything',
        'Teacher dashboard',
        'Analytics',
        'Custom branding'
      ]
    }
  ];

  const currentPlan = subscription?.plan?.toLowerCase();

  return (
    <div className="settings-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .settings-page,
        .settings-page * {
          box-sizing: border-box;
        }

        .settings-page {
          min-height: 100vh;
          min-width: 320px;
          background: #07090f;
          color: #f8fafc;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: clip;
          -webkit-font-smoothing: antialiased;
        }

        .settings-page button,
        .settings-page input {
          font: inherit;
        }

        .settings-page button:focus-visible,
        .settings-page a:focus-visible,
        .settings-page input:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 3px;
        }

        .settings-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .settings-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-height: 68px;
          padding: 12px clamp(16px, 4vw, 40px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(7,9,15,0.88);
          backdrop-filter: blur(20px);
        }

        .settings-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          color: white;
          text-decoration: none;
        }

        .settings-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 11px;
          background: rgba(59,130,246,0.12);
        }

        .settings-brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .settings-nav-links {
          display: flex;
          align-items: center;
          gap: clamp(12px, 2.5vw, 28px);
        }

        .settings-nav-link {
          color: #8b93a5;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color .2s ease;
        }

        .settings-nav-link:hover {
          color: #fff;
        }

        .settings-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          padding: 42px clamp(16px, 4vw, 36px) 76px;
        }

        .settings-header {
          margin-bottom: 30px;
        }

        .settings-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          padding: 7px 11px;
          border: 1px solid rgba(96,165,250,.18);
          border-radius: 999px;
          background: rgba(59,130,246,.08);
          color: #93c5fd;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .settings-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 12px rgba(96,165,250,.5);
        }

        .settings-heading {
          margin: 0 0 10px;
          font-size: clamp(30px, 4vw, 42px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1.8px;
          overflow-wrap: anywhere;
        }

        .settings-subheading {
          max-width: 600px;
          margin: 0;
          color: #8b93a5;
          font-size: 14px;
          line-height: 1.8;
        }

        .settings-tabs {
          display: flex;
          width: fit-content;
          max-width: 100%;
          gap: 5px;
          margin-bottom: 28px;
          padding: 5px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 13px;
          background: rgba(255,255,255,.035);
        }

        .settings-tab {
          min-height: 40px;
          padding: 10px 18px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #8b93a5;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color .2s, background .2s, border-color .2s;
        }

        .settings-tab:hover {
          color: #fff;
        }

        .settings-tab.active {
          border-color: rgba(255,255,255,.08);
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        .settings-current-plan {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 26px;
          padding: 20px 22px;
          border: 1px solid rgba(59,130,246,.2);
          border-radius: 16px;
          background: linear-gradient(110deg, rgba(59,130,246,.11), rgba(59,130,246,.035));
        }

        .settings-current-label {
          margin-bottom: 6px;
          color: #93c5fd;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .settings-current-name {
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -.5px;
          overflow-wrap: anywhere;
        }

        .settings-renewal {
          color: #a4adbd;
          font-size: 12px;
          line-height: 1.6;
          text-align: right;
        }

        .settings-plans-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: stretch;
          gap: 18px;
        }

        .settings-plan-card {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 25px 22px 22px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 19px;
          background: rgba(15,19,30,.86);
          transition: transform .2s ease, border-color .2s ease;
        }

        .settings-plan-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,.17);
        }

        .settings-plan-card.pro {
          border-color: rgba(59,130,246,.45);
          background: linear-gradient(155deg, rgba(59,130,246,.12), rgba(15,19,30,.94) 48%);
          box-shadow: 0 12px 50px rgba(0,0,0,.12);
        }

        .settings-plan-card.current {
          border-color: rgba(16,185,129,.42);
        }

        .settings-plan-badge {
          align-self: flex-start;
          margin-bottom: 17px;
          padding: 5px 10px;
          border: 1px solid rgba(96,165,250,.2);
          border-radius: 999px;
          background: rgba(59,130,246,.13);
          color: #93c5fd;
          font-size: 10px;
          font-weight: 700;
        }

        .settings-plan-name {
          margin-bottom: 7px;
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 700;
        }

        .settings-plan-description {
          min-height: 36px;
          margin-bottom: 20px;
          color: #7e8799;
          font-size: 12px;
          line-height: 1.6;
        }

        .settings-plan-price {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 5px;
          margin-bottom: 22px;
        }

        .settings-plan-amount {
          font-size: clamp(27px, 3vw, 34px);
          font-weight: 800;
          letter-spacing: -1.5px;
          overflow-wrap: anywhere;
        }

        .settings-plan-period {
          color: #7e8799;
          font-size: 12px;
        }

        .settings-plan-divider {
          height: 1px;
          margin-bottom: 21px;
          background: rgba(255,255,255,.08);
        }

        .settings-plan-features {
          display: flex;
          flex-direction: column;
          gap: 13px;
          flex: 1;
          margin: 0 0 25px;
          padding: 0;
          list-style: none;
        }

        .settings-plan-feature {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #b4bdcc;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .settings-plan-feature svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .settings-plan-button {
          width: 100%;
          min-height: 45px;
          padding: 11px 12px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 11px;
          background: rgba(255,255,255,.055);
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .2s, background .2s, opacity .2s;
        }

        .settings-plan-button.pro-button {
          border-color: transparent;
          background: #3b82f6;
          color: #fff;
        }

        .settings-plan-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #2563eb;
          color: #fff;
        }

        .settings-plan-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .settings-plan-current,
        .settings-plan-free {
          padding: 12px 0;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .settings-plan-current {
          color: #34d399;
        }

        .settings-plan-free {
          color: #737d8f;
        }

        .settings-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,.28);
          border-top-color: #fff;
          border-radius: 50%;
          animation: settingsSpin .75s linear infinite;
        }

        @keyframes settingsSpin {
          to { transform: rotate(360deg); }
        }

        .settings-api-panel {
          min-width: 0;
          padding: clamp(18px, 3vw, 28px);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 19px;
          background: rgba(15,19,30,.86);
        }

        .settings-api-title {
          margin: 0 0 7px;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .settings-api-description {
          margin: 0;
          color: #8b93a5;
          font-size: 13px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .settings-api-create {
          display: flex;
          gap: 11px;
          margin: 23px 0 25px;
        }

        .settings-api-input {
          width: 100%;
          min-width: 0;
          min-height: 47px;
          flex: 1;
          padding: 12px 14px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 11px;
          background: rgba(255,255,255,.04);
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }

        .settings-api-input::placeholder {
          color: #687184;
        }

        .settings-api-input:focus {
          border-color: rgba(96,165,250,.6);
          box-shadow: 0 0 0 3px rgba(59,130,246,.1);
        }

        .settings-api-create-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 47px;
          padding: 12px 18px;
          border: none;
          border-radius: 11px;
          background: #3b82f6;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: background .2s, opacity .2s;
        }

        .settings-api-create-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .settings-api-create-button:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        .settings-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 44px 18px;
          border: 1px dashed rgba(255,255,255,.1);
          border-radius: 14px;
          text-align: center;
        }

        .settings-empty-title {
          margin: 0;
          color: #a0a9b9;
          font-size: 13px;
          line-height: 1.7;
        }

        .settings-empty-subtitle {
          margin: -7px 0 0;
          color: #687184;
          font-size: 11px;
          line-height: 1.6;
        }

        .settings-keys-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .settings-key-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          min-width: 0;
          padding: 17px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          background: rgba(255,255,255,.025);
        }

        .settings-key-info {
          min-width: 0;
          flex: 1;
        }

        .settings-key-name {
          margin-bottom: 7px;
          color: #f1f5f9;
          font-size: 13px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .settings-key-value {
          margin-bottom: 6px;
          color: #94a3b8;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          overflow-wrap: anywhere;
          word-break: break-all;
        }

        .settings-key-meta {
          color: #687184;
          font-size: 11px;
        }

        .settings-key-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;
        }

        .settings-key-button {
          min-height: 36px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 9px;
          background: rgba(255,255,255,.05);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s;
        }

        .settings-key-button:hover:not(:disabled) {
          background: rgba(255,255,255,.11);
        }

        .settings-key-button.danger {
          border-color: rgba(248,113,113,.18);
          background: rgba(239,68,68,.07);
          color: #fca5a5;
        }

        .settings-key-button.danger:hover:not(:disabled) {
          background: rgba(239,68,68,.15);
        }

        .settings-key-button:disabled {
          cursor: not-allowed;
          opacity: .5;
        }

        .settings-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 180px;
          color: #8b93a5;
          font-size: 13px;
        }

        .settings-fade-in {
          animation: settingsFadeIn .3s ease both;
        }

        @keyframes settingsFadeIn {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .settings-plans-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .settings-plan-card:last-child {
            grid-column: 1 / -1;
          }

          .settings-plan-card:last-child .settings-plan-features {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .settings-nav {
            min-height: 62px;
            gap: 12px;
            padding: 11px 16px;
          }

          .settings-brand-name {
            font-size: 15px;
          }

          .settings-brand-icon {
            width: 32px;
            height: 32px;
          }

          .settings-nav-links {
            gap: 13px;
          }

          .settings-nav-link {
            font-size: 11px;
          }

          .settings-main {
            padding: 30px 17px 48px;
          }

          .settings-header {
            margin-bottom: 24px;
          }

          .settings-heading {
            letter-spacing: -1.2px;
          }

          .settings-subheading {
            font-size: 13px;
          }

          .settings-tabs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
            margin-bottom: 22px;
          }

          .settings-tab {
            padding: 10px 9px;
          }

          .settings-current-plan {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
            padding: 17px;
          }

          .settings-renewal {
            text-align: left;
          }

          .settings-plans-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .settings-plan-card,
          .settings-plan-card:last-child {
            grid-column: auto;
            padding: 22px;
          }

          .settings-plan-description {
            min-height: auto;
          }

          .settings-plan-amount {
            font-size: 32px;
          }

          .settings-plan-features {
            gap: 12px;
          }

          .settings-api-create {
            flex-direction: column;
          }

          .settings-api-create-button {
            width: 100%;
          }

          .settings-key-row {
            align-items: stretch;
            flex-direction: column;
            gap: 15px;
            padding: 15px;
          }

          .settings-key-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
          }

          .settings-key-button {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .settings-nav {
            padding-left: 12px;
            padding-right: 12px;
          }

          .settings-nav-links {
            gap: 9px;
          }

          .settings-nav-link {
            font-size: 10px;
          }

          .settings-brand {
            gap: 7px;
          }

          .settings-brand-name {
            font-size: 14px;
          }

          .settings-main {
            padding-left: 13px;
            padding-right: 13px;
          }

          .settings-api-panel {
            padding: 16px;
          }

          .settings-plan-card {
            padding: 18px;
          }

          .settings-key-actions {
            gap: 7px;
          }

          .settings-key-button {
            padding: 8px 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .settings-page *,
          .settings-page *::before,
          .settings-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="settings-background" />

      <nav className="settings-nav">
        <Link to="/dashboard" className="settings-brand">
          <span className="settings-brand-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="settings-brand-name">
            Syllabus<span style={{ color: '#60A5FA' }}>AI</span>
          </span>
        </Link>

        <div className="settings-nav-links">
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/chat" label="Chat" />
          <NavLink to="/learn" label="Learn" />
          <NavLink to="/exam" label="Exam" />
        </div>
      </nav>

      <main className="settings-main">
        <header className="settings-header">
          <div className="settings-eyebrow">
            <span className="settings-eyebrow-dot" />
            ACCOUNT CONTROL CENTER
          </div>

          <h1 className="settings-heading">Settings</h1>

          <p className="settings-subheading">
            Manage your subscription, billing plan, and API access from one
            place.
          </p>
        </header>

        <div className="settings-tabs" role="tablist" aria-label="Settings">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'subscription'}
            onClick={() => setActiveTab('subscription')}
            className={`settings-tab ${
              activeTab === 'subscription' ? 'active' : ''
            }`}
          >
            Subscription
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'api-keys'}
            onClick={() => setActiveTab('api-keys')}
            className={`settings-tab ${
              activeTab === 'api-keys' ? 'active' : ''
            }`}
          >
            API Keys
          </button>
        </div>

        {dataLoading ? (
          <div className="settings-loading">
            <span className="settings-spinner" />
            Loading your settings...
          </div>
        ) : (
          <>
            {activeTab === 'subscription' && (
              <section
                className="settings-fade-in"
                role="tabpanel"
                aria-label="Subscription"
              >
                {subscription && (
                  <div className="settings-current-plan">
                    <div>
                      <div className="settings-current-label">
                        Your current plan
                      </div>

                      <div className="settings-current-name">
                        {currentPlan
                          ? currentPlan.charAt(0).toUpperCase() +
                            currentPlan.slice(1)
                          : 'Free'}
                      </div>
                    </div>

                    {currentPlan !== 'free' && subscription.endDate && (
                      <div className="settings-renewal">
                        <div>Subscription ends or renews</div>
                        <strong style={{ color: '#e2e8f0' }}>
                          {new Date(subscription.endDate).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="settings-plans-grid">
                  {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;

                    return (
                      <article
                        key={plan.id}
                        className={`settings-plan-card ${
                          plan.popular ? 'pro' : ''
                        } ${isCurrent ? 'current' : ''}`}
                      >
                        {plan.popular && (
                          <div className="settings-plan-badge">
                            MOST POPULAR
                          </div>
                        )}

                        <div className="settings-plan-name">
                          {plan.name}
                        </div>

                        <div className="settings-plan-description">
                          {plan.description}
                        </div>

                        <div className="settings-plan-price">
                          <span className="settings-plan-amount">
                            {plan.price}
                          </span>

                          <span className="settings-plan-period">
                            {plan.period}
                          </span>
                        </div>

                        <div className="settings-plan-divider" />

                        <ul className="settings-plan-features">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="settings-plan-feature"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#34D399"
                                strokeWidth="2.5"
                                aria-hidden="true"
                              >
                                <path d="M5 12l4 4L19 6" />
                              </svg>

                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {isCurrent ? (
                          <div className="settings-plan-current">
                            ✓ Current plan
                          </div>
                        ) : plan.id === 'free' ? (
                          <div className="settings-plan-free">
                            Free forever
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={Boolean(payLoading)}
                            className={`settings-plan-button ${
                              plan.popular ? 'pro-button' : ''
                            }`}
                          >
                            {payLoading === plan.id ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 9
                                }}
                              >
                                <span className="settings-spinner" />
                                Processing...
                              </span>
                            ) : (
                              `Upgrade to ${plan.name}`
                            )}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === 'api-keys' && (
              <section
                className="settings-api-panel settings-fade-in"
                role="tabpanel"
                aria-label="API Keys"
              >
                <div>
                  <h2 className="settings-api-title">
                    API Keys
                  </h2>

                  <p className="settings-api-description">
                    Create and manage API keys to connect SyllabusAI with your
                    own applications and workflows.
                  </p>
                </div>

                <form
                  className="settings-api-create"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createKey();
                  }}
                >
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Give your key a name, e.g. My App"
                    aria-label="API key name"
                    maxLength={80}
                    className="settings-api-input"
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    disabled={loading || !keyName.trim()}
                    className="settings-api-create-button"
                  >
                    {loading ? (
                      <>
                        <span className="settings-spinner" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">+</span>
                        Generate key
                      </>
                    )}
                  </button>
                </form>

                {apiKeys.length === 0 ? (
                  <div className="settings-empty">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(148,163,184,.65)"
                      strokeWidth="1.4"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>

                    <p className="settings-empty-title">
                      No API keys yet
                    </p>

                    <p className="settings-empty-subtitle">
                      Generate your first key to get started.
                    </p>
                  </div>
                ) : (
                  <div className="settings-keys-list">
                    {apiKeys.map((apiKey) => (
                      <article
                        key={apiKey._id}
                        className="settings-key-row"
                      >
                        <div className="settings-key-info">
                          <div className="settings-key-name">
                            {apiKey.name || 'Unnamed API key'}
                          </div>

                          <div className="settings-key-value">
                            {apiKey.key
                              ? `${apiKey.key.slice(0, 24)}...`
                              : 'Key unavailable'}
                          </div>

                          <div className="settings-key-meta">
                            Used {apiKey.usageCount || 0} times
                          </div>
                        </div>

                        <div className="settings-key-actions">
                          <button
                            type="button"
                            onClick={() => copyKey(apiKey.key)}
                            disabled={!apiKey.key}
                            className="settings-key-button"
                          >
                            Copy key
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteKey(apiKey._id)}
                            disabled={deletingKey === apiKey._id}
                            className="settings-key-button danger"
                          >
                            {deletingKey === apiKey._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}