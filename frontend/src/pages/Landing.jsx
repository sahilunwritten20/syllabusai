import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window)
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Section({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`landing-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}s` }}
    >
      {children}
    </div>
  );
}

function Icon({ name, size = 20 }) {
  const icons = {
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    sparkle: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        <path d="m19 3 .8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3Z" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8M8 11h6" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 5-7" />
      </>
    ),
    code: (
      <>
        <path d="m8 8-4 4 4 4" />
        <path d="m16 8 4 4-4 4" />
        <path d="m14 4-4 16" />
      </>
    ),
    flame: (
      <path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-2-1-3-3-3-5-3 3-4 6-4 9a7 7 0 0 0 7 7Z" />
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m16.2 7.8-2.4 5.9-6 2.5 2.5-6 5.9-2.4Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    graduation: (
      <>
        <path d="m2 10 10-5 10 5-10 5-10-5Z" />
        <path d="M6 12v5c3.5 3 8.5 3 12 0v-5" />
        <path d="M22 10v6" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] || icons.sparkle}
    </svg>
  );
}

const agents = [
  {
    name: 'Teacher',
    color: 'blue',
    number: '01',
    icon: 'book',
    desc: 'Understand difficult topics through clear explanations shaped around your syllabus and learning level.',
    tag: 'Learn',
  },
  {
    name: 'Examiner',
    color: 'violet',
    number: '02',
    icon: 'check',
    desc: 'Practice with curriculum-focused questions, test your understanding, and identify where to improve.',
    tag: 'Practice',
  },
  {
    name: 'Debugger',
    color: 'green',
    number: '03',
    icon: 'code',
    desc: 'Investigate coding errors, understand why they happen, and work through solutions step by step.',
    tag: 'Build',
  },
  {
    name: 'Coach',
    color: 'amber',
    number: '04',
    icon: 'flame',
    desc: 'Build consistent study habits, plan your next session, and keep moving towards your goals.',
    tag: 'Stay consistent',
  },
  {
    name: 'Research',
    color: 'cyan',
    number: '05',
    icon: 'compass',
    desc: 'Explore unfamiliar ideas with structured explanations that help connect concepts and details.',
    tag: 'Explore',
  },
  {
    name: 'Mentor',
    color: 'orange',
    number: '06',
    icon: 'graduation',
    desc: 'Connect your education to possible career paths, useful skills, and placement preparation.',
    tag: 'Plan ahead',
  },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Get started with the essentials.',
    features: [
      '50 AI messages / month',
      '1 syllabus upload',
      'Basic agents',
      'Chat history',
    ],
    cta: 'Get started',
    primary: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/ month',
    description: 'For focused, everyday learning.',
    features: [
      '1,000 messages / month',
      '10 syllabus uploads',
      'All 6 agents',
      'Voice input',
      'Memory system',
    ],
    cta: 'Start Pro',
    primary: true,
  },
  {
    name: 'College',
    price: '₹9,999',
    period: '/ month',
    description: 'For institutions and learning teams.',
    features: [
      'Unlimited everything',
      'Teacher dashboard',
      'Analytics',
      'Custom branding',
    ],
    cta: 'Get started',
    primary: false,
  },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 80);

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navBlurred = scrollY > 30;

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <div className="landing-page">
      <style>{landingCSS}</style>

      <div className="landing-background" aria-hidden="true">
        <div className="landing-grid" />
        <div className="landing-glow landing-glow-top" />
        <div className="landing-glow landing-glow-left" />
        <div className="landing-glow landing-glow-bottom" />
      </div>

      {/* Navigation */}
      <nav
        className={`landing-nav ${navBlurred ? 'landing-nav-scrolled' : ''}`}
      >
        <div className="landing-nav-inner">
          <Link
            to="/"
            className="landing-brand"
            aria-label="SyllabusAI home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="landing-brand-icon">
              <Icon name="layers" size={19} />
            </span>

            <span className="landing-brand-name">
              Syllabus<span>AI</span>
            </span>
          </Link>

          <div
            className={`landing-nav-links ${
              mobileMenuOpen ? 'landing-nav-links-open' : ''
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="landing-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="landing-mobile-actions">
              <Link
                to="/login"
                className="landing-button landing-button-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                className="landing-button landing-button-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get started <Icon name="arrow" size={15} />
              </Link>
            </div>
          </div>

          <div className="landing-desktop-actions">
            <Link to="/login" className="landing-signin">
              Sign in
            </Link>

            <Link to="/signup" className="landing-button landing-button-primary landing-nav-cta">
              Get started <Icon name="arrow" size={15} />
            </Link>
          </div>

          <button
            type="button"
            className={`landing-menu-toggle ${
              mobileMenuOpen ? 'landing-menu-toggle-open' : ''
            }`}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
        <span id="landing-mobile-navigation" className="landing-sr-only">
          Main navigation
        </span>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-orbit landing-hero-orbit-one" aria-hidden="true" />
        <div className="landing-hero-orbit landing-hero-orbit-two" aria-hidden="true" />

        <div className="landing-hero-inner">
          <div
            className={`landing-hero-badge ${mounted ? 'landing-entered' : ''}`}
            style={{ '--enter-delay': '0.08s' }}
          >
            <span className="landing-badge-sparkle">
              <Icon name="sparkle" size={14} />
            </span>
            <span>AI-powered learning, built for college students</span>
          </div>

          <h1
            className={`landing-hero-heading ${mounted ? 'landing-entered' : ''}`}
            style={{ '--enter-delay': '0.16s' }}
          >
            Your syllabus.
            <br />
            <span className="landing-gradient-text">Six AI agents.</span>
            <br />
            One platform.
          </h1>

          <p
            className={`landing-hero-subtitle ${mounted ? 'landing-entered' : ''}`}
            style={{ '--enter-delay': '0.25s' }}
          >
            Upload your college syllabus PDF and unlock a team of AI assistants
            for learning, practice, coding, research, and career planning —
            all in one place.
          </p>

          <div
            className={`landing-hero-actions ${mounted ? 'landing-entered' : ''}`}
            style={{ '--enter-delay': '0.34s' }}
          >
            <Link to="/signup" className="landing-button landing-button-primary landing-hero-cta">
              Start for free
              <span className="landing-button-arrow">
                <Icon name="arrow" size={17} />
              </span>
            </Link>

            <a href="#features" className="landing-button landing-button-outline landing-hero-secondary">
              Explore the platform
            </a>
          </div>

          <div
            className={`landing-hero-proof ${mounted ? 'landing-entered' : ''}`}
            style={{ '--enter-delay': '0.43s' }}
          >
            <div className="landing-proof-avatars" aria-hidden="true">
              <span>S</span>
              <span>A</span>
              <span>+</span>
            </div>
            <p>
              One focused space for your <strong>learning journey</strong>
            </p>
          </div>

          <div
            className={`landing-hero-stats ${mounted ? 'landing-entered' : ''}`}
            style={{ '--enter-delay': '0.54s' }}
          >
            {[
              { value: '6', label: 'AI agents' },
              { value: '24/7', label: 'Learning support' },
              { value: '1', label: 'Learning space' },
            ].map((stat) => (
              <div key={stat.label} className="landing-hero-stat">
                <span className="landing-hero-stat-value">{stat.value}</span>
                <span className="landing-hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-visual-halo" />
          <div className="landing-visual-ring landing-ring-one" />
          <div className="landing-visual-ring landing-ring-two" />
          <div className="landing-visual-ring landing-ring-three" />

          <div className="landing-visual-center">
            <div className="landing-visual-center-inner">
              <Icon name="layers" size={42} />
            </div>
          </div>

          <div className="landing-visual-node landing-node-one">
            <span className="landing-node-icon landing-node-blue">
              <Icon name="book" size={17} />
            </span>
            <span className="landing-node-copy">
              <strong>Teacher</strong>
              <small>Learn clearly</small>
            </span>
          </div>

          <div className="landing-visual-node landing-node-two">
            <span className="landing-node-icon landing-node-violet">
              <Icon name="check" size={17} />
            </span>
            <span className="landing-node-copy">
              <strong>Examiner</strong>
              <small>Practice smarter</small>
            </span>
          </div>

          <div className="landing-visual-node landing-node-three">
            <span className="landing-node-icon landing-node-green">
              <Icon name="code" size={17} />
            </span>
            <span className="landing-node-copy">
              <strong>Debugger</strong>
              <small>Build with confidence</small>
            </span>
          </div>

          <div className="landing-visual-node landing-node-four">
            <span className="landing-node-icon landing-node-amber">
              <Icon name="compass" size={17} />
            </span>
            <span className="landing-node-copy">
              <strong>Mentor</strong>
              <small>Plan your future</small>
            </span>
          </div>

          <span className="landing-visual-star landing-star-one" />
          <span className="landing-visual-star landing-star-two" />
          <span className="landing-visual-star landing-star-three" />
        </div>

        <a href="#how-it-works" className="landing-scroll-hint">
          <span className="landing-scroll-line" />
          Scroll to explore
        </a>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-process-section">
        <div className="landing-section-inner">
          <Section>
            <div className="landing-section-heading">
              <span className="landing-section-eyebrow">
                <span /> A BETTER WAY TO STUDY
              </span>

              <h2>
                From syllabus to
                <br />
                <span className="landing-gradient-text">personal AI team.</span>
              </h2>

              <p>
                Move from a long document to a clearer learning plan with a
                simple, guided process.
              </p>
            </div>
          </Section>

          <div className="landing-steps-grid">
            {[
              {
                n: '01',
                icon: 'upload',
                title: 'Upload your syllabus',
                desc: 'Start with your college syllabus PDF and bring your subjects and topics into one learning space.',
                accent: 'blue',
              },
              {
                n: '02',
                icon: 'layers',
                title: 'Organize your learning',
                desc: 'Use your curriculum as a starting point to focus on the concepts and areas you need to learn.',
                accent: 'violet',
              },
              {
                n: '03',
                icon: 'sparkle',
                title: 'Learn with AI agents',
                desc: 'Switch between explanations, practice, coding help, research, and career guidance as needed.',
                accent: 'green',
              },
            ].map((step, index) => (
              <Section key={step.n} delay={index * 0.08}>
                <article className="landing-step-card">
                  <div className="landing-step-top">
                    <span className={`landing-step-icon landing-accent-${step.accent}`}>
                      <Icon name={step.icon} size={21} />
                    </span>
                    <span className="landing-step-number">{step.n}</span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>

                  <div className="landing-step-bottom">
                    <span className="landing-step-indicator" />
                    <span>{index === 0 ? 'Get started' : index === 1 ? 'Stay organized' : 'Keep progressing'}</span>
                  </div>
                </article>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Features / agents */}
      <section id="features" className="landing-section landing-agents-section">
        <div className="landing-section-inner">
          <Section>
            <div className="landing-section-heading">
              <span className="landing-section-eyebrow">
                <span /> YOUR AI STUDY TEAM
              </span>

              <h2>
                Six agents.
                <br />
                <span className="landing-gradient-text">Different ways to grow.</span>
              </h2>

              <p>
                Choose the type of help you need, from understanding a
                difficult concept to preparing for what's next.
              </p>
            </div>
          </Section>

          <div className="landing-agents-grid">
            {agents.map((agent, index) => (
              <Section key={agent.name} delay={(index % 3) * 0.07}>
                <article className={`landing-agent-card landing-agent-${agent.color}`}>
                  <div className="landing-agent-top">
                    <span className="landing-agent-icon">
                      <Icon name={agent.icon} size={21} />
                    </span>
                    <span className="landing-agent-number">{agent.number}</span>
                  </div>

                  <div className="landing-agent-tag">{agent.tag}</div>
                  <h3>{agent.name}</h3>
                  <p>{agent.desc}</p>

                  <div className="landing-agent-footer">
                    <span className="landing-agent-dot" />
                    <span>Part of your AI team</span>
                  </div>
                </article>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="landing-section landing-pricing-section">
        <div className="landing-section-inner">
          <Section>
            <div className="landing-section-heading landing-pricing-heading">
              <span className="landing-section-eyebrow">
                <span /> PLANS FOR EVERY STAGE
              </span>

              <h2>
                Start free.
                <br />
                <span className="landing-gradient-text">Grow at your pace.</span>
              </h2>

              <p>
                Explore SyllabusAI at your own pace and choose a plan that
                matches your learning needs.
              </p>
            </div>
          </Section>

          <div className="landing-plans-grid">
            {plans.map((plan, index) => (
              <Section key={plan.name} delay={index * 0.08}>
                <article
                  className={`landing-plan-card ${
                    plan.primary ? 'landing-plan-featured' : ''
                  }`}
                >
                  {plan.primary && (
                    <div className="landing-plan-popular">
                      <Icon name="sparkle" size={13} />
                      MOST POPULAR
                    </div>
                  )}

                  <div className="landing-plan-header">
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </div>

                  <div className="landing-plan-price">
                    <span className="landing-plan-amount">{plan.price}</span>
                    <span className="landing-plan-period">{plan.period}</span>
                  </div>

                  <div className="landing-plan-divider" />

                  <p className="landing-plan-includes">WHAT'S INCLUDED</p>

                  <ul className="landing-plan-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <span className="landing-plan-check">
                          <Icon name="check" size={13} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`landing-plan-cta ${
                      plan.primary ? 'landing-plan-cta-primary' : ''
                    }`}
                  >
                    {plan.cta}
                    <Icon name="arrow" size={15} />
                  </Link>

                  <p className="landing-plan-note">
                    {plan.name === 'Free'
                      ? 'Start exploring at no cost.'
                      : plan.name === 'Pro'
                        ? 'For your everyday learning routine.'
                        : 'For institutions and learning teams.'}
                  </p>
                </article>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="landing-cta-section">
        <div className="landing-section-inner">
          <Section>
            <div className="landing-cta-banner">
              <div className="landing-cta-glow" aria-hidden="true" />

              <div className="landing-cta-content">
                <span className="landing-section-eyebrow">
                  <span /> YOUR NEXT CHAPTER STARTS HERE
                </span>

                <h2>
                  Make your next
                  <br />
                  study session <span className="landing-gradient-text">count.</span>
                </h2>

                <p>
                  Bring your syllabus, your goals, and your curiosity.
                  Start building a better learning routine today.
                </p>

                <Link to="/signup" className="landing-button landing-button-primary landing-cta-button">
                  Start for free
                  <span className="landing-button-arrow">
                    <Icon name="arrow" size={17} />
                  </span>
                </Link>
              </div>

              <div className="landing-cta-art" aria-hidden="true">
                <div className="landing-cta-art-ring landing-cta-art-ring-one" />
                <div className="landing-cta-art-ring landing-cta-art-ring-two" />
                <div className="landing-cta-art-core">
                  <Icon name="graduation" size={44} />
                </div>
                <span className="landing-cta-art-chip landing-cta-chip-one">
                  <Icon name="check" size={14} />
                  Keep learning
                </span>
                <span className="landing-cta-art-chip landing-cta-chip-two">
                  <Icon name="sparkle" size={14} />
                  Find your focus
                </span>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <Link to="/" className="landing-brand landing-footer-brand">
            <span className="landing-brand-icon">
              <Icon name="layers" size={17} />
            </span>
            <span className="landing-brand-name">
              Syllabus<span>AI</span>
            </span>
          </Link>

          <p className="landing-footer-copy">
            Built for students, by engineers.
          </p>

          <div className="landing-footer-links">
            <a href="mailto:contact@syllabusai.com">Contact</a>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Create account</Link>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} SyllabusAI</span>
          <span className="landing-footer-bottom-dot" />
          <span>Small steps. Consistent progress.</span>
        </div>
      </footer>
    </div>
  );
}

const landingCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    color-scheme: dark;
    scroll-behavior: smooth;
    scroll-padding-top: 88px;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    min-width: 320px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    min-width: 320px;
    background: #080B13;
    color: #F1F4FC;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body, button, input, a {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  a {
    -webkit-tap-highlight-color: transparent;
  }

  button {
    font: inherit;
  }

  .landing-page {
    --landing-bg: #080B13;
    --landing-panel: #101522;
    --landing-blue: #9CB4FF;
    --landing-muted: #929DB2;
    --landing-border: rgba(255, 255, 255, .075);
    position: relative;
    isolation: isolate;
    width: 100%;
    min-height: 100vh;
    overflow: clip;
    background: var(--landing-bg);
    color: #F1F4FC;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .landing-page a:focus-visible,
  .landing-page button:focus-visible {
    outline: 2px solid #A8BCFF;
    outline-offset: 4px;
  }

  .landing-page svg {
    display: block;
    flex-shrink: 0;
  }

  .landing-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Ambient background */

  .landing-background {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  .landing-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(157, 177, 225, .035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(157, 177, 225, .035) 1px, transparent 1px);
    background-size: 54px 54px;
    opacity: .56;
    mask-image: linear-gradient(to bottom, black 0%, rgba(0,0,0,.72) 50%, transparent 100%);
  }

  .landing-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
  }

  .landing-glow-top {
    top: -380px;
    left: 20%;
    width: 760px;
    height: 650px;
    background: #3159C5;
    opacity: .18;
  }

  .landing-glow-left {
    top: 1200px;
    left: -430px;
    width: 720px;
    height: 720px;
    background: #5652B9;
    opacity: .07;
  }

  .landing-glow-bottom {
    right: -430px;
    bottom: 300px;
    width: 700px;
    height: 700px;
    background: #315CA0;
    opacity: .08;
  }

  /* Navigation */

  .landing-nav {
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    left: 0;
    border-bottom: 1px solid transparent;
    background: transparent;
    transition: background .25s ease, border-color .25s ease, backdrop-filter .25s ease;
  }

  .landing-nav-scrolled {
    border-bottom-color: rgba(255,255,255,.065);
    background: rgba(8,11,19,.84);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .landing-nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    width: 100%;
    max-width: 1280px;
    min-height: 76px;
    margin: 0 auto;
    padding: 0 48px;
  }

  .landing-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    color: #F3F5FC;
    text-decoration: none;
  }

  .landing-brand-icon {
    display: grid;
    width: 37px;
    height: 37px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(147, 171, 255, .22);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(116, 146, 255, .16), rgba(116, 146, 255, .035));
    color: #ADBEFF;
    box-shadow: inset 0 1px rgba(255,255,255,.035);
  }

  .landing-brand-name {
    color: #F0F3FC;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.75px;
    white-space: nowrap;
  }

  .landing-brand-name span {
    color: #A0B4FF;
  }

  .landing-nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(20px, 3vw, 37px);
    min-width: 0;
    margin-left: auto;
  }

  .landing-nav-link {
    position: relative;
    padding: 10px 0;
    color: #939DB1;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    transition: color .2s ease;
  }

  .landing-nav-link::after {
    position: absolute;
    right: 0;
    bottom: 3px;
    left: 0;
    height: 1px;
    border-radius: 2px;
    background: #A4B8FF;
    content: "";
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .2s ease;
  }

  .landing-nav-link:hover {
    color: #F3F5FC;
  }

  .landing-nav-link:hover::after {
    transform: scaleX(1);
  }

  .landing-desktop-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .landing-signin {
    padding: 10px 8px;
    color: #A8B0C2;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    transition: color .2s ease;
  }

  .landing-signin:hover {
    color: #fff;
  }

  .landing-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 42px;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 650;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease;
  }

  .landing-button-primary {
    border: 1px solid rgba(168, 187, 255, .27);
    background: linear-gradient(135deg, #A2B7FF, #8198F2);
    color: #10172B;
    box-shadow: 0 6px 22px rgba(89, 116, 220, .1);
  }

  .landing-button-primary:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #B8C7FF, #94A9FF);
    box-shadow: 0 11px 28px rgba(89, 116, 220, .2);
  }

  .landing-button-secondary {
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.035);
    color: #E0E5F1;
  }

  .landing-button-secondary:hover {
    border-color: rgba(255,255,255,.19);
    background: rgba(255,255,255,.07);
  }

  .landing-nav-cta {
    min-height: 39px;
    padding: 0 15px;
  }

  .landing-nav-cta svg {
    width: 14px;
    height: 14px;
    transition: transform .2s ease;
  }

  .landing-nav-cta:hover svg {
    transform: translateX(3px);
  }

  .landing-button-outline {
    border: 1px solid rgba(255,255,255,.115);
    background: rgba(255,255,255,.028);
    color: #D1D8E8;
  }

  .landing-button-outline:hover {
    border-color: rgba(255,255,255,.19);
    background: rgba(255,255,255,.06);
    color: #fff;
  }

  .landing-mobile-actions,
  .landing-menu-toggle {
    display: none;
  }

  /* Hero */

  .landing-hero {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(0, .98fr);
    align-items: center;
    gap: clamp(36px, 5vw, 72px);
    width: 100%;
    max-width: 1280px;
    min-height: 790px;
    margin: 0 auto;
    padding: 142px 48px 100px;
  }

  .landing-hero-inner {
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  .landing-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    max-width: 100%;
    margin-bottom: 29px;
    padding: 8px 12px;
    border: 1px solid rgba(153, 176, 255, .17);
    border-radius: 999px;
    background: rgba(119, 146, 255, .06);
    color: #B4C4FF;
    font-size: 10px;
    font-weight: 550;
    line-height: 1.5;
    opacity: 0;
    transform: translateY(12px);
    overflow-wrap: anywhere;
  }

  .landing-badge-sparkle {
    display: grid;
    width: 21px;
    height: 21px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 7px;
    background: rgba(146, 168, 255, .12);
    color: #BAC8FF;
  }

  .landing-entered {
    animation: landingEnter .65s cubic-bezier(.2,.7,.2,1) var(--enter-delay, 0s) both;
  }

  .landing-hero-heading {
    margin: 0;
    color: #F4F6FC;
    font-size: clamp(44px, 5.1vw, 68px);
    font-weight: 800;
    letter-spacing: -.065em;
    line-height: 1.055;
    opacity: 0;
    transform: translateY(18px);
    overflow-wrap: anywhere;
  }

  .landing-gradient-text {
    background: linear-gradient(110deg, #C1CEFF 2%, #91A9FF 47%, #B8A8FF 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }

  .landing-hero-subtitle {
    max-width: 550px;
    margin: 24px 0 0;
    color: #98A2B7;
    font-size: 14px;
    line-height: 1.95;
    opacity: 0;
    transform: translateY(15px);
  }

  .landing-hero-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
    opacity: 0;
    transform: translateY(12px);
  }

  .landing-hero-cta {
    min-height: 49px;
    gap: 21px;
    padding: 0 10px 0 20px;
  }

  .landing-button-arrow {
    display: grid;
    width: 29px;
    height: 29px;
    place-items: center;
    border: 1px solid rgba(16,23,43,.12);
    border-radius: 8px;
    background: rgba(16,23,43,.055);
  }

  .landing-hero-secondary {
    min-height: 49px;
    padding: 0 18px;
  }

  .landing-hero-proof {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 32px;
    opacity: 0;
  }

  .landing-proof-avatars {
    display: flex;
    align-items: center;
    padding-left: 2px;
  }

  .landing-proof-avatars span {
    display: grid;
    width: 27px;
    height: 27px;
    margin-left: -3px;
    place-items: center;
    border: 2px solid #0B0E17;
    border-radius: 50%;
    background: #29334C;
    color: #DCE4FF;
    font-size: 9px;
    font-weight: 700;
  }

  .landing-proof-avatars span:nth-child(2) {
    background: #34304F;
    color: #D6C8FF;
  }

  .landing-proof-avatars span:nth-child(3) {
    background: #202B3C;
    color: #9DAFC7;
  }

  .landing-hero-proof p {
    margin: 0;
    color: #7E899F;
    font-size: 10px;
    line-height: 1.7;
  }

  .landing-hero-proof strong {
    color: #B8C1D3;
    font-weight: 600;
  }

  .landing-hero-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    max-width: 570px;
    margin-top: 36px;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,.075);
    opacity: 0;
  }

  .landing-hero-stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 0 16px;
    border-right: 1px solid rgba(255,255,255,.075);
  }

  .landing-hero-stat:first-child {
    padding-left: 0;
  }

  .landing-hero-stat:last-child {
    padding-right: 0;
    border-right: 0;
  }

  .landing-hero-stat-value {
    color: #EDF1FA;
    font-size: 22px;
    font-weight: 750;
    letter-spacing: -.8px;
  }

  .landing-hero-stat-label {
    color: #768197;
    font-size: 10px;
    line-height: 1.5;
  }

  /* Hero illustration */

  .landing-hero-visual {
    position: relative;
    display: grid;
    width: 100%;
    max-width: 540px;
    aspect-ratio: 1 / 1;
    min-width: 0;
    margin: 0 auto;
    place-items: center;
    isolation: isolate;
    animation: landingVisualEnter 1s .2s ease both;
  }

  .landing-visual-halo {
    position: absolute;
    z-index: -2;
    inset: 17%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(96, 125, 239, .16), rgba(77, 83, 191, .06) 48%, transparent 72%);
    filter: blur(14px);
  }

  .landing-visual-ring {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(153, 177, 255, .12);
    border-radius: 50%;
  }

  .landing-ring-one {
    width: 88%;
    height: 88%;
    border-style: dashed;
    opacity: .72;
    animation: landingOrbit 70s linear infinite;
  }

  .landing-ring-two {
    width: 70%;
    height: 70%;
    border-color: rgba(153, 177, 255, .17);
  }

  .landing-ring-three {
    width: 49%;
    height: 49%;
    border-color: rgba(153, 177, 255, .18);
  }

  .landing-visual-center {
    display: grid;
    width: 29%;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid rgba(164, 183, 255, .25);
    border-radius: 30%;
    background: linear-gradient(145deg, rgba(132, 156, 255, .19), rgba(102, 117, 210, .04));
    box-shadow: 0 0 80px rgba(101, 119, 223, .14), inset 0 1px rgba(255,255,255,.1);
    transform: rotate(-7deg);
  }

  .landing-visual-center-inner {
    display: grid;
    width: 74%;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid rgba(172, 188, 255, .12);
    border-radius: 25%;
    background: linear-gradient(145deg, #1B2340, #111629);
    color: #B8C7FF;
  }

  .landing-visual-center-inner svg {
    width: 48%;
    height: 48%;
  }

  .landing-visual-node {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 11px 13px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 13px;
    background: rgba(16, 21, 34, .93);
    box-shadow: 0 16px 42px rgba(0,0,0,.2), inset 0 1px rgba(255,255,255,.025);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .landing-node-one {
    top: 14%;
    left: 3%;
  }

  .landing-node-two {
    top: 23%;
    right: 0;
  }

  .landing-node-three {
    bottom: 19%;
    left: 0;
  }

  .landing-node-four {
    right: 2%;
    bottom: 13%;
  }

  .landing-node-icon {
    display: grid;
    width: 33px;
    height: 33px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 10px;
    background: rgba(255,255,255,.035);
  }

  .landing-node-blue { color: #9DB7FF; }
  .landing-node-violet { color: #C5ACFF; }
  .landing-node-green { color: #81DDC5; }
  .landing-node-amber { color: #F2C78C; }

  .landing-node-copy {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  .landing-node-copy strong {
    color: #E7EBF6;
    font-size: 10px;
    font-weight: 650;
    white-space: nowrap;
  }

  .landing-node-copy small {
    color: #7F8AA2;
    font-size: 9px;
    white-space: nowrap;
  }

  .landing-visual-star {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #B1C2FF;
    box-shadow: 0 0 15px rgba(145,169,255,.55);
  }

  .landing-star-one {
    top: 12%;
    right: 23%;
  }

  .landing-star-two {
    top: 52%;
    left: 4%;
    width: 4px;
    height: 4px;
  }

  .landing-star-three {
    right: 17%;
    bottom: 8%;
    width: 4px;
    height: 4px;
  }

  .landing-hero-orbit {
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    pointer-events: none;
  }

  .landing-hero-orbit-one {
    top: 80px;
    left: -430px;
    width: 600px;
    height: 600px;
    border: 1px solid rgba(136, 159, 255, .045);
  }

  .landing-hero-orbit-two {
    right: -490px;
    bottom: -100px;
    width: 720px;
    height: 720px;
    border: 1px solid rgba(136, 159, 255, .035);
  }

  .landing-scroll-hint {
    position: absolute;
    bottom: 25px;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #626E85;
    font-size: 9px;
    letter-spacing: .35px;
    text-decoration: none;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  .landing-scroll-line {
    width: 23px;
    height: 1px;
    background: #8298D8;
    opacity: .8;
  }

  /* Section foundation */

  .landing-section {
    position: relative;
    z-index: 1;
    padding: 108px 48px;
  }

  .landing-section-inner {
    width: 100%;
    max-width: 1184px;
    margin: 0 auto;
  }

  .landing-section-heading {
    max-width: 720px;
    margin-bottom: 48px;
  }

  .landing-section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    color: #98A9D7;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.7px;
    line-height: 1.6;
  }

  .landing-section-eyebrow > span {
    display: inline-block;
    width: 19px;
    height: 1px;
    flex-shrink: 0;
    background: #94ACFF;
  }

  .landing-section-heading h2 {
    margin: 0;
    color: #F1F4FC;
    font-size: clamp(33px, 4vw, 48px);
    font-weight: 750;
    letter-spacing: -2px;
    line-height: 1.14;
    overflow-wrap: anywhere;
  }

  .landing-section-heading > p {
    max-width: 540px;
    margin: 17px 0 0;
    color: #8D98AD;
    font-size: 13px;
    line-height: 1.9;
  }

  .landing-reveal {
    opacity: 0;
    transform: translateY(23px);
    transition:
      opacity .6s ease var(--reveal-delay, 0s),
      transform .6s cubic-bezier(.2,.7,.2,1) var(--reveal-delay, 0s);
  }

  .landing-reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Process cards */

  .landing-process-section {
    border-top: 1px solid rgba(255,255,255,.045);
  }

  .landing-steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
  }

  .landing-step-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 250px;
    padding: 24px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(20,25,39,.86), rgba(13,17,27,.88));
    transition: border-color .25s ease, background .25s ease, transform .25s ease;
  }

  .landing-step-card::after {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 145px;
    height: 145px;
    border: 1px solid rgba(151,174,255,.065);
    border-radius: 50%;
    content: "";
    pointer-events: none;
  }

  .landing-step-card:hover {
    transform: translateY(-4px);
    border-color: rgba(153,175,255,.2);
    background: linear-gradient(145deg, rgba(24,30,47,.95), rgba(15,19,31,.96));
  }

  .landing-step-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 27px;
  }

  .landing-step-icon {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 12px;
    background: rgba(255,255,255,.035);
  }

  .landing-accent-blue { color: #A6BDFF; }
  .landing-accent-violet { color: #C0A4FF; }
  .landing-accent-green { color: #7ADCC0; }

  .landing-step-number {
    color: #4D5870;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .8px;
  }

  .landing-step-card h3 {
    position: relative;
    z-index: 1;
    margin: 0 0 10px;
    color: #E7EBF6;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -.3px;
    line-height: 1.5;
  }

  .landing-step-card > p {
    position: relative;
    z-index: 1;
    margin: 0;
    color: #8994A9;
    font-size: 11px;
    line-height: 1.85;
  }

  .landing-step-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 24px;
    color: #78859A;
    font-size: 9px;
    font-weight: 550;
  }

  .landing-step-indicator {
    width: 5px;
    height: 5px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #91A9FF;
  }

  /* AI agents */

  .landing-agents-section {
    border-top: 1px solid rgba(255,255,255,.045);
    background: linear-gradient(180deg, rgba(255,255,255,.008), transparent 80%);
  }

  .landing-agents-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .landing-agent-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 250px;
    padding: 22px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 17px;
    background: rgba(15,19,30,.82);
    transition: transform .25s ease, border-color .25s ease, background .25s ease;
  }

  .landing-agent-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,.15);
    background: rgba(20,25,39,.94);
  }

  .landing-agent-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .landing-agent-icon {
    display: grid;
    width: 43px;
    height: 43px;
    place-items: center;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 13px;
    background: rgba(255,255,255,.035);
  }

  .landing-agent-number {
    color: #4C566D;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .7px;
  }

  .landing-agent-tag {
    align-self: flex-start;
    margin-top: 19px;
    padding: 5px 8px;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 6px;
    background: rgba(255,255,255,.025);
    color: #8792A9;
    font-size: 9px;
    font-weight: 550;
  }

  .landing-agent-card h3 {
    margin: 13px 0 8px;
    color: #E9EDF7;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -.35px;
  }

  .landing-agent-card > p {
    margin: 0;
    color: #8994A9;
    font-size: 11px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .landing-agent-footer {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: auto;
    padding-top: 22px;
    color: #69758A;
    font-size: 9px;
  }

  .landing-agent-dot {
    width: 5px;
    height: 5px;
    flex-shrink: 0;
    border-radius: 50%;
    background: currentColor;
  }

  .landing-agent-blue .landing-agent-icon,
  .landing-agent-blue .landing-agent-dot {
    color: #9CB7FF;
  }

  .landing-agent-violet .landing-agent-icon,
  .landing-agent-violet .landing-agent-dot {
    color: #C1A8FF;
  }

  .landing-agent-green .landing-agent-icon,
  .landing-agent-green .landing-agent-dot {
    color: #7ADDC1;
  }

  .landing-agent-amber .landing-agent-icon,
  .landing-agent-amber .landing-agent-dot {
    color: #F1C17D;
  }

  .landing-agent-cyan .landing-agent-icon,
  .landing-agent-cyan .landing-agent-dot {
    color: #78D6E9;
  }

  .landing-agent-orange .landing-agent-icon,
  .landing-agent-orange .landing-agent-dot {
    color: #E7A17E;
  }

  /* Pricing */

  .landing-pricing-section {
    border-top: 1px solid rgba(255,255,255,.045);
  }

  .landing-pricing-heading {
    max-width: 700px;
  }

  .landing-plans-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 16px;
  }

  .landing-plan-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 25px 23px 20px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 18px;
    background: linear-gradient(150deg, rgba(19,24,37,.9), rgba(13,17,27,.96));
    transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
  }

  .landing-plan-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,.16);
  }

  .landing-plan-featured {
    border-color: rgba(146,169,255,.34);
    background:
      radial-gradient(ellipse at 100% 0%, rgba(101,125,244,.12), transparent 52%),
      linear-gradient(150deg, rgba(25,32,51,.98), rgba(13,17,28,.98));
    box-shadow: 0 18px 60px rgba(0,0,0,.16);
  }

  .landing-plan-featured:hover {
    border-color: rgba(158,179,255,.53);
    box-shadow: 0 23px 70px rgba(0,0,0,.21);
  }

  .landing-plan-popular {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 7px;
    margin-bottom: 18px;
    padding: 6px 9px;
    border: 1px solid rgba(152,174,255,.2);
    border-radius: 7px;
    background: rgba(145,169,255,.09);
    color: #B7C5FF;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .6px;
  }

  .landing-plan-header h3 {
    margin: 0;
    color: #E7EBF6;
    font-size: 16px;
    font-weight: 700;
  }

  .landing-plan-header p {
    min-height: 36px;
    margin: 8px 0 0;
    color: #8792A8;
    font-size: 11px;
    line-height: 1.7;
  }

  .landing-plan-price {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 23px;
  }

  .landing-plan-amount {
    color: #F4F6FC;
    font-size: clamp(30px, 3vw, 39px);
    font-weight: 800;
    letter-spacing: -1.7px;
    overflow-wrap: anywhere;
  }

  .landing-plan-period {
    color: #828EA4;
    font-size: 11px;
  }

  .landing-plan-divider {
    height: 1px;
    margin: 22px 0 18px;
    background: rgba(255,255,255,.075);
  }

  .landing-plan-includes {
    margin: 0 0 16px;
    color: #748097;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.2px;
  }

  .landing-plan-features {
    display: flex;
    flex-direction: column;
    gap: 13px;
    flex: 1;
    margin: 0 0 26px;
    padding: 0;
    list-style: none;
  }

  .landing-plan-features li {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    color: #B2BDCE;
    font-size: 11px;
    line-height: 1.65;
  }

  .landing-plan-check {
    display: grid;
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    margin-top: 1px;
    place-items: center;
    border: 1px solid rgba(112,218,185,.15);
    border-radius: 5px;
    background: rgba(87,214,181,.07);
    color: #78D9BC;
  }

  .landing-plan-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 44px;
    margin-top: auto;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,.11);
    border-radius: 10px;
    background: rgba(255,255,255,.035);
    color: #DAE0EE;
    font-size: 11px;
    font-weight: 650;
    text-align: center;
    text-decoration: none;
    transition: background .2s ease, border-color .2s ease, transform .2s ease;
  }

  .landing-plan-cta svg {
    transition: transform .2s ease;
  }

  .landing-plan-cta:hover {
    transform: translateY(-1px);
    border-color: rgba(255,255,255,.18);
    background: rgba(255,255,255,.075);
  }

  .landing-plan-cta:hover svg {
    transform: translateX(3px);
  }

  .landing-plan-cta-primary {
    border-color: rgba(169,187,255,.28);
    background: linear-gradient(135deg, #A3B7FF, #849AF2);
    color: #11172A;
  }

  .landing-plan-cta-primary:hover {
    border-color: transparent;
    background: linear-gradient(135deg, #B8C7FF, #96A9FF);
  }

  .landing-plan-note {
    margin: 13px 0 0;
    color: #646F84;
    font-size: 9px;
    line-height: 1.6;
    text-align: center;
  }

  /* Final CTA */

  .landing-cta-section {
    position: relative;
    z-index: 1;
    padding: 42px 48px 105px;
  }

  .landing-cta-banner {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
    align-items: center;
    gap: 26px;
    min-height: 355px;
    padding: clamp(30px, 5vw, 58px);
    overflow: hidden;
    border: 1px solid rgba(146,169,255,.16);
    border-radius: 24px;
    background:
      radial-gradient(ellipse at 95% 50%, rgba(98,119,225,.13), transparent 48%),
      linear-gradient(140deg, rgba(19,25,41,.98), rgba(12,16,27,.98));
  }

  .landing-cta-glow {
    position: absolute;
    top: -200px;
    right: -70px;
    width: 460px;
    height: 460px;
    border-radius: 50%;
    background: #4E66CF;
    filter: blur(120px);
    opacity: .1;
    pointer-events: none;
  }

  .landing-cta-content {
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  .landing-cta-content h2 {
    margin: 0;
    color: #F2F5FC;
    font-size: clamp(32px, 4vw, 46px);
    font-weight: 800;
    letter-spacing: -1.8px;
    line-height: 1.16;
    overflow-wrap: anywhere;
  }

  .landing-cta-content > p {
    max-width: 470px;
    margin: 16px 0 25px;
    color: #939EB3;
    font-size: 12px;
    line-height: 1.85;
  }

  .landing-cta-button {
    min-height: 47px;
    gap: 18px;
    padding: 0 10px 0 18px;
  }

  .landing-cta-art {
    position: relative;
    display: grid;
    min-width: 0;
    min-height: 260px;
    place-items: center;
    isolation: isolate;
  }

  .landing-cta-art-ring {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(157,178,255,.14);
    border-radius: 50%;
  }

  .landing-cta-art-ring-one {
    width: 215px;
    height: 215px;
    border-style: dashed;
  }

  .landing-cta-art-ring-two {
    width: 155px;
    height: 155px;
  }

  .landing-cta-art-core {
    display: grid;
    width: 92px;
    height: 92px;
    place-items: center;
    border: 1px solid rgba(166,185,255,.23);
    border-radius: 27px;
    background: linear-gradient(145deg, rgba(147,170,255,.2), rgba(147,170,255,.035));
    color: #BAC8FF;
    box-shadow: 0 15px 55px rgba(80,98,196,.13), inset 0 1px rgba(255,255,255,.07);
    transform: rotate(-7deg);
  }

  .landing-cta-art-chip {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 11px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 9px;
    background: rgba(18,24,39,.94);
    color: #C6D0E3;
    font-size: 9px;
    white-space: nowrap;
  }

  .landing-cta-chip-one {
    top: 25px;
    right: 0;
  }

  .landing-cta-chip-one svg {
    color: #7BDAC0;
  }

  .landing-cta-chip-two {
    bottom: 28px;
    left: 0;
  }

  .landing-cta-chip-two svg {
    color: #A9BCFF;
  }

  /* Footer */

  .landing-footer {
    position: relative;
    z-index: 1;
    padding: 29px 48px 20px;
    border-top: 1px solid rgba(255,255,255,.065);
    background: rgba(6,8,14,.48);
  }

  .landing-footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    width: 100%;
    max-width: 1184px;
    margin: 0 auto;
  }

  .landing-footer-brand .landing-brand-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .landing-footer-brand .landing-brand-name {
    font-size: 14px;
  }

  .landing-footer-copy {
    margin: 0;
    color: #707B90;
    font-size: 10px;
    line-height: 1.7;
  }

  .landing-footer-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .landing-footer-links a {
    color: #818CA0;
    font-size: 10px;
    text-decoration: none;
    transition: color .2s ease;
  }

  .landing-footer-links a:hover {
    color: #D8DFF0;
  }

  .landing-footer-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-top: 23px;
    padding-top: 17px;
    border-top: 1px solid rgba(255,255,255,.045);
    color: #59657A;
    font-size: 9px;
    line-height: 1.7;
    text-align: center;
  }

  .landing-footer-bottom-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #65718A;
  }

  /* Animations */

  @keyframes landingEnter {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes landingVisualEnter {
    from {
      opacity: 0;
      transform: translateY(12px) scale(.975);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes landingOrbit {
    to {
      transform: rotate(360deg);
    }
  }

  /* Medium desktop */

  @media (max-width: 1100px) {
    .landing-nav-inner {
      padding-right: 30px;
      padding-left: 30px;
    }

    .landing-hero {
      gap: 28px;
      padding-right: 30px;
      padding-left: 30px;
    }

    .landing-hero-heading {
      font-size: clamp(43px, 5.3vw, 60px);
    }

    .landing-visual-node {
      gap: 8px;
      padding: 9px 10px;
    }

    .landing-node-icon {
      width: 30px;
      height: 30px;
    }

    .landing-node-copy strong {
      font-size: 9px;
    }

    .landing-node-copy small {
      font-size: 8px;
    }

    .landing-section {
      padding-right: 30px;
      padding-left: 30px;
    }

    .landing-cta-section {
      padding-right: 30px;
      padding-left: 30px;
    }

    .landing-footer {
      padding-right: 30px;
      padding-left: 30px;
    }
  }

  /* Tablets */

  @media (max-width: 850px) {
    .landing-nav-inner {
      gap: 18px;
      padding-right: 24px;
      padding-left: 24px;
    }

    .landing-nav-links {
      gap: 18px;
    }

    .landing-hero {
      grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
      gap: 22px;
      min-height: 700px;
      padding: 125px 24px 75px;
    }

    .landing-hero-heading {
      font-size: clamp(39px, 5.3vw, 52px);
      letter-spacing: -.055em;
    }

    .landing-hero-subtitle {
      font-size: 12px;
    }

    .landing-hero-badge {
      font-size: 9px;
    }

    .landing-hero-visual {
      max-width: 390px;
    }

    .landing-visual-node {
      gap: 7px;
      padding: 8px;
    }

    .landing-node-icon {
      width: 27px;
      height: 27px;
    }

    .landing-node-copy small {
      white-space: normal;
    }

    .landing-hero-stat {
      padding-right: 10px;
      padding-left: 10px;
    }

    .landing-hero-stat-value {
      font-size: 20px;
    }

    .landing-section {
      padding-top: 84px;
      padding-bottom: 84px;
    }

    .landing-steps-grid,
    .landing-agents-grid,
    .landing-plans-grid {
      gap: 12px;
    }

    .landing-step-card,
    .landing-agent-card {
      padding: 19px;
    }

    .landing-plan-card {
      padding: 22px 17px 18px;
    }

    .landing-cta-banner {
      padding: 38px 30px;
    }

    .landing-cta-content h2 {
      font-size: 34px;
    }

    .landing-footer-inner {
      flex-wrap: wrap;
    }
  }

  /* Mobile navigation and layout */

  @media (max-width: 700px) {
    .landing-nav-inner {
      min-height: 66px;
      padding: 0 20px;
      gap: 12px;
    }

    .landing-brand {
      gap: 9px;
    }

    .landing-brand-icon {
      width: 34px;
      height: 34px;
    }

    .landing-brand-name {
      font-size: 16px;
    }

    .landing-desktop-actions {
      display: none;
    }

    .landing-menu-toggle {
      display: grid;
      width: 41px;
      height: 41px;
      flex: 0 0 41px;
      place-items: center;
      padding: 0;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 11px;
      background: rgba(255,255,255,.04);
      color: #E6ECF9;
      cursor: pointer;
    }

    .landing-menu-toggle:hover {
      background: rgba(255,255,255,.08);
    }

    .landing-nav-links {
      display: none;
    }

    .landing-nav-links-open {
      position: absolute;
      top: calc(100% + 1px);
      right: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 3px;
      padding: 16px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background: rgba(8,11,19,.98);
      box-shadow: 0 22px 45px rgba(0,0,0,.28);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
    }

    .landing-nav-links-open .landing-nav-link {
      padding: 12px 9px;
      font-size: 13px;
    }

    .landing-nav-links-open .landing-nav-link::after {
      display: none;
    }

    .landing-mobile-actions {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-top: 10px;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,.075);
    }

    .landing-mobile-actions .landing-button {
      width: 100%;
      min-height: 44px;
    }

    .landing-hero {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
      min-height: auto;
      padding: 112px 22px 65px;
    }

    .landing-hero-inner {
      text-align: center;
    }

    .landing-hero-badge {
      justify-content: center;
      margin-bottom: 25px;
      padding: 7px 10px;
      font-size: 9px;
      text-align: left;
    }

    .landing-hero-heading {
      font-size: clamp(39px, 9vw, 53px);
      letter-spacing: -.06em;
      line-height: 1.08;
    }

    .landing-hero-subtitle {
      max-width: 470px;
      margin: 20px auto 0;
      font-size: 13px;
      line-height: 1.85;
    }

    .landing-hero-actions {
      justify-content: center;
      gap: 10px;
      margin-top: 25px;
    }

    .landing-hero-cta {
      min-height: 47px;
    }

    .landing-hero-secondary {
      min-height: 47px;
    }

    .landing-hero-proof {
      justify-content: center;
      margin-top: 25px;
    }

    .landing-hero-stats {
      max-width: 470px;
      margin: 28px auto 0;
      padding-top: 20px;
    }

    .landing-hero-stat-value {
      font-size: 21px;
    }

    .landing-hero-stat-label {
      font-size: 9px;
    }

    .landing-hero-visual {
      width: min(100%, 430px);
      margin: 2px auto 0;
    }

    .landing-scroll-hint {
      display: none;
    }

    .landing-section {
      padding: 72px 22px;
    }

    .landing-section-heading {
      margin-bottom: 30px;
    }

    .landing-section-eyebrow {
      margin-bottom: 14px;
      font-size: 8px;
      letter-spacing: 1.4px;
    }

    .landing-section-heading h2 {
      font-size: clamp(31px, 7.5vw, 40px);
      letter-spacing: -1.5px;
    }

    .landing-section-heading > p {
      margin-top: 14px;
      font-size: 12px;
      line-height: 1.85;
    }

    .landing-steps-grid,
    .landing-agents-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 11px;
    }

    .landing-step-card {
      min-height: 245px;
      padding: 17px;
      border-radius: 15px;
    }

    .landing-step-top {
      margin-bottom: 20px;
    }

    .landing-step-icon {
      width: 37px;
      height: 37px;
      border-radius: 11px;
    }

    .landing-step-card h3 {
      font-size: 13px;
    }

    .landing-step-card > p {
      font-size: 10px;
      line-height: 1.8;
    }

    .landing-step-bottom {
      gap: 6px;
      padding-top: 18px;
      font-size: 8px;
    }

    .landing-agent-card {
      min-height: 251px;
      padding: 17px;
      border-radius: 15px;
    }

    .landing-agent-icon {
      width: 37px;
      height: 37px;
      border-radius: 11px;
    }

    .landing-agent-tag {
      margin-top: 16px;
      font-size: 8px;
    }

    .landing-agent-card h3 {
      font-size: 14px;
    }

    .landing-agent-card > p {
      font-size: 10px;
      line-height: 1.8;
    }

    .landing-agent-footer {
      padding-top: 18px;
      font-size: 8px;
    }

    .landing-plans-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
    }

    .landing-plan-card {
      padding: 23px;
      border-radius: 16px;
    }

    .landing-plan-header p {
      min-height: auto;
    }

    .landing-plan-price {
      margin-top: 20px;
    }

    .landing-plan-amount {
      font-size: 35px;
    }

    .landing-plan-features {
      gap: 12px;
      margin-bottom: 22px;
    }

    .landing-plan-features li {
      font-size: 11px;
    }

    .landing-plan-cta {
      min-height: 45px;
    }

    .landing-cta-section {
      padding: 15px 22px 72px;
    }

    .landing-cta-banner {
      grid-template-columns: minmax(0, 1fr);
      gap: 4px;
      min-height: auto;
      padding: 29px 23px 19px;
      border-radius: 19px;
    }

    .landing-cta-content h2 {
      font-size: clamp(31px, 7.5vw, 39px);
      letter-spacing: -1.4px;
    }

    .landing-cta-content > p {
      font-size: 11px;
    }

    .landing-cta-button {
      min-height: 46px;
    }

    .landing-cta-art {
      width: 100%;
      min-height: 235px;
      margin: 0 auto;
    }

    .landing-cta-art-ring-one {
      width: 185px;
      height: 185px;
    }

    .landing-cta-art-ring-two {
      width: 135px;
      height: 135px;
    }

    .landing-cta-art-core {
      width: 79px;
      border-radius: 23px;
    }

    .landing-cta-chip-one {
      top: 15px;
      right: 0;
    }

    .landing-cta-chip-two {
      bottom: 15px;
      left: 0;
    }

    .landing-footer {
      padding: 26px 22px 18px;
    }

    .landing-footer-inner {
      align-items: flex-start;
      flex-direction: column;
      gap: 15px;
    }

    .landing-footer-copy {
      font-size: 10px;
    }

    .landing-footer-links {
      gap: 17px;
    }

    .landing-footer-links a {
      font-size: 10px;
    }

    .landing-footer-bottom {
      justify-content: flex-start;
      flex-wrap: wrap;
      font-size: 8px;
      text-align: left;
    }
  }

  /* Narrow phones */

  @media (max-width: 420px) {
    .landing-nav-inner {
      padding-right: 14px;
      padding-left: 14px;
    }

    .landing-brand {
      gap: 8px;
    }

    .landing-brand-icon {
      width: 32px;
      height: 32px;
    }

    .landing-brand-name {
      font-size: 15px;
    }

    .landing-menu-toggle {
      width: 38px;
      height: 38px;
      flex-basis: 38px;
    }

    .landing-nav-links-open {
      padding-right: 14px;
      padding-left: 14px;
    }

    .landing-hero {
      padding-right: 16px;
      padding-left: 16px;
    }

    .landing-hero-badge {
      gap: 7px;
      font-size: 8px;
      letter-spacing: -.1px;
    }

    .landing-badge-sparkle {
      width: 19px;
      height: 19px;
    }

    .landing-hero-heading {
      font-size: clamp(35px, 9.3vw, 42px);
    }

    .landing-hero-subtitle {
      font-size: 12px;
    }

    .landing-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .landing-hero-actions .landing-button {
      width: 100%;
    }

    .landing-hero-cta {
      justify-content: space-between;
    }

    .landing-hero-stats {
      margin-top: 25px;
    }

    .landing-hero-stat {
      padding-right: 7px;
      padding-left: 7px;
    }

    .landing-hero-stat-value {
      font-size: 19px;
    }

    .landing-hero-stat-label {
      font-size: 8px;
    }

    .landing-hero-visual {
      width: 100%;
      margin-top: 8px;
    }

    .landing-visual-node {
      gap: 6px;
      padding: 7px;
      border-radius: 10px;
    }

    .landing-node-icon {
      width: 25px;
      height: 25px;
      border-radius: 8px;
    }

    .landing-node-icon svg {
      width: 14px;
      height: 14px;
    }

    .landing-node-copy strong {
      font-size: 8px;
    }

    .landing-node-copy small {
      font-size: 7px;
    }

    .landing-section {
      padding-right: 16px;
      padding-left: 16px;
    }

    .landing-section-heading h2 {
      font-size: 30px;
      letter-spacing: -1.3px;
    }

    .landing-steps-grid,
    .landing-agents-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 11px;
    }

    .landing-step-card {
      min-height: 0;
      padding: 20px;
    }

    .landing-step-top {
      margin-bottom: 17px;
    }

    .landing-step-card h3 {
      font-size: 14px;
    }

    .landing-step-card > p {
      font-size: 11px;
    }

    .landing-step-bottom {
      padding-top: 18px;
      font-size: 9px;
    }

    .landing-agent-card {
      min-height: 0;
      padding: 20px;
    }

    .landing-agent-card > p {
      font-size: 11px;
    }

    .landing-agent-footer {
      padding-top: 20px;
      font-size: 9px;
    }

    .landing-cta-section {
      padding-right: 16px;
      padding-left: 16px;
    }

    .landing-cta-banner {
      padding-right: 18px;
      padding-left: 18px;
    }

    .landing-cta-content h2 {
      font-size: 30px;
    }

    .landing-cta-content > p {
      font-size: 11px;
    }

    .landing-cta-art-chip {
      gap: 5px;
      padding: 8px 9px;
      font-size: 8px;
    }

    .landing-footer {
      padding-right: 16px;
      padding-left: 16px;
    }
  }

  @media (max-width: 340px) {
    .landing-hero-heading {
      font-size: 33px;
    }

    .landing-hero-stat-value {
      font-size: 17px;
    }

    .landing-node-icon {
      display: none;
    }

    .landing-node-copy strong {
      font-size: 8px;
    }

    .landing-node-copy small {
      font-size: 7px;
    }

    .landing-visual-node {
      padding: 7px 8px;
    }
  }

  @keyframes landingPageSpin {
    to { transform: rotate(360deg); }
  }

  @media (hover: none) {
    .landing-step-card:hover,
    .landing-agent-card:hover,
    .landing-plan-card:hover,
    .landing-button-primary:hover,
    .landing-plan-cta:hover {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto !important;
    }

    .landing-page *,
    .landing-page *::before,
    .landing-page *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }

    .landing-reveal {
      opacity: 1;
      transform: none;
    }
  }
`;