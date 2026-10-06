import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name:'', email:'', password:'', branch:'', semester:'1' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Fill required fields'); return; }
    if (form.password.length < 6) { toast.error('Password needs 6+ characters'); return; }
    setLoading(true);
    try {
      const result = await signup(form);
      if (result.success) {
        toast.success('Account created');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['transparent','#EF4444','#F59E0B','#10B981'][strength];
  const strengthLabel = ['','Weak','Fair','Strong'][strength];

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <div style={styles.grid} />
      <div style={styles.glowBlue} />
      <div style={styles.glowGreen} />

      <div style={styles.wrapper} className="fade-in">
        <Link to="/" style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.brandText}>SyllabusAI</span>
        </Link>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.heading}>Create account</h1>
            <p style={styles.subheading}>Your AI study team is ready</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Full name <span style={{color:'#EF4444'}}>*</span></label>
                <input value={form.name} onChange={set('name')} placeholder="Sahil Gupta" style={styles.input} className="input-focus" />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email <span style={{color:'#EF4444'}}>*</span></label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" style={styles.input} className="input-focus" />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password <span style={{color:'#EF4444'}}>*</span></label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  placeholder="Min 6 characters"
                  style={{ ...styles.input, paddingRight: 44 }}
                  className="input-focus"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop: 8, display:'flex', gap: 6, alignItems:'center' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)', transition:'all 0.3s' }} />
                  ))}
                  <span style={{ fontSize:11, color: strengthColor, minWidth:36 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Branch</label>
                <input value={form.branch} onChange={set('branch')} placeholder="e.g. Computer Science" style={styles.input} className="input-focus" />
              </div>
              <div style={{ ...styles.field, maxWidth: 100 }}>
                <label style={styles.label}>Semester</label>
                <select value={form.semester} onChange={set('semester')} style={{ ...styles.input, appearance:'none' }} className="input-focus">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.btn} className="btn-hover">
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                    <span style={styles.spinner} className="spin" /> Creating account...
                  </span>
                : 'Create account'
              }
            </button>
          </form>

          <p style={styles.switchText}>
            Have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>

        <p style={styles.footer}>Free forever · No credit card needed</p>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight:'100vh', background:'#07090F', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', overflow:'hidden', fontFamily:"'Inter', -apple-system, sans-serif" },
  grid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' },
  glowBlue: { position:'fixed', top:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents:'none' },
  glowGreen: { position:'fixed', bottom:'-10%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents:'none' },
  wrapper: { width:'100%', maxWidth:420, display:'flex', flexDirection:'column', alignItems:'center', gap:28, position:'relative', zIndex:2 },
  brand: { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  brandIcon: { width:36, height:36, borderRadius:10, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandText: { fontSize:18, fontWeight:700, color:'#fff', letterSpacing:'-0.03em' },
  card: { width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'36px 32px', backdropFilter:'blur(20px)' },
  cardHeader: { marginBottom:28 },
  heading: { fontSize:26, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 6px' },
  subheading: { fontSize:14, color:'rgba(255,255,255,0.4)', margin:0 },
  form: { display:'flex', flexDirection:'column', gap:18 },
  row: { display:'flex', gap:12 },
  field: { display:'flex', flexDirection:'column', flex:1 },
  label: { fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.6)', marginBottom:8 },
  input: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none', width:'100%', boxSizing:'border-box', transition:'border-color 0.2s, box-shadow 0.2s', fontFamily:"'Inter', sans-serif", WebkitAppearance:'none' },
  eyeBtn: { position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', alignItems:'center', padding:4 },
  btn: { background:'#3B82F6', border:'none', borderRadius:12, padding:'14px', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', width:'100%', transition:'all 0.2s', fontFamily:"'Inter', sans-serif", marginTop:4 },
  spinner: { display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' },
  switchText: { textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.4)', margin:'24px 0 0' },
  switchLink: { color:'#60A5FA', textDecoration:'none', fontWeight:500 },
  footer: { fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', margin:0 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  .fade-in { animation: fadeIn 0.5s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .input-focus:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; background: rgba(59,130,246,0.06) !important; }
  .btn-hover:hover:not(:disabled) { background: #2563EB !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
  .btn-hover:active { transform: translateY(0) !important; }
  .btn-hover:disabled { opacity: 0.6; cursor: not-allowed; }
  input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
  select option { background: #0D1424; color: #fff; }
`;