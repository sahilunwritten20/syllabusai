import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ children, delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  );
}

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navBlurred = scrollY > 30;

  const agents = [
    { name: 'Teacher', color: '#3B82F6', desc: 'Explains any topic from your syllabus with clarity and depth, adapted to your level.' },
    { name: 'Examiner', color: '#8B5CF6', desc: 'Generates smart questions from your actual curriculum and evaluates your answers.' },
    { name: 'Debugger', color: '#10B981', desc: 'Identifies bugs in your code and walks you through the fix step by step.' },
    { name: 'Coach', color: '#F59E0B', desc: 'Builds your daily study plan and keeps you accountable and motivated.' },
    { name: 'Research', color: '#06B6D4', desc: 'Dives deep into any concept with comprehensive, well-sourced explanations.' },
    { name: 'Mentor', color: '#F97316', desc: 'Maps your degree to real careers and guides your placement preparation.' },
  ];

  return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.grid} />
      <div style={s.glowTop} />
      <div style={s.glowBottom} />

      {/* NAV */}
      <nav style={{ ...s.nav, background: navBlurred ? 'rgba(7,9,15,0.88)' : 'transparent', backdropFilter: navBlurred ? 'blur(20px)' : 'none', borderBottom: navBlurred ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent' }}>
        <div style={s.navInner} className="nav-inner">
          <Link to="/" style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/></svg>
            </div>
            <span style={s.brandText}>SyllabusAI</span>
          </Link>
          <div className={`nav-links${mobileMenuOpen ? ' nav-links-open' : ''}`}>
            {['Features','How it works','Pricing'].map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                style={s.navLink}
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {l}
              </a>
            ))}
            <div className="mobile-nav-actions">
              <Link to="/login" style={s.navSecondary} className="nav-secondary" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              <Link to="/signup" style={s.navPrimary} className="nav-primary" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
            </div>
          </div>
          <div className="desktop-nav-actions" style={{ display:'flex', gap:10 }}>
            <Link to="/login" style={s.navSecondary} className="nav-secondary">Sign in</Link>
            <Link to="/signup" style={s.navPrimary} className="nav-primary">Get started</Link>
          </div>
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero} className="hero">
        <div style={s.heroInner}>
          <div style={{ ...s.heroBadge, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(12px)', transition: 'all 0.5s 0.1s' }} className="hero-badge">
            <div style={s.badgeDot} />
            <span>AI-powered · Built for Indian college students</span>
          </div>

          <h1 style={{ ...s.heroHeading, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 0.6s 0.2s' }} className="hero-heading">
            Your syllabus.<br />
            <span style={s.heroAccent}>Six AI agents.</span><br />
            One platform.
          </h1>

          <p style={{ ...s.heroSub, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.6s 0.35s' }} className="hero-sub">
            Upload your college syllabus PDF and instantly unlock a team of AI agents trained on your exact curriculum — teacher, examiner, debugger, coach, researcher, and mentor.
          </p>

          <div style={{ ...s.heroCtas, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(12px)', transition: 'all 0.6s 0.5s' }} className="hero-ctas">
            <Link to="/signup" style={s.ctaPrimary} className="cta-primary">Start for free</Link>
            <Link to="/login" style={s.ctaSecondary} className="cta-secondary">Sign in</Link>
          </div>

          <div style={{ ...s.heroStats, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s 0.7s' }} className="hero-stats">
            {[['10,000+','Students'],['6','AI agents'],['99%','Satisfaction'],['50+','Colleges']].map(([v,l]) => (
              <div key={l} style={s.heroStat} className="hero-stat">
                <span style={s.heroStatVal}>{v}</span>
                <span style={s.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={s.section} className="section">
        <div style={s.sectionInner}>
          <Section>
            <div style={s.sectionLabel}>How it works</div>
            <h2 style={s.sectionHeading} className="section-heading">From PDF to personal AI team<br />in under a minute</h2>
          </Section>
          <div style={s.stepsGrid} className="steps-grid">
            {[
              { n:'1', title:'Upload your syllabus', desc:'Drop your college syllabus PDF. Our parser reads every subject, unit, and topic automatically.' },
              { n:'2', title:'AI maps your curriculum', desc:'The AI builds a learning model specific to your branch, semester, and college structure.' },
              { n:'3', title:'Learn with six agents', desc:'Chat with specialized AI agents available 24/7, each trained on your exact syllabus.' },
            ].map((step, i) => (
              <Section key={i} delay={i * 0.1}>
                <div style={s.stepCard} className="step-card">
                  <div style={s.stepNum}>{step.n}</div>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepDesc}>{step.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="features" style={s.section} className="section">
        <div style={s.sectionInner}>
          <Section>
            <div style={s.sectionLabel}>Six agents</div>
            <h2 style={s.sectionHeading} className="section-heading">Every kind of help you need,<br />in one place</h2>
            <p style={s.sectionSub} className="section-sub">Each agent specializes in a different mode of learning — and all of them know your syllabus.</p>
          </Section>
          <div style={s.agentsGrid} className="agents-grid">
            {agents.map((a, i) => (
              <Section key={i} delay={i * 0.07}>
                <div style={s.agentCard} className="agent-card">
                  <div style={{ ...s.agentDot, background: a.color }} />
                  <div style={s.agentName}>{a.name}</div>
                  <p style={s.agentDesc}>{a.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={s.section} className="section">
        <div style={s.sectionInner}>
          <Section>
            <div style={s.sectionLabel}>Pricing</div>
            <h2 style={s.sectionHeading} className="section-heading">Simple pricing.<br />Free to start.</h2>
          </Section>
          <div style={s.plansGrid} className="plans-grid">
            {[
              { name:'Free', price:'₹0', period:'forever', features:['50 AI messages / month','1 syllabus upload','Basic agents','Chat history'], cta:'Get started', primary:false },
              { name:'Pro', price:'₹299', period:'/ month', features:['1,000 messages / month','10 uploads','All 6 agents','Voice input','Memory system'], cta:'Start Pro', primary:true },
              { name:'College', price:'₹9,999', period:'/ month', features:['Unlimited everything','Teacher dashboard','Analytics','Custom branding'], cta:'Contact us', primary:false },
            ].map((plan, i) => (
              <Section key={i} delay={i * 0.1}>
                <div style={{ ...s.planCard, ...(plan.primary ? s.planCardPrimary : {}) }} className={plan.primary ? 'plan-primary' : 'plan-card'}>
                  {plan.primary && <div style={s.planBadge}>Most popular</div>}
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
                  <Link to="/signup" style={{ ...s.planCta, ...(plan.primary ? s.planCtaPrimary : {}) }} className={plan.primary ? 'cta-primary' : 'cta-outline'}>
                    {plan.cta}
                  </Link>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={s.section} className="section">
        <div style={s.sectionInner}>
          <Section>
            <div style={s.ctaBanner} className="cta-banner">
              <h2 style={s.ctaBannerHeading} className="cta-banner-heading">Ready to ace your semester?</h2>
              <p style={s.ctaBannerSub} className="cta-banner-sub">Join thousands of students already learning smarter.</p>
              <Link to="/signup" style={s.ctaPrimary} className="cta-primary">Start for free</Link>
            </div>
          </Section>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner} className="footer-inner">
          <div style={s.brand}>
            <div style={s.brandIcon}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/></svg></div>
            <span style={{ ...s.brandText, fontSize:14 }}>SyllabusAI</span>
          </div>
          <p style={s.footerCopy}>© 2025 SyllabusAI. Built for students, by engineers.</p>
          <div style={s.footerLinks} className="footer-links">
            {['Privacy','Terms','Contact'].map(l => <a key={l} href="#" style={s.footerLink} className="footer-link">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  root: { background:'#07090F', color:'#fff', fontFamily:"'Inter',-apple-system,sans-serif", minHeight:'100vh', width:'100%', overflowX:'clip', position:'relative' },
  grid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none', zIndex:0 },
  glowTop: { position:'fixed', top:'-15%', left:'20%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  glowBottom: { position:'fixed', bottom:'-10%', right:'10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:100, transition:'all 0.3s' },
  navInner: { maxWidth:1080, margin:'0 auto', padding:'0 32px', minHeight:68, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20 },
  brand: { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  brandIcon: { width:30, height:30, borderRadius:8, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandText: { fontSize:16, fontWeight:700, color:'#fff', letterSpacing:'-0.03em' },
  navLinks: { display:'flex', gap:32 },
  navLink: { color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:13, fontWeight:500 },
  navSecondary: { color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13, fontWeight:500, padding:'8px 14px', borderRadius:10 },
  navPrimary: { background:'#3B82F6', color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600, padding:'8px 18px', borderRadius:10 },
  hero: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px 80px', position:'relative', zIndex:1 },
  heroInner: { width:'100%', maxWidth:700, margin:'0 auto', textAlign:'center' },
  heroBadge: { display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, maxWidth:'100%', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:100, padding:'8px 16px', fontSize:12, color:'rgba(96,165,250,0.9)', marginBottom:32, fontWeight:500, lineHeight:1.5 },
  badgeDot: { width:6, height:6, borderRadius:'50%', background:'#3B82F6', flexShrink:0 },
  heroHeading: { fontSize:62, fontWeight:800, letterSpacing:'-0.045em', lineHeight:1.05, margin:'0 0 24px', color:'#fff' },
  heroAccent: { background:'linear-gradient(135deg,#60A5FA,#818CF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  heroSub: { fontSize:17, color:'rgba(255,255,255,0.45)', lineHeight:1.7, maxWidth:520, margin:'0 auto 36px' },
  heroCtas: { display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:56 },
  ctaPrimary: { background:'#3B82F6', color:'#fff', textDecoration:'none', fontSize:14, fontWeight:600, padding:'13px 28px', borderRadius:12, transition:'all 0.2s', display:'inline-block' },
  ctaSecondary: { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:14, fontWeight:500, padding:'13px 28px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', transition:'all 0.2s', display:'inline-block' },
  heroStats: { display:'flex', gap:0, justifyContent:'center', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:32, width:'100%' },
  heroStat: { display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'0 24px', minWidth:0, borderRight:'1px solid rgba(255,255,255,0.06)' },
  heroStatVal: { fontSize:24, fontWeight:800, letterSpacing:'-0.04em', color:'#fff' },
  heroStatLabel: { fontSize:12, color:'rgba(255,255,255,0.35)' },
  section: { padding:'96px 24px', position:'relative', zIndex:1 },
  sectionInner: { width:'100%', maxWidth:1080, margin:'0 auto' },
  sectionLabel: { fontSize:12, color:'rgba(59,130,246,0.8)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 },
  sectionHeading: { fontSize:'clamp(30px, 4vw, 42px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.15, margin:'0 0 16px', color:'#fff', overflowWrap:'break-word' },
  sectionSub: { fontSize:16, color:'rgba(255,255,255,0.4)', lineHeight:1.7, maxWidth:480, margin:'0 0 56px' },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, marginTop:56 },
  stepCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'32px 28px', transition:'all 0.25s' },
  stepNum: { fontSize:11, fontWeight:700, color:'rgba(59,130,246,0.6)', letterSpacing:'0.1em', marginBottom:20 },
  stepTitle: { fontSize:18, fontWeight:700, letterSpacing:'-0.03em', margin:'0 0 12px', color:'#fff' },
  stepDesc: { fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.7, margin:0 },
  agentsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:56 },
  agentCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'28px 24px', transition:'all 0.25s' },
  agentDot: { width:8, height:8, borderRadius:'50%', marginBottom:16 },
  agentName: { fontSize:16, fontWeight:700, letterSpacing:'-0.02em', marginBottom:10, color:'#fff' },
  agentDesc: { fontSize:13.5, color:'rgba(255,255,255,0.4)', lineHeight:1.7, margin:0 },
  plansGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginTop:56, alignItems:'start' },
  planCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'32px 28px', transition:'all 0.25s' },
  planCardPrimary: { background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.25)' },
  planBadge: { fontSize:11, fontWeight:600, color:'#60A5FA', background:'rgba(59,130,246,0.15)', borderRadius:100, padding:'4px 12px', display:'inline-block', marginBottom:20, letterSpacing:'0.04em' },
  planName: { fontSize:15, fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:12 },
  planPrice: { display:'flex', alignItems:'baseline', gap:6, marginBottom:20 },
  planAmount: { fontSize:36, fontWeight:800, letterSpacing:'-0.04em', color:'#fff' },
  planPeriod: { fontSize:14, color:'rgba(255,255,255,0.35)' },
  planDivider: { height:1, background:'rgba(255,255,255,0.07)', marginBottom:20 },
  planFeatures: { listStyle:'none', margin:'0 0 28px', padding:0, display:'flex', flexDirection:'column', gap:12 },
  planFeature: { display:'flex', alignItems:'center', gap:10, fontSize:13.5, color:'rgba(255,255,255,0.6)' },
  planCta: { display:'block', textAlign:'center', textDecoration:'none', fontSize:14, fontWeight:600, padding:'12px', borderRadius:12, transition:'all 0.2s', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.05)' },
  planCtaPrimary: { background:'#3B82F6', border:'none', color:'#fff' },
  ctaBanner: { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'clamp(32px, 6vw, 72px) clamp(20px, 4vw, 48px)', textAlign:'center' },
  ctaBannerHeading: { fontSize:'clamp(28px, 4vw, 40px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.15, margin:'0 0 16px', color:'#fff', overflowWrap:'break-word' },
  ctaBannerSub: { fontSize:16, color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 auto 36px', maxWidth:520 },
  footer: { borderTop:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px' },
  footerInner: { maxWidth:1080, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' },
  footerCopy: { fontSize:13, color:'rgba(255,255,255,0.25)', margin:0 },
  footerLinks: { display:'flex', gap:24 },
  footerLink: { fontSize:13, color:'rgba(255,255,255,0.3)', textDecoration:'none' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root { color-scheme: dark; }
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; scroll-padding-top: 88px; }
  body { margin: 0; min-width: 320px; -webkit-font-smoothing: antialiased; }
  body, button, a { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  img, svg { max-width: 100%; }
  a { -webkit-tap-highlight-color: transparent; }
  button { font: inherit; }
  section[id] { scroll-margin-top: 88px; }

  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-link { transition: color .2s ease; }
  .nav-link:hover { color: rgba(255,255,255,.95) !important; }
  .nav-primary, .cta-primary { transition: background .2s ease, transform .2s ease, box-shadow .2s ease; }
  .nav-primary:hover { background: #2563EB !important; transform: translateY(-1px); }
  .nav-secondary:hover { color: rgba(255,255,255,.95) !important; background: rgba(255,255,255,.06) !important; }
  .cta-primary:hover { background: #2563EB !important; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.25); }
  .cta-secondary:hover { background: rgba(255,255,255,.1) !important; color: #fff !important; }
  .cta-outline:hover { background: rgba(255,255,255,.08) !important; }
  .step-card, .agent-card, .plan-card, .plan-primary { min-width: 0; }
  .step-card, .agent-card, .plan-card { transition: transform .25s ease, border-color .25s ease, background .25s ease; }
  .step-card:hover, .agent-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,.14) !important; background: rgba(255,255,255,.05) !important; }
  .plan-card:hover, .plan-primary:hover { transform: translateY(-3px); }
  .footer-link:hover { color: rgba(255,255,255,.65) !important; }
  .mobile-menu-toggle, .mobile-nav-actions { display: none; }

  @media (max-width: 900px) {
    .nav-inner { padding-left: 24px !important; padding-right: 24px !important; }
    .nav-links { gap: 20px !important; }
    .steps-grid, .agents-grid, .plans-grid { gap: 16px !important; }
    .step-card, .plan-card { padding: 28px 22px !important; }
    .agent-card { padding: 24px 20px !important; }
    .hero-stat { padding-left: 20px !important; padding-right: 20px !important; }
  }

  @media (max-width: 700px) {
    .nav-inner { min-height: 64px !important; padding: 0 18px !important; gap: 12px !important; }
    .brand-text { font-size: 15px !important; }
    .desktop-nav-actions, .nav-links { display: none !important; }
    .mobile-menu-toggle {
      display: flex; flex: 0 0 auto; width: 42px; height: 42px; padding: 11px;
      flex-direction: column; justify-content: center; gap: 5px; align-items: center;
      color: #fff; border: 1px solid rgba(255,255,255,.12); border-radius: 12px;
      background: rgba(255,255,255,.05); cursor: pointer;
    }
    .mobile-menu-toggle span { display: block; width: 17px; height: 2px; border-radius: 2px; background: #fff; }
    .nav-links.nav-links-open {
      display: flex !important; position: absolute; top: calc(100% + 1px); left: 0; right: 0;
      padding: 18px; flex-direction: column; align-items: stretch; gap: 4px !important;
      background: rgba(7,9,15,.98); border-bottom: 1px solid rgba(255,255,255,.09);
      box-shadow: 0 18px 35px rgba(0,0,0,.28); backdrop-filter: blur(18px);
    }
    .nav-links.nav-links-open .nav-link { display: block; padding: 13px 10px; font-size: 14px !important; }
    .mobile-nav-actions { display: flex; gap: 10px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.08); margin-top: 8px; }
    .mobile-nav-actions a { flex: 1; text-align: center; padding: 12px 10px !important; }
    .hero { min-height: auto !important; padding: 112px 20px 64px !important; }
    .hero-badge { max-width: 100%; }
    .hero-heading { font-size: clamp(36px, 9vw, 48px) !important; line-height: 1.08 !important; letter-spacing: -.045em !important; overflow-wrap: anywhere; }
    .hero-sub { font-size: 15px !important; line-height: 1.75 !important; }
    .hero-ctas { gap: 10px !important; margin-bottom: 42px !important; }
    .hero-ctas a { flex: 1 1 140px; text-align: center; padding: 13px 16px !important; }
    .hero-stats { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 22px; padding-top: 24px !important; }
    .hero-stat { padding: 0 8px !important; border-right: 0 !important; }
    .hero-stat:nth-child(odd) { border-right: 1px solid rgba(255,255,255,.08) !important; }
    .hero-stat-val { font-size: 22px !important; }
    .hero-stat-label { font-size: 11px !important; }
    .section { padding: 68px 20px !important; }
    .section-heading { font-size: clamp(28px, 7vw, 36px) !important; line-height: 1.16 !important; }
    .section-sub { margin-bottom: 32px !important; font-size: 14px !important; }
    .steps-grid, .agents-grid, .plans-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 14px !important; margin-top: 32px !important; }
    .step-card, .agent-card, .plan-card { padding: 24px 22px !important; border-radius: 18px !important; }
    .step-num { margin-bottom: 14px !important; }
    .plan-amount { font-size: 34px !important; }
    .cta-banner { padding: 36px 22px !important; border-radius: 20px !important; }
    .cta-banner-heading { font-size: clamp(27px, 7vw, 34px) !important; }
    .cta-banner-sub { font-size: 14px !important; margin-bottom: 26px !important; }
    .footer { padding: 28px 20px !important; }
    .footer-inner { flex-direction: column; align-items: flex-start !important; gap: 18px !important; }
    .footer-copy { line-height: 1.6; }
    .footer-links { gap: 20px !important; flex-wrap: wrap; }
  }

  @media (max-width: 380px) {
    .nav-inner { padding-left: 14px !important; padding-right: 14px !important; }
    .brand { gap: 7px !important; }
    .brand-text { font-size: 14px !important; }
    .hero { padding-left: 16px !important; padding-right: 16px !important; }
    .hero-badge { font-size: 10px !important; padding: 7px 10px !important; margin-bottom: 24px !important; }
    .hero-heading { font-size: 34px !important; }
    .section { padding-left: 16px !important; padding-right: 16px !important; }
    .hero-ctas a { flex-basis: 100%; }
    .mobile-nav-actions { flex-direction: column; }
  }

  @media (hover: none) {
    .step-card:hover, .agent-card:hover, .plan-card:hover, .plan-primary:hover,
    .cta-primary:hover, .nav-primary:hover { transform: none; box-shadow: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
`;
