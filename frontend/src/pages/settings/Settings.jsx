import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const NavLink = ({ to, label }) => (
  <Link to={to} style={navLinkStyle} className="nav-link">{label}</Link>
);

export default function Settings() {
  const [apiKeys, setApiKeys] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState('');
  const [activeTab, setActiveTab] = useState('subscription');

  useEffect(() => {
    fetchData();
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
      setApiKeys(keysRes.data.keys || []);
      setSubscription(subRes.data.subscription);
    } catch {}
  };

  const handleUpgrade = async (plan) => {
    setPayLoading(plan);
    try {
      const res = await API.post('/payment/create-order', { plan });
      const { order, key, amount, name } = res.data;
      const options = {
        key, amount, currency: 'INR',
        name: 'SyllabusAI', description: name,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payment/verify', { ...response, plan });
            if (verifyRes.data.success) { toast.success('Plan activated'); fetchData(); }
          } catch { toast.error('Verification failed'); }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#3B82F6' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    setPayLoading('');
  };

  const createKey = async () => {
    if (!keyName.trim()) { toast.error('Enter a name'); return; }
    setLoading(true);
    try {
      await API.post('/keys', { name: keyName });
      toast.success('API key created');
      setKeyName('');
      fetchData();
    } catch { toast.error('Failed to create key'); }
    setLoading(false);
  };

  const deleteKey = async (id) => {
    try {
      await API.delete(`/keys/${id}`);
      toast.success('Key deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('Copied to clipboard');
  };

  const plans = [
    { id: 'free', name: 'Free', price: '₹0', period: 'forever', features: ['50 messages / month', '1 syllabus upload', 'Basic agents', 'Chat history'] },
    { id: 'pro', name: 'Pro', price: '₹299', period: '/ month', features: ['1,000 messages / month', '10 uploads', 'All 6 agents', 'Voice input', 'Memory system'], popular: true },
    { id: 'college', name: 'College', price: '₹9,999', period: '/ month', features: ['Unlimited everything', 'Teacher dashboard', 'Analytics', 'Custom branding'] },
  ];

  return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.grid} />

      <nav style={s.nav}>
        <Link to="/dashboard" style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/></svg>
          </div>
          <span style={s.brandText}>SyllabusAI</span>
        </Link>
        <div style={s.navLinks}>
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/chat" label="Chat" />
          <NavLink to="/learn" label="Learn" />
          <NavLink to="/exam" label="Exam" />
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>
          <div style={s.pageHeader}>
            <h1 style={s.heading}>Settings</h1>
            <p style={s.subheading}>Manage your subscription and API access</p>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {['subscription', 'api-keys'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
                className="tab-btn">
                {tab === 'subscription' ? 'Subscription' : 'API Keys'}
              </button>
            ))}
          </div>

          {/* Subscription tab */}
          {activeTab === 'subscription' && (
            <div className="fade-in">
              {subscription && (
                <div style={s.currentPlan}>
                  <div style={s.currentPlanLeft}>
                    <div style={s.currentPlanLabel}>Current plan</div>
                    <div style={s.currentPlanName}>{subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</div>
                  </div>
                  {subscription.plan !== 'free' && subscription.endDate && (
                    <div style={s.currentPlanRight}>
                      Renews {new Date(subscription.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </div>
                  )}
                </div>
              )}

              <div style={s.plansGrid}>
                {plans.map((plan) => {
                  const isCurrent = subscription?.plan === plan.id;
                  return (
                    <div key={plan.id} style={{ ...s.planCard, ...(plan.popular ? s.planCardPro : {}), ...(isCurrent ? s.planCardCurrent : {}) }}>
                      {plan.popular && <div style={s.planBadge}>Most popular</div>}
                      <div style={s.planName}>{plan.name}</div>
                      <div style={s.planPrice}>
                        <span style={s.planAmount}>{plan.price}</span>
                        <span style={s.planPeriod}>{plan.period}</span>
                      </div>
                      <div style={s.planDivider} />
                      <ul style={s.planFeatures}>
                        {plan.features.map(f => (
                          <li key={f} style={s.planFeature}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <div style={s.planCurrent}>Current plan</div>
                      ) : plan.id === 'free' ? (
                        <div style={s.planFreeLabel}>Free forever</div>
                      ) : (
                        <button onClick={() => handleUpgrade(plan.id)} disabled={payLoading === plan.id}
                          style={{ ...s.planBtn, ...(plan.popular ? s.planBtnPro : {}) }} className="plan-btn">
                          {payLoading === plan.id
                            ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}><span style={s.spinner} className="spin" /> Processing...</span>
                            : `Upgrade to ${plan.name}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* API Keys tab */}
          {activeTab === 'api-keys' && (
            <div className="fade-in">
              <div style={s.apiSection}>
                <div style={s.apiSectionHeader}>
                  <div>
                    <h2 style={s.apiTitle}>API Keys</h2>
                    <p style={s.apiDesc}>Use these keys to access SyllabusAI from your own applications</p>
                  </div>
                </div>
                <div style={s.apiCreate}>
                  <input
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    placeholder="Key name — e.g. My App"
                    style={s.apiInput}
                    className="input-focus"
                    onKeyDown={e => e.key === 'Enter' && createKey()}
                  />
                  <button onClick={createKey} disabled={loading} style={s.apiCreateBtn} className="create-btn">
                    {loading ? <span style={s.spinner} className="spin" /> : 'Generate key'}
                  </button>
                </div>

                {apiKeys.length === 0 ? (
                  <div style={s.emptyState}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    <p style={s.emptyText}>No API keys yet. Generate one above.</p>
                  </div>
                ) : (
                  <div style={s.keysList}>
                    {apiKeys.map((k, i) => (
                      <div key={i} style={s.keyRow}>
                        <div style={s.keyInfo}>
                          <div style={s.keyName}>{k.name}</div>
                          <div style={s.keyValue}>{k.key?.slice(0, 24)}...</div>
                          <div style={s.keyMeta}>Used {k.usageCount || 0} times</div>
                        </div>
                        <div style={s.keyActions}>
                          <button onClick={() => copyKey(k.key)} style={s.keyBtn} className="key-btn">Copy</button>
                          <button onClick={() => deleteKey(k._id)} style={s.keyBtnDanger} className="key-btn-danger">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const navLinkStyle = { color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:13, fontWeight:500, transition:'color 0.2s' };

const s = {
  root: { minHeight:'100vh', background:'#07090F', color:'#fff', fontFamily:"'Inter',-apple-system,sans-serif" },
  grid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none', zIndex:0 },
  nav: { position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:60, background:'rgba(7,9,15,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  brand: { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  brandIcon: { width:32, height:32, borderRadius:9, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandText: { fontSize:16, fontWeight:700, color:'#fff', letterSpacing:'-0.03em' },
  navLinks: { display:'flex', gap:28 },
  main: { position:'relative', zIndex:1 },
  container: { maxWidth:900, margin:'0 auto', padding:'40px 32px 80px' },
  pageHeader: { marginBottom:36 },
  heading: { fontSize:28, fontWeight:800, letterSpacing:'-0.04em', margin:'0 0 6px' },
  subheading: { fontSize:14, color:'rgba(255,255,255,0.4)', margin:0 },
  tabs: { display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:4, marginBottom:32, width:'fit-content' },
  tab: { padding:'8px 20px', borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.4)', background:'transparent', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  tabActive: { background:'rgba(255,255,255,0.08)', color:'#fff' },
  currentPlan: { display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:14, padding:'16px 20px', marginBottom:24 },
  currentPlanLeft: {},
  currentPlanLabel: { fontSize:11, color:'rgba(96,165,250,0.7)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 },
  currentPlanName: { fontSize:18, fontWeight:700, letterSpacing:'-0.03em' },
  currentPlanRight: { fontSize:12, color:'rgba(255,255,255,0.4)' },
  plansGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 },
  planCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'28px 24px', transition:'all 0.25s' },
  planCardPro: { background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.2)' },
  planCardCurrent: { border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.05)' },
  planBadge: { fontSize:11, fontWeight:600, color:'#60A5FA', background:'rgba(59,130,246,0.15)', borderRadius:100, padding:'3px 10px', display:'inline-block', marginBottom:16, letterSpacing:'0.04em' },
  planName: { fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:10 },
  planPrice: { display:'flex', alignItems:'baseline', gap:6, marginBottom:18 },
  planAmount: { fontSize:30, fontWeight:800, letterSpacing:'-0.04em', color:'#fff' },
  planPeriod: { fontSize:13, color:'rgba(255,255,255,0.35)' },
  planDivider: { height:1, background:'rgba(255,255,255,0.07)', marginBottom:18 },
  planFeatures: { listStyle:'none', margin:'0 0 24px', padding:0, display:'flex', flexDirection:'column', gap:10 },
  planFeature: { display:'flex', alignItems:'center', gap:9, fontSize:13, color:'rgba(255,255,255,0.55)' },
  planBtn: { width:'100%', padding:'11px', borderRadius:11, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  planBtnPro: { background:'#3B82F6', border:'none', color:'#fff' },
  planCurrent: { textAlign:'center', fontSize:13, color:'#10B981', fontWeight:600, padding:'11px 0' },
  planFreeLabel: { textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)', padding:'11px 0' },
  spinner: { display:'inline-block', width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' },
  apiSection: {},
  apiSectionHeader: { marginBottom:20 },
  apiTitle: { fontSize:18, fontWeight:700, letterSpacing:'-0.03em', margin:'0 0 6px' },
  apiDesc: { fontSize:13, color:'rgba(255,255,255,0.4)', margin:0 },
  apiCreate: { display:'flex', gap:10, marginBottom:24 },
  apiInput: { flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 14px', color:'#fff', fontSize:13, outline:'none', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  apiCreateBtn: { background:'#3B82F6', border:'none', borderRadius:12, padding:'11px 20px', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s', whiteSpace:'nowrap' },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'48px 0' },
  emptyText: { fontSize:13, color:'rgba(255,255,255,0.25)', margin:0 },
  keysList: { display:'flex', flexDirection:'column', gap:10 },
  keyRow: { display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 20px' },
  keyInfo: {},
  keyName: { fontSize:14, fontWeight:600, marginBottom:4 },
  keyValue: { fontSize:12, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', marginBottom:4 },
  keyMeta: { fontSize:11, color:'rgba(255,255,255,0.25)' },
  keyActions: { display:'flex', gap:8 },
  keyBtn: { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'6px 14px', color:'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  keyBtnDanger: { background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:9, padding:'6px 14px', color:'#F87171', fontSize:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin:0; -webkit-font-smoothing:antialiased; }
  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .nav-link:hover { color: rgba(255,255,255,0.9) !important; }
  .input-focus:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
  .tab-btn:hover { color: rgba(255,255,255,0.8) !important; }
  .plan-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
  .create-btn:hover { background: #2563EB !important; }
  .key-btn:hover { background: rgba(255,255,255,0.1) !important; }
  .key-btn-danger:hover { background: rgba(239,68,68,0.15) !important; }
  input::placeholder { color: rgba(255,255,255,0.2); }
`;