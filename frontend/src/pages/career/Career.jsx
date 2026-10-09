import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const PROMPTS = [
  {
    category: 'Career planning',
    title: 'Explore career options',
    text: 'What careers match my IT engineering degree?',
    number: '01',
    symbol: '◎',
  },
  {
    category: 'Placements',
    title: 'Prepare for placements',
    text: 'How do I prepare for campus placements?',
    number: '02',
    symbol: '↗',
  },
  {
    category: 'Skill development',
    title: 'Build valuable skills',
    text: 'What skills should I build for software development?',
    number: '03',
    symbol: '⌘',
  },
  {
    category: 'Interview preparation',
    title: 'Ace technical interviews',
    text: 'How do I crack a technical interview at a product company?',
    number: '04',
    symbol: '✳',
  },
  {
    category: 'Industry insights',
    title: 'Understand the industry',
    text: 'What is the difference between service and product companies?',
    number: '05',
    symbol: '↔',
  },
  {
    category: 'Personal branding',
    title: 'Build your portfolio',
    text: 'How do I build a strong developer portfolio?',
    number: '06',
    symbol: '◈',
  },
];

const Icon = ({ name, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        <path d="m19 3 .8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3Z" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8M8 11h6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4.9 9a7.5 7.5 0 0 1 12.4-3L20 12" />
        <path d="M4 17v-5h5" />
        <path d="M19.1 15a7.5 7.5 0 0 1-12.4 3L4 12" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7" />
        <path d="m21 3-9 9" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.sparkle}</svg>;
};

export default function Career() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [askedQuestion, setAskedQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (suggestedQuestion) => {
    const query =
      typeof suggestedQuestion === 'string'
        ? suggestedQuestion
        : question;

    if (!query.trim()) {
      toast.error('Enter a question to continue.');
      return;
    }

    if (loading) return;

    setQuestion(query);
    setAskedQuestion(query);
    setResponse('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(query, 'mentor');
      setResponse(res.data.message || 'No response was returned. Please try again.');
    } catch (error) {
      console.error('Career mentor error:', error);
      toast.error(
        error.response?.data?.message ||
          'Unable to get career guidance. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    ask();
  };

  const resetQuestion = () => {
    setResponse('');
    setQuestion('');
    setAskedQuestion('');
  };

  return (
    <div className="career-page">
      <style>{careerCSS}</style>

      <div className="career-background" aria-hidden="true">
        <div className="career-grid" />
        <div className="career-glow career-glow-one" />
        <div className="career-glow career-glow-two" />
      </div>

      <header className="career-navbar">
        <Link to="/dashboard" className="career-brand">
          <span className="career-brand-icon">
            <Icon name="book" size={19} />
          </span>
          <span className="career-brand-name">
            Syllabus<span>AI</span>
          </span>
        </Link>

        <nav className="career-nav-links" aria-label="Main navigation">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/chat', label: 'Chat' },
            { to: '/learn', label: 'Learn' },
            { to: '/exam', label: 'Exam' },
            { to: '/career', label: 'Career' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `career-nav-link ${isActive ? 'career-nav-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/chat" className="career-nav-action">
          <Icon name="message" size={15} />
          <span>AI Chat</span>
        </Link>
      </header>

      <main className="career-main">
        <section className="career-hero">
          <div className="career-hero-copy">
            <div className="career-eyebrow">
              <span className="career-eyebrow-line" />
              YOUR PERSONAL CAREER MENTOR
            </div>

            <h1>
              Your next chapter
              <br />
              starts <span>with a question.</span>
            </h1>

            <p className="career-hero-description">
              Make informed career decisions with personalized guidance on
              skills, placements, interviews and your professional journey.
            </p>

            <div className="career-hero-meta">
              <span className="mentor-status">
                <span />
                AI mentor available
              </span>
              <span className="meta-divider" />
              <span className="career-meta-text">Career · Skills · Placements</span>
            </div>
          </div>

          <div className="career-hero-visual" aria-hidden="true">
            <div className="career-orbit career-orbit-one" />
            <div className="career-orbit career-orbit-two" />
            <div className="career-orbit career-orbit-three" />

            <div className="career-compass">
              <div className="compass-inner">
                <Icon name="compass" size={54} />
              </div>
              <span className="compass-point compass-point-top" />
              <span className="compass-point compass-point-right" />
              <span className="compass-point compass-point-bottom" />
              <span className="compass-point compass-point-left" />
            </div>

            <div className="career-floating-card career-floating-card-top">
              <span className="floating-card-icon">
                <Icon name="check" size={15} />
              </span>
              <span>
                <strong>Find your direction</strong>
                <small>One step at a time</small>
              </span>
            </div>

            <div className="career-floating-card career-floating-card-bottom">
              <span className="floating-sparkle">
                <Icon name="sparkle" size={17} />
              </span>
              <span>
                <strong>Your next opportunity</strong>
                <small>Starts with preparation</small>
              </span>
            </div>
          </div>
        </section>

        <section className="career-ask-section">
          <div className="career-section-heading">
            <div>
              <span className="career-section-kicker">ASK YOUR MENTOR</span>
              <h2>What would you like to figure out?</h2>
            </div>
            <span className="career-step-number">01 / ASK</span>
          </div>

          <form className="career-input-card" onSubmit={handleSubmit}>
            <div className="career-input-label">
              <span className="career-input-dot" />
              YOUR QUESTION
            </div>

            <div className="career-input-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about careers, placements, technical skills..."
                className="career-question-input"
                aria-label="Ask a career question"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="career-ask-button"
              >
                {loading ? (
                  <>
                    <span className="career-spinner" />
                    <span className="ask-button-loading-label">Thinking</span>
                  </>
                ) : (
                  <>
                    <span>Ask mentor</span>
                    <Icon name="arrow" size={16} />
                  </>
                )}
              </button>
            </div>

            <div className="career-input-footer">
              <span>
                <kbd>Enter</kbd> to ask your question
              </span>
              <span className="career-input-footer-note">
                <Icon name="sparkle" size={13} />
                Personalized AI guidance
              </span>
            </div>
          </form>
        </section>

        {!response && !loading && (
          <section className="career-prompts-section">
            <div className="career-section-heading prompts-heading">
              <div>
                <span className="career-section-kicker">NEED AN IDEA?</span>
                <h2>Start with these questions</h2>
              </div>
              <span className="career-step-number">02 / EXPLORE</span>
            </div>

            <div className="career-prompts-grid">
              {PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt.number}
                  className="career-prompt-card"
                  onClick={() => ask(prompt.text)}
                  disabled={loading}
                >
                  <span className="prompt-topline">
                    <span className="prompt-symbol">{prompt.symbol}</span>
                    <span className="prompt-number">{prompt.number}</span>
                  </span>

                  <span className="prompt-category">{prompt.category}</span>
                  <span className="prompt-title">{prompt.title}</span>
                  <span className="prompt-description">{prompt.text}</span>

                  <span className="prompt-action">
                    Ask this question
                    <Icon name="arrow" size={15} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <section className="career-loading-card" aria-live="polite">
            <div className="mentor-thinking-visual">
              <span className="thinking-ring thinking-ring-one" />
              <span className="thinking-ring thinking-ring-two" />
              <span className="thinking-center">
                <Icon name="sparkle" size={25} />
              </span>
            </div>

            <span className="career-section-kicker">YOUR MENTOR IS THINKING</span>
            <h2>Putting your answer together.</h2>
            <p>
              Considering your question and preparing a helpful response.
            </p>

            <div className="thinking-dots">
              <span />
              <span />
              <span />
            </div>
          </section>
        )}

        {response && !loading && (
          <section className="career-response-section">
            <div className="career-section-heading response-heading">
              <div>
                <span className="career-section-kicker">YOUR GUIDANCE</span>
                <h2>Here is a place to start.</h2>
              </div>

              <button
                type="button"
                className="career-ask-another"
                onClick={resetQuestion}
              >
                <Icon name="refresh" size={15} />
                Ask another
              </button>
            </div>

            <article className="career-response-card">
              <div className="career-response-header">
                <div className="mentor-profile">
                  <span className="mentor-profile-icon">
                    <Icon name="compass" size={21} />
                  </span>
                  <span className="mentor-profile-copy">
                    <strong>Career Mentor</strong>
                    <small>Your question, considered</small>
                  </span>
                </div>

                <span className="mentor-response-status">
                  <span />
                  RESPONSE
                </span>
              </div>

              {askedQuestion && (
                <div className="career-question-summary">
                  <span className="question-summary-label">YOUR QUESTION</span>
                  <p>{askedQuestion}</p>
                </div>
              )}

              <div className="career-response-divider" />

              <div className="career-markdown">
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const isBlock = Boolean(className);

                      return isBlock ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="career-inline-code" {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre({ children }) {
                      return (
                        <pre className="career-code-block">
                          {children}
                        </pre>
                      );
                    },
                    a({ children, href, ...props }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="career-blockquote">
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>

              <div className="career-response-footer">
                <div className="response-footer-note">
                  <Icon name="sparkle" size={15} />
                  <span>Use this guidance as a starting point for your next step.</span>
                </div>

                <div className="response-footer-actions">
                  <button
                    type="button"
                    className="career-secondary-button"
                    onClick={resetQuestion}
                  >
                    New question
                  </button>

                  <Link to="/chat" className="career-primary-link">
                    Continue in chat
                    <Icon name="arrow" size={15} />
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        <footer className="career-footer">
          <Link to="/dashboard" className="career-footer-brand">
            Syllabus<span>AI</span>
          </Link>
          <span>Build clarity. Develop skills. Move forward.</span>
        </footer>
      </main>
    </div>
  );
}

const careerCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html {
    min-width: 320px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background: #090B12;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button, input {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  .career-page {
    --career-bg: #090B12;
    --career-text: #F2F4FC;
    --career-muted: #9299AD;
    --career-blue: #91A9FF;
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    overflow: clip;
    background: var(--career-bg);
    color: var(--career-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .career-background {
    position: absolute;
    z-index: -1;
    inset: 0 0 auto;
    height: 940px;
    overflow: hidden;
    pointer-events: none;
  }

  .career-grid {
    position: absolute;
    inset: 0;
    opacity: .22;
    background-image:
      linear-gradient(rgba(255,255,255,.027) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.027) 1px, transparent 1px);
    background-size: 55px 55px;
    mask-image: linear-gradient(to bottom, #000, transparent 92%);
  }

  .career-glow {
    position: absolute;
    width: 470px;
    height: 470px;
    border-radius: 50%;
    filter: blur(110px);
  }

  .career-glow-one {
    top: -320px;
    left: 15%;
    background: #5278FF;
    opacity: .15;
  }

  .career-glow-two {
    top: 80px;
    right: -350px;
    background: #855BFF;
    opacity: .08;
  }

  /* Navigation */

  .career-navbar {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;
    min-height: 70px;
    padding: 0 clamp(20px, 4.8vw, 72px);
    border-bottom: 1px solid rgba(255,255,255,.065);
    background: rgba(9,11,18,.87);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .career-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    color: #F2F4FC;
    text-decoration: none;
  }

  .career-brand-icon {
    display: grid;
    width: 35px;
    height: 35px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.23);
    border-radius: 10px;
    background: linear-gradient(145deg, rgba(115,145,255,.17), rgba(115,145,255,.035));
    color: #A8BAFF;
  }

  .career-brand-name {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.75px;
    white-space: nowrap;
  }

  .career-brand-name span,
  .career-footer-brand span {
    color: #91A9FF;
  }

  .career-nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(15px, 2.4vw, 32px);
    min-width: 0;
  }

  .career-nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 70px;
    color: #939AAF;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    transition: color .2s ease;
  }

  .career-nav-link::after {
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    border-radius: 4px 4px 0 0;
    background: #91A9FF;
    content: '';
    transform: scaleX(0);
    transition: transform .2s ease;
  }

  .career-nav-link:hover,
  .career-nav-link.career-nav-active {
    color: #F2F4FC;
  }

  .career-nav-link.career-nav-active::after {
    transform: scaleX(1);
  }

  .career-nav-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 35px;
    padding: 0 11px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 9px;
    background: rgba(255,255,255,.035);
    color: #C4CBE0;
    font-size: 11px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    transition: background .2s ease, border-color .2s ease, color .2s ease;
  }

  .career-nav-action:hover {
    border-color: rgba(145,169,255,.25);
    background: rgba(145,169,255,.08);
    color: #E4E9FF;
  }

  /* Main width */

  .career-main {
    width: min(100% - 64px, 1030px);
    margin: 0 auto;
    padding: 0 0 24px;
  }

  /* Hero */

  .career-hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(260px, .75fr);
    align-items: center;
    gap: 25px;
    min-height: 365px;
    padding: 48px 0 42px;
    border-bottom: 1px solid rgba(255,255,255,.065);
    animation: careerEnter .55s ease both;
  }

  .career-hero-copy {
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  .career-eyebrow,
  .career-section-kicker {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #929CB9;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.55px;
  }

  .career-eyebrow {
    margin-bottom: 20px;
  }

  .career-eyebrow-line {
    width: 23px;
    height: 1px;
    background: #91A9FF;
  }

  .career-hero h1 {
    margin: 0;
    color: #F3F5FC;
    font-size: clamp(35px, 4.4vw, 52px);
    font-weight: 700;
    letter-spacing: -2.6px;
    line-height: 1.16;
    overflow-wrap: anywhere;
  }

  .career-hero h1 span {
    color: #9EB2FF;
  }

  .career-hero-description {
    max-width: 515px;
    margin: 19px 0 0;
    color: #979FB4;
    font-size: 13px;
    line-height: 1.9;
  }

  .career-hero-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 11px;
    margin-top: 23px;
  }

  .mentor-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #C1C7D9;
    font-size: 10px;
    font-weight: 500;
  }

  .mentor-status > span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6FD6B4;
    box-shadow: 0 0 10px rgba(111,214,180,.35);
  }

  .meta-divider {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #505A70;
  }

  .career-meta-text {
    color: #7E879E;
    font-size: 10px;
  }

  /* Hero illustration */

  .career-hero-visual {
    position: relative;
    display: grid;
    min-width: 0;
    min-height: 300px;
    place-items: center;
    isolation: isolate;
  }

  .career-orbit {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(145,169,255,.12);
    border-radius: 50%;
  }

  .career-orbit-one {
    width: 170px;
    height: 170px;
  }

  .career-orbit-two {
    width: 235px;
    height: 235px;
    border-style: dashed;
    opacity: .75;
  }

  .career-orbit-three {
    width: 295px;
    height: 295px;
    border-color: rgba(145,169,255,.07);
  }

  .career-compass {
    position: relative;
    display: grid;
    width: 116px;
    height: 116px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.25);
    border-radius: 31px;
    background: linear-gradient(145deg, rgba(145,169,255,.13), rgba(145,169,255,.035));
    box-shadow: 0 25px 80px rgba(50,65,130,.15), inset 0 1px rgba(255,255,255,.055);
    transform: rotate(-7deg);
  }

  .compass-inner {
    display: grid;
    width: 80px;
    height: 80px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.16);
    border-radius: 22px;
    background: rgba(10,13,23,.55);
    color: #A9BCFF;
  }

  .compass-point {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #B8C7FF;
    box-shadow: 0 0 12px rgba(145,169,255,.5);
  }

  .compass-point-top { top: -3px; left: 50%; }
  .compass-point-right { top: 50%; right: -3px; }
  .compass-point-bottom { bottom: -3px; left: 50%; }
  .compass-point-left { top: 50%; left: -3px; }

  .career-floating-card {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: calc(100% - 8px);
    padding: 11px 13px;
    border: 1px solid rgba(255,255,255,.11);
    border-radius: 12px;
    background: rgba(20,24,37,.94);
    box-shadow: 0 12px 35px rgba(0,0,0,.2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .career-floating-card-top {
    top: 30px;
    right: -2px;
  }

  .career-floating-card-bottom {
    bottom: 28px;
    left: 0;
  }

  .floating-card-icon {
    display: grid;
    width: 29px;
    height: 29px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(111,214,180,.16);
    border-radius: 9px;
    background: rgba(111,214,180,.08);
    color: #75D8B8;
  }

  .floating-sparkle {
    display: grid;
    width: 29px;
    height: 29px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(145,169,255,.17);
    border-radius: 9px;
    background: rgba(145,169,255,.1);
    color: #B0C1FF;
  }

  .career-floating-card > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .career-floating-card strong {
    color: #E0E5F4;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }

  .career-floating-card small {
    color: #838CA4;
    font-size: 9px;
    white-space: nowrap;
  }

  /* Shared sections */

  .career-ask-section,
  .career-prompts-section,
  .career-response-section {
    padding-top: 37px;
    animation: careerEnter .5s ease both;
  }

  .career-section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .career-section-kicker {
    margin-bottom: 9px;
    font-size: 9px;
    letter-spacing: 1.45px;
  }

  .career-section-heading h2 {
    margin: 0;
    color: #F0F2FA;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -.7px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .career-step-number {
    padding-bottom: 4px;
    color: #68738E;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  /* Question input */

  .career-input-card {
    padding: 19px;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(21,25,39,.88), rgba(15,18,28,.9));
    box-shadow: 0 15px 45px rgba(0,0,0,.09);
  }

  .career-input-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    color: #8B94AB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.2px;
  }

  .career-input-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #91A9FF;
    box-shadow: 0 0 8px rgba(145,169,255,.35);
  }

  .career-input-row {
    display: flex;
    align-items: stretch;
    gap: 10px;
    min-width: 0;
  }

  .career-question-input {
    flex: 1;
    width: 0;
    min-width: 0;
    min-height: 49px;
    padding: 0 15px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 11px;
    outline: none;
    background: rgba(255,255,255,.035);
    color: #F1F3FB;
    font-size: 12px;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .career-question-input::placeholder {
    color: #737D94;
  }

  .career-question-input:focus {
    border-color: rgba(145,169,255,.45);
    background: rgba(255,255,255,.045);
    box-shadow: 0 0 0 3px rgba(145,169,255,.06);
  }

  .career-question-input:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .career-ask-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    min-width: 130px;
    min-height: 49px;
    padding: 0 16px;
    border: 1px solid rgba(166,184,255,.3);
    border-radius: 11px;
    background: linear-gradient(135deg, #A3B5FF, #8399F4);
    color: #10162A;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
  }

  .career-ask-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(106,129,235,.2);
  }

  .career-ask-button:disabled {
    opacity: .48;
    cursor: not-allowed;
  }

  .career-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(16,22,42,.2);
    border-top-color: #10162A;
    border-radius: 50%;
    animation: careerSpin .8s linear infinite;
  }

  .career-input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 12px;
    color: #747E95;
    font-size: 9px;
  }

  .career-input-footer kbd {
    padding: 2px 5px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 4px;
    background: rgba(255,255,255,.025);
    color: #A3ABC0;
    font: inherit;
    font-size: 9px;
  }

  .career-input-footer-note {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #8B95AE;
  }

  .career-input-footer-note svg {
    color: #A4B7FF;
  }

  /* Suggested questions */

  .career-prompts-section {
    padding-bottom: 36px;
  }

  .prompts-heading {
    margin-bottom: 18px;
  }

  .career-prompts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .career-prompt-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    min-height: 194px;
    padding: 17px 16px 15px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(21,25,38,.82), rgba(14,17,27,.84));
    color: #F1F3FA;
    text-align: left;
    cursor: pointer;
    transition: transform .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease;
  }

  .career-prompt-card::before {
    position: absolute;
    top: -75px;
    right: -65px;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: #91A9FF;
    content: '';
    filter: blur(70px);
    opacity: 0;
    transition: opacity .25s ease;
    pointer-events: none;
  }

  .career-prompt-card:hover:not(:disabled) {
    transform: translateY(-3px);
    border-color: rgba(145,169,255,.23);
    background: linear-gradient(145deg, rgba(27,32,48,.94), rgba(17,20,31,.95));
    box-shadow: 0 14px 35px rgba(0,0,0,.14);
  }

  .career-prompt-card:hover::before {
    opacity: .09;
  }

  .career-prompt-card:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .prompt-topline {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 16px;
  }

  .prompt-symbol {
    display: grid;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(145,169,255,.16);
    border-radius: 10px;
    background: rgba(145,169,255,.075);
    color: #AABEFF;
    font-size: 20px;
  }

  .prompt-number {
    color: #555E76;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .prompt-category {
    position: relative;
    z-index: 1;
    margin-bottom: 7px;
    color: #8794B9;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .55px;
    text-transform: uppercase;
  }

  .prompt-title {
    position: relative;
    z-index: 1;
    color: #E7EAF5;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .prompt-description {
    position: relative;
    z-index: 1;
    margin-top: 7px;
    color: #8F97AC;
    font-size: 10px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .prompt-action {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-top: auto;
    padding-top: 15px;
    color: #9EB2FF;
    font-size: 10px;
    font-weight: 600;
  }

  .prompt-action svg {
    transition: transform .2s ease;
  }

  .career-prompt-card:hover .prompt-action svg {
    transform: translateX(3px);
  }

  /* Loading state */

  .career-loading-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 330px;
    margin-top: 29px;
    padding: 42px 24px;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(21,25,38,.8), rgba(13,16,25,.8));
    text-align: center;
    animation: careerEnter .35s ease both;
  }

  .mentor-thinking-visual {
    position: relative;
    display: grid;
    width: 94px;
    height: 94px;
    margin-bottom: 25px;
    place-items: center;
  }

  .thinking-ring {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(145,169,255,.23);
    border-radius: 50%;
    animation: thinkingPulse 2s ease-in-out infinite;
  }

  .thinking-ring-two {
    inset: 12px;
    border-color: rgba(145,169,255,.13);
    animation-delay: .4s;
  }

  .thinking-center {
    display: grid;
    width: 47px;
    height: 47px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.21);
    border-radius: 15px;
    background: rgba(145,169,255,.1);
    color: #B2C2FF;
  }

  .career-loading-card .career-section-kicker {
    margin-bottom: 10px;
  }

  .career-loading-card h2 {
    margin: 0;
    color: #F0F2FA;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -.5px;
  }

  .career-loading-card > p {
    max-width: 390px;
    margin: 10px 0 19px;
    color: #9098AE;
    font-size: 12px;
    line-height: 1.7;
  }

  .thinking-dots {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .thinking-dots span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #A6B7FF;
    animation: careerDots 1s ease-in-out infinite;
  }

  .thinking-dots span:nth-child(2) { animation-delay: .15s; }
  .thinking-dots span:nth-child(3) { animation-delay: .3s; }

  /* Response */

  .career-response-section {
    padding-bottom: 37px;
  }

  .response-heading {
    align-items: center;
  }

  .career-ask-another {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    padding: 0 11px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    color: #AEB5C8;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }

  .career-ask-another:hover {
    border-color: rgba(145,169,255,.22);
    background: rgba(145,169,255,.06);
    color: #DDE4FF;
  }

  .career-response-card {
    min-width: 0;
    padding: clamp(19px, 3vw, 29px);
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(21,25,39,.91), rgba(13,16,26,.94));
    box-shadow: 0 20px 55px rgba(0,0,0,.12);
    animation: careerEnter .35s ease both;
  }

  .career-response-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .mentor-profile {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .mentor-profile-icon {
    display: grid;
    width: 41px;
    height: 41px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(145,169,255,.22);
    border-radius: 12px;
    background: rgba(145,169,255,.095);
    color: #A8BBFF;
  }

  .mentor-profile-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .mentor-profile-copy strong {
    color: #E6EAF6;
    font-size: 12px;
    font-weight: 700;
  }

  .mentor-profile-copy small {
    color: #858EA5;
    font-size: 10px;
  }

  .mentor-response-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    color: #818AA1;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .9px;
  }

  .mentor-response-status > span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #74D8B9;
  }

  .career-question-summary {
    margin-top: 21px;
    padding: 14px 15px;
    border: 1px solid rgba(145,169,255,.12);
    border-radius: 10px;
    background: rgba(145,169,255,.045);
  }

  .question-summary-label {
    color: #8F9EC7;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.1px;
  }

  .career-question-summary p {
    margin: 7px 0 0;
    color: #D3D9EA;
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .career-response-divider {
    height: 1px;
    margin: 22px 0;
    background: rgba(255,255,255,.075);
  }

  /* Markdown content */

  .career-markdown {
    min-width: 0;
    color: #C8CFDF;
    font-size: 13px;
    line-height: 1.85;
    overflow-wrap: anywhere;
  }

  .career-markdown > :first-child {
    margin-top: 0;
  }

  .career-markdown > :last-child {
    margin-bottom: 0;
  }

  .career-markdown p {
    margin: 0 0 13px;
    line-height: 1.85;
  }

  .career-markdown h1,
  .career-markdown h2,
  .career-markdown h3,
  .career-markdown h4 {
    color: #F0F2FA;
    font-weight: 700;
    letter-spacing: -.35px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .career-markdown h1 {
    margin: 25px 0 11px;
    font-size: 23px;
  }

  .career-markdown h2 {
    margin: 24px 0 10px;
    font-size: 19px;
  }

  .career-markdown h3 {
    margin: 20px 0 8px;
    font-size: 15px;
  }

  .career-markdown h4 {
    margin: 17px 0 7px;
    font-size: 13px;
  }

  .career-markdown ul,
  .career-markdown ol {
    margin: 8px 0 15px;
    padding-left: 24px;
  }

  .career-markdown li {
    margin: 6px 0;
    padding-left: 3px;
    line-height: 1.8;
  }

  .career-markdown li::marker {
    color: #9FB3FF;
  }

  .career-markdown strong {
    color: #F1F3FB;
    font-weight: 700;
  }

  .career-markdown em {
    color: #E0E5F3;
  }

  .career-markdown hr {
    height: 1px;
    margin: 22px 0;
    border: 0;
    background: rgba(255,255,255,.09);
  }

  .career-markdown a {
    color: #A9BDFF;
    text-decoration: underline;
    text-decoration-color: rgba(169,189,255,.36);
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }

  .career-markdown a:hover {
    color: #DBE4FF;
  }

  .career-blockquote {
    margin: 15px 0;
    padding: 6px 0 6px 15px;
    border-left: 3px solid #91A9FF;
    color: #ADB6CC;
  }

  .career-blockquote p {
    margin-bottom: 0;
  }

  .career-inline-code {
    padding: 2px 6px;
    border: 1px solid rgba(145,169,255,.12);
    border-radius: 5px;
    background: rgba(145,169,255,.07);
    color: #BBD0FF;
    font-family: Consolas, 'SFMono-Regular', monospace;
    font-size: .9em;
    overflow-wrap: anywhere;
  }

  .career-code-block {
    max-width: 100%;
    margin: 13px 0;
    padding: 15px;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 11px;
    background: #080B12;
    scrollbar-width: thin;
  }

  .career-code-block code {
    color: #B6E6D1;
    font-family: Consolas, 'SFMono-Regular', monospace;
    font-size: 12px;
    line-height: 1.75;
    white-space: pre;
  }

  .career-response-footer {
    display: flex;
    flex-direction: column;
    gap: 17px;
    margin-top: 27px;
    padding-top: 19px;
    border-top: 1px solid rgba(255,255,255,.075);
  }

  .response-footer-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #8C95AA;
    font-size: 10px;
    line-height: 1.7;
  }

  .response-footer-note svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #9AABEB;
  }

  .response-footer-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .career-secondary-button,
  .career-primary-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 13px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;
  }

  .career-secondary-button {
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.025);
    color: #AFB6C9;
  }

  .career-secondary-button:hover {
    border-color: rgba(255,255,255,.18);
    background: rgba(255,255,255,.055);
    color: #F1F3FB;
  }

  .career-primary-link {
    border: 1px solid rgba(145,169,255,.25);
    background: rgba(145,169,255,.105);
    color: #B7C7FF;
  }

  .career-primary-link:hover {
    transform: translateY(-1px);
    border-color: rgba(145,169,255,.4);
    background: rgba(145,169,255,.16);
  }

  /* Footer */

  .career-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 21px 0 11px;
    border-top: 1px solid rgba(255,255,255,.065);
    color: #707991;
    font-size: 10px;
  }

  .career-footer-brand {
    color: #D8DDEF;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: -.3px;
    text-decoration: none;
  }

  /* Animations */

  @keyframes careerSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes careerEnter {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes thinkingPulse {
    0%, 100% {
      transform: scale(.94);
      opacity: .5;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
  }

  @keyframes careerDots {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: .4;
    }
    30% {
      transform: translateY(-5px);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }

  /* Tablets and small laptops */

  @media (max-width: 900px) {
    .career-navbar {
      gap: 18px;
      padding-right: 24px;
      padding-left: 24px;
    }

    .career-nav-links {
      gap: 17px;
    }

    .career-nav-link {
      font-size: 11px;
    }

    .career-main {
      width: calc(100% - 48px);
    }

    .career-hero {
      grid-template-columns: minmax(0, 1.2fr) minmax(220px, .8fr);
      gap: 12px;
    }

    .career-hero h1 {
      font-size: clamp(34px, 5vw, 45px);
    }

    .career-hero-visual {
      transform: scale(.9);
    }

    .career-prompts-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  /* Mobile and narrow tablets */

  @media (max-width: 680px) {
    .career-navbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0 12px;
      min-height: 0;
      padding: 11px 17px 0;
    }

    .career-brand {
      min-height: 38px;
    }

    .career-nav-action {
      justify-self: end;
      min-height: 33px;
    }

    .career-nav-links {
      grid-column: 1 / -1;
      justify-content: flex-start;
      gap: 24px;
      width: 100%;
      margin-top: 8px;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .career-nav-links::-webkit-scrollbar {
      display: none;
    }

    .career-nav-link {
      min-height: 43px;
      font-size: 11px;
    }

    .career-main {
      width: calc(100% - 36px);
    }

    .career-hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
      padding: 40px 0 25px;
    }

    .career-hero-copy {
      max-width: 570px;
    }

    .career-hero h1 {
      font-size: clamp(34px, 8vw, 43px);
      letter-spacing: -1.9px;
    }

    .career-hero-description {
      margin-top: 15px;
      font-size: 12px;
    }

    .career-hero-meta {
      margin-top: 19px;
    }

    .career-hero-visual {
      min-height: 245px;
      margin-top: 6px;
      transform: none;
    }

    .career-orbit-one {
      width: 135px;
      height: 135px;
    }

    .career-orbit-two {
      width: 195px;
      height: 195px;
    }

    .career-orbit-three {
      width: 250px;
      height: 250px;
    }

    .career-compass {
      width: 99px;
      height: 99px;
      border-radius: 25px;
    }

    .compass-inner {
      width: 69px;
      height: 69px;
      border-radius: 18px;
    }

    .compass-inner svg {
      width: 45px;
      height: 45px;
    }

    .career-floating-card-top {
      top: 16px;
      right: 0;
    }

    .career-floating-card-bottom {
      bottom: 15px;
      left: 0;
    }

    .career-ask-section,
    .career-prompts-section,
    .career-response-section {
      padding-top: 29px;
    }

    .career-section-heading h2 {
      font-size: 19px;
    }

    .career-input-card {
      padding: 15px;
    }

    .career-question-input {
      font-size: 12px;
    }

    .career-ask-button {
      min-width: 108px;
      padding: 0 12px;
      gap: 8px;
      font-size: 10px;
    }

    .career-prompts-grid {
      gap: 10px;
    }

    .career-prompt-card {
      min-height: 190px;
      padding: 15px 13px 13px;
    }

    .career-response-card {
      padding: 19px;
    }

    .career-footer {
      padding-bottom: 18px;
    }
  }

  /* Phones */

  @media (max-width: 430px) {
    .career-navbar {
      padding-right: 14px;
      padding-left: 14px;
    }

    .career-brand {
      gap: 8px;
    }

    .career-brand-icon {
      width: 32px;
      height: 32px;
    }

    .career-brand-name {
      font-size: 15px;
    }

    .career-nav-links {
      gap: 21px;
    }

    .career-nav-action {
      gap: 6px;
      padding: 0 9px;
      font-size: 10px;
    }

    .career-main {
      width: calc(100% - 30px);
    }

    .career-hero {
      padding-top: 32px;
    }

    .career-eyebrow {
      gap: 7px;
      font-size: 8px;
      letter-spacing: 1.1px;
    }

    .career-hero h1 {
      font-size: clamp(31px, 8.1vw, 37px);
      letter-spacing: -1.6px;
    }

    .career-hero-description {
      font-size: 11.5px;
      line-height: 1.85;
    }

    .career-meta-text {
      font-size: 9px;
    }

    .career-hero-visual {
      min-height: 225px;
    }

    .career-floating-card {
      gap: 7px;
      padding: 9px 10px;
    }

    .career-floating-card-top {
      right: 0;
    }

    .career-floating-card strong {
      font-size: 9px;
    }

    .career-floating-card small {
      font-size: 8px;
    }

    .career-section-heading {
      align-items: flex-start;
      gap: 12px;
    }

    .career-section-heading h2 {
      font-size: 18px;
    }

    .career-step-number {
      padding-top: 3px;
      font-size: 8px;
    }

    .career-input-card {
      padding: 13px;
    }

    .career-input-row {
      flex-direction: column;
      gap: 9px;
    }

    .career-question-input {
      width: 100%;
      min-height: 47px;
      padding: 0 12px;
    }

    .career-ask-button {
      width: 100%;
      min-height: 44px;
    }

    .career-input-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .career-prompts-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }

    .career-prompt-card {
      min-height: 174px;
      padding: 15px;
    }

    .prompt-topline {
      margin-bottom: 12px;
    }

    .prompt-description {
      font-size: 11px;
    }

    .prompt-action {
      padding-top: 12px;
    }

    .career-loading-card {
      min-height: 295px;
      padding: 30px 17px;
    }

    .career-loading-card h2 {
      font-size: 18px;
    }

    .response-heading {
      flex-direction: column;
      align-items: flex-start;
    }

    .career-response-card {
      padding: 16px;
      border-radius: 14px;
    }

    .mentor-response-status {
      font-size: 8px;
    }

    .career-markdown {
      font-size: 12px;
    }

    .career-markdown h1 {
      font-size: 20px;
    }

    .career-markdown h2 {
      font-size: 17px;
    }

    .career-markdown h3 {
      font-size: 14px;
    }

    .career-markdown ul,
    .career-markdown ol {
      padding-left: 20px;
    }

    .career-response-footer {
      margin-top: 22px;
      padding-top: 16px;
    }

    .response-footer-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .career-secondary-button,
    .career-primary-link {
      min-width: 0;
      padding: 0 9px;
      font-size: 9px;
    }

    .career-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }
  }

  @media (max-width: 350px) {
    .career-nav-action span {
      display: none;
    }

    .career-nav-action {
      width: 34px;
      padding: 0;
    }

    .career-hero h1 {
      font-size: 30px;
    }

    .career-step-number {
      display: none;
    }

    .career-floating-card strong {
      font-size: 8px;
    }

    .career-floating-card small {
      font-size: 7px;
    }

    .mentor-response-status {
      display: none;
    }

    .response-footer-actions {
      grid-template-columns: minmax(0, 1fr);
    }

    .career-secondary-button,
    .career-primary-link {
      width: 100%;
    }
  }
`;