import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Icon = ({ name, size = 18 }) => {
  const props = {
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

  const icons = {
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M20 12a8 8 0 0 0-14-5L4 9" />
        <path d="M4 17v-5h5" />
        <path d="M4 12a8 8 0 0 0 14 5l2-2" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        <path d="m19 3 .8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3Z" />
      </>
    ),
  };

  return <svg {...props}>{icons[name] || icons.sparkle}</svg>;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await authAPI.forgotPassword(normalizedEmail);

      setEmail(normalizedEmail);
      setSent(true);
      toast.success('If your account exists, a reset link will be sent.');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to send the reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSent(false);
  };

  return (
    <div className="forgot-page">
      <style>{forgotCSS}</style>

      <div className="forgot-background" aria-hidden="true">
        <div className="forgot-grid" />
        <div className="forgot-glow forgot-glow-blue" />
        <div className="forgot-glow forgot-glow-purple" />
      </div>

      <main className="forgot-layout">
        <section className="forgot-showcase">
          <Link to="/" className="forgot-brand">
            <span className="forgot-brand-icon">
              <Icon name="layers" size={20} />
            </span>
            <span className="forgot-brand-name">
              Syllabus<span>AI</span>
            </span>
          </Link>

          <div className="forgot-showcase-content">
            <div className="forgot-eyebrow">
              <span />
              ACCOUNT RECOVERY
            </div>

            <h1>
              Find your way
              <br />
              <span>back to learning.</span>
            </h1>

            <p className="forgot-showcase-description">
              Forgot your password? It happens. Follow a few simple steps to
              regain access to your learning space and pick up where you left off.
            </p>

            <div className="forgot-illustration" aria-hidden="true">
              <div className="forgot-orbit forgot-orbit-large" />
              <div className="forgot-orbit forgot-orbit-medium" />
              <div className="forgot-orbit forgot-orbit-small" />

              <div className="forgot-envelope">
                <div className="forgot-envelope-paper">
                  <span />
                  <span />
                  <span />
                  <div className="forgot-paper-check">
                    <Icon name="check" size={14} />
                  </div>
                </div>

                <svg
                  className="forgot-envelope-flap"
                  viewBox="0 0 220 145"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 7 110 86 212 7"
                    stroke="rgba(180,197,255,.8)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="forgot-envelope-body">
                  <svg viewBox="0 0 220 145" fill="none" aria-hidden="true">
                    <path
                      d="M7 9 88 76 110 91 132 76 213 9"
                      stroke="rgba(180,197,255,.42)"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="forgot-floating-card forgot-floating-top">
                <span className="forgot-floating-icon">
                  <Icon name="mail" size={16} />
                </span>
                <span>
                  <strong>Check your inbox</strong>
                  <small>Your next step is on its way</small>
                </span>
              </div>

              <div className="forgot-floating-card forgot-floating-bottom">
                <span className="forgot-floating-shield">
                  <Icon name="shield" size={17} />
                </span>
                <span>
                  <strong>Account protected</strong>
                  <small>A secure recovery process</small>
                </span>
              </div>

              <span className="forgot-visual-dot forgot-dot-one" />
              <span className="forgot-visual-dot forgot-dot-two" />
              <span className="forgot-visual-dot forgot-dot-three" />
            </div>

            <div className="forgot-security-note">
              <span className="forgot-security-icon">
                <Icon name="shield" size={16} />
              </span>
              <span>
                <strong>Your account, your control.</strong>
                <small>Recovery links help you regain access securely.</small>
              </span>
            </div>
          </div>

          <div className="forgot-showcase-footer">
            <span>Take a breath.</span>
            <span className="forgot-footer-dot" />
            <span>We'll help you get back on track.</span>
          </div>
        </section>

        <section className="forgot-panel">
          <div className="forgot-mobile-brand-wrap">
            <Link to="/" className="forgot-brand">
              <span className="forgot-brand-icon">
                <Icon name="layers" size={19} />
              </span>
              <span className="forgot-brand-name">
                Syllabus<span>AI</span>
              </span>
            </Link>
          </div>

          {!sent ? (
            <div className="forgot-card">
              <div className="forgot-card-eyebrow">
                <span className="forgot-status-dot" />
                PASSWORD RECOVERY
              </div>

              <div className="forgot-card-heading">
                <div className="forgot-heading-icon">
                  <Icon name="mail" size={22} />
                </div>

                <h2>Forgot your password?</h2>

                <p>
                  Enter the email address associated with your account. We'll
                  help you get back in.
                </p>
              </div>

              <div className="forgot-steps">
                <div className="forgot-step active">
                  <span>01</span>
                  <span>Email</span>
                </div>

                <span className="forgot-step-line" />

                <div className="forgot-step">
                  <span>02</span>
                  <span>Verify</span>
                </div>

                <span className="forgot-step-line" />

                <div className="forgot-step">
                  <span>03</span>
                  <span>Reset</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="forgot-field">
                  <label htmlFor="forgot-email" className="forgot-label">
                    Email address
                  </label>

                  <div className="forgot-input-wrap">
                    <span className="forgot-input-icon">
                      <Icon name="mail" size={17} />
                    </span>

                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@college.edu"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={254}
                      required
                      disabled={loading}
                      className="forgot-input"
                    />
                  </div>

                  <p className="forgot-field-hint">
                    Use the email address you registered with.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="forgot-submit"
                >
                  {loading ? (
                    <>
                      <span className="forgot-spinner" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <span className="forgot-submit-arrow">
                        <Icon name="arrow" size={17} />
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-info-card">
                <span className="forgot-info-icon">
                  <Icon name="clock" size={16} />
                </span>
                <span>
                  <strong>Quick security reminder</strong>
                  <small>
                    Reset links are time-sensitive. Check your inbox soon after
                    requesting one.
                  </small>
                </span>
              </div>

              <div className="forgot-divider">
                <span />
                <span>ACCOUNT ACCESS</span>
                <span />
              </div>

              <p className="forgot-back-text">
                Remember your password?
                <Link to="/login">
                  Sign in
                  <Icon name="arrow" size={14} />
                </Link>
              </p>
            </div>
          ) : (
            <div className="forgot-card forgot-success-card">
              <div className="forgot-success-visual">
                <div className="forgot-success-orbit" />
                <div className="forgot-success-orbit forgot-success-orbit-two" />
                <div className="forgot-success-icon">
                  <Icon name="mail" size={30} />
                </div>
                <span className="forgot-success-check">
                  <Icon name="check" size={14} />
                </span>
              </div>

              <div className="forgot-success-eyebrow">
                <span className="forgot-status-dot success-dot" />
                REQUEST SUBMITTED
              </div>

              <h2>Check your inbox.</h2>

              <p className="forgot-success-description">
                If an account exists for this email address, a password reset
                link will be sent to:
              </p>

              <div className="forgot-email-display">
                <span className="forgot-email-icon">
                  <Icon name="mail" size={17} />
                </span>
                <span>{email}</span>
              </div>

              <div className="forgot-success-instructions">
                <div className="forgot-instruction">
                  <span className="instruction-number">01</span>
                  <span>
                    <strong>Check your inbox</strong>
                    <small>Look for the password reset email.</small>
                  </span>
                </div>

                <div className="forgot-instruction">
                  <span className="instruction-number">02</span>
                  <span>
                    <strong>Check your spam folder</strong>
                    <small>The email may occasionally land there.</small>
                  </span>
                </div>

                <div className="forgot-instruction">
                  <span className="instruction-number">03</span>
                  <span>
                    <strong>Open the reset link</strong>
                    <small>Follow the instructions to choose a new password.</small>
                  </span>
                </div>
              </div>

              <div className="forgot-expiry-note">
                <Icon name="clock" size={15} />
                <span>
                  Your reset link expires in 15 minutes, if issued.
                </span>
              </div>

              <Link to="/login" className="forgot-submit forgot-success-submit">
                <span>Back to sign in</span>
                <span className="forgot-submit-arrow">
                  <Icon name="arrow" size={17} />
                </span>
              </Link>

              <button
                type="button"
                className="forgot-resend-button"
                onClick={handleTryAgain}
              >
                <Icon name="refresh" size={14} />
                Try another email address
              </button>
            </div>
          )}

          <div className="forgot-bottom">
            <span className="forgot-bottom-icon">
              <Icon name="shield" size={13} />
            </span>
            <span>Your learning journey is worth protecting.</span>
          </div>

          <p className="forgot-copyright">
            © {new Date().getFullYear()} SyllabusAI
          </p>
        </section>
      </main>
    </div>
  );
}

const forgotCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html {
    min-width: 320px;
    min-height: 100%;
  }

  body {
    margin: 0;
    background: #090B12;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button,
  input {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  .forgot-page {
    --forgot-bg: #090B12;
    --forgot-text: #F2F4FC;
    --forgot-muted: #9299AD;
    --forgot-blue: #91A9FF;
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: center;
    justify-content: center;
    padding: 32px clamp(20px, 4.5vw, 66px);
    overflow: hidden;
    background: var(--forgot-bg);
    color: var(--forgot-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .forgot-background {
    position: fixed;
    z-index: -1;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .forgot-grid {
    position: absolute;
    inset: 0;
    opacity: .22;
    background-image:
      linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: linear-gradient(to bottom, #000, rgba(0,0,0,.65) 60%, transparent);
  }

  .forgot-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(105px);
  }

  .forgot-glow-blue {
    top: -280px;
    left: -180px;
    width: 610px;
    height: 610px;
    background: #4169E1;
    opacity: .13;
  }

  .forgot-glow-purple {
    right: -230px;
    bottom: -270px;
    width: 620px;
    height: 620px;
    background: #7950D8;
    opacity: .1;
  }

  /* Layout */

  .forgot-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(410px, .98fr);
    align-items: center;
    gap: clamp(35px, 5.5vw, 84px);
    width: 100%;
    max-width: 1160px;
    margin: auto;
    animation: forgotEnter .55s ease both;
  }

  /* Branding */

  .forgot-brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    width: fit-content;
    color: #F3F5FC;
    text-decoration: none;
  }

  .forgot-brand-icon {
    display: grid;
    width: 39px;
    height: 39px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(145,169,255,.25);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(115,145,255,.17), rgba(115,145,255,.035));
    color: #A8BAFF;
  }

  .forgot-brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -.9px;
  }

  .forgot-brand-name span {
    color: #91A9FF;
  }

  .forgot-mobile-brand-wrap {
    display: none;
  }

  /* Showcase */

  .forgot-showcase {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    min-width: 0;
    padding: 12px 0 5px;
  }

  .forgot-showcase-content {
    margin-top: auto;
    margin-bottom: auto;
    padding: 42px 0 35px;
  }

  .forgot-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    color: #929DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.65px;
  }

  .forgot-eyebrow > span {
    width: 23px;
    height: 1px;
    background: #91A9FF;
  }

  .forgot-showcase-content > h1 {
    margin: 0;
    color: #F3F5FC;
    font-size: clamp(35px, 4.2vw, 50px);
    font-weight: 700;
    letter-spacing: -2.4px;
    line-height: 1.22;
  }

  .forgot-showcase-content > h1 span {
    color: #9DB1FF;
  }

  .forgot-showcase-description {
    max-width: 440px;
    margin: 19px 0 0;
    color: #949CB1;
    font-size: 13px;
    line-height: 1.95;
  }

  /* Envelope illustration */

  .forgot-illustration {
    position: relative;
    display: grid;
    width: 100%;
    max-width: 475px;
    height: 285px;
    margin-top: 18px;
    place-items: center;
    isolation: isolate;
  }

  .forgot-orbit {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(145,169,255,.13);
    border-radius: 50%;
  }

  .forgot-orbit-large {
    width: 265px;
    height: 265px;
    border-style: dashed;
    opacity: .68;
  }

  .forgot-orbit-medium {
    width: 195px;
    height: 195px;
    border-color: rgba(145,169,255,.19);
  }

  .forgot-orbit-small {
    width: 138px;
    height: 138px;
    border-color: rgba(145,169,255,.24);
  }

  .forgot-envelope {
    position: relative;
    width: 220px;
    height: 145px;
    border: 1px solid rgba(145,169,255,.32);
    border-radius: 14px;
    background: linear-gradient(145deg, #242C44, #151B2D);
    box-shadow: 0 25px 65px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.06);
    transform: rotate(-4deg);
  }

  .forgot-envelope-paper {
    position: absolute;
    top: -23px;
    left: 42px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 136px;
    height: 105px;
    padding: 19px 14px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 8px;
    background: linear-gradient(155deg, #333C55, #20273B);
    box-shadow: 0 8px 25px rgba(0,0,0,.17);
  }

  .forgot-envelope-paper > span {
    display: block;
    width: 100%;
    height: 4px;
    border-radius: 5px;
    background: rgba(220,228,255,.19);
  }

  .forgot-envelope-paper > span:nth-child(2) {
    width: 83%;
  }

  .forgot-envelope-paper > span:nth-child(3) {
    width: 60%;
  }

  .forgot-paper-check {
    position: absolute;
    right: 9px;
    bottom: 9px;
    display: grid;
    width: 23px;
    height: 23px;
    place-items: center;
    border: 1px solid rgba(114,216,184,.2);
    border-radius: 7px;
    background: rgba(114,216,184,.09);
    color: #72D8B8;
  }

  .forgot-envelope-flap {
    position: absolute;
    z-index: 3;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .forgot-envelope-body {
    position: absolute;
    z-index: 2;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    background: linear-gradient(145deg, #242C44, #171D30);
  }

  .forgot-envelope-body svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .forgot-floating-card {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 13px;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: 12px;
    background: rgba(19,23,35,.94);
    box-shadow: 0 15px 40px rgba(0,0,0,.22);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }

  .forgot-floating-top {
    top: 24px;
    right: 0;
  }

  .forgot-floating-bottom {
    bottom: 24px;
    left: 0;
  }

  .forgot-floating-icon,
  .forgot-floating-shield {
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 9px;
  }

  .forgot-floating-icon {
    border: 1px solid rgba(145,169,255,.18);
    background: rgba(145,169,255,.09);
    color: #A8BBFF;
  }

  .forgot-floating-shield {
    border: 1px solid rgba(114,216,184,.17);
    background: rgba(114,216,184,.09);
    color: #78DCC0;
  }

  .forgot-floating-card > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .forgot-floating-card strong {
    color: #E4E8F6;
    font-size: 10px;
    font-weight: 600;
  }

  .forgot-floating-card small {
    color: #838CA3;
    font-size: 9px;
  }

  .forgot-visual-dot {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #A6B8FF;
    box-shadow: 0 0 12px rgba(145,169,255,.55);
  }

  .forgot-dot-one {
    top: 26px;
    left: 21%;
  }

  .forgot-dot-two {
    right: 19%;
    bottom: 36px;
  }

  .forgot-dot-three {
    top: 51%;
    left: 9%;
    width: 4px;
    height: 4px;
    opacity: .65;
  }

  .forgot-security-note {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding-top: 18px;
    border-top: 1px solid rgba(255,255,255,.07);
  }

  .forgot-security-icon {
    display: grid;
    width: 31px;
    height: 31px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(145,169,255,.14);
    border-radius: 9px;
    background: rgba(145,169,255,.06);
    color: #9EB2FF;
  }

  .forgot-security-note > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .forgot-security-note strong {
    color: #D8DDEC;
    font-size: 10px;
    font-weight: 600;
  }

  .forgot-security-note small {
    color: #7D869C;
    font-size: 9px;
    line-height: 1.6;
  }

  .forgot-showcase-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    color: #727B91;
    font-size: 9px;
  }

  .forgot-footer-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #68738C;
  }

  /* Form panel */

  .forgot-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 8px 0;
  }

  .forgot-card {
    width: 100%;
    min-width: 0;
    padding: 31px clamp(22px, 3vw, 35px);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 20px;
    background: linear-gradient(150deg, rgba(20,24,37,.94), rgba(13,16,26,.96));
    box-shadow: 0 30px 100px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.025);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .forgot-card-eyebrow,
  .forgot-success-eyebrow {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 18px;
    color: #939DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.45px;
  }

  .forgot-status-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #91A9FF;
    box-shadow: 0 0 9px rgba(145,169,255,.35);
  }

  .forgot-status-dot.success-dot {
    background: #72D8B8;
    box-shadow: 0 0 9px rgba(114,216,184,.3);
  }

  .forgot-card-heading {
    margin-bottom: 23px;
  }

  .forgot-heading-icon {
    display: grid;
    width: 45px;
    height: 45px;
    margin-bottom: 18px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.2);
    border-radius: 13px;
    background: rgba(145,169,255,.085);
    color: #A8BBFF;
  }

  .forgot-card-heading h2,
  .forgot-success-card > h2 {
    margin: 0;
    color: #F2F4FC;
    font-size: clamp(23px, 2.5vw, 28px);
    font-weight: 700;
    letter-spacing: -1.05px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .forgot-card-heading p,
  .forgot-success-description {
    margin: 10px 0 0;
    color: #969EB3;
    font-size: 11px;
    line-height: 1.85;
  }

  /* Recovery steps */

  .forgot-steps {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 24px;
  }

  .forgot-step {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #737D95;
    font-size: 9px;
    font-weight: 500;
  }

  .forgot-step > span:first-child {
    display: grid;
    width: 25px;
    height: 25px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 8px;
    background: rgba(255,255,255,.025);
    color: #8992A8;
    font-size: 9px;
    font-weight: 700;
  }

  .forgot-step.active {
    color: #D6DEFF;
  }

  .forgot-step.active > span:first-child {
    border-color: rgba(145,169,255,.23);
    background: rgba(145,169,255,.1);
    color: #B4C3FF;
  }

  .forgot-step-line {
    flex: 1;
    min-width: 7px;
    height: 1px;
    background: rgba(255,255,255,.09);
  }

  /* Email field */

  .forgot-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .forgot-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .forgot-label {
    display: block;
    margin-bottom: 9px;
    color: #C4CAD9;
    font-size: 11px;
    font-weight: 600;
  }

  .forgot-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .forgot-input-icon {
    position: absolute;
    left: 13px;
    display: grid;
    place-items: center;
    color: #768098;
    pointer-events: none;
    transition: color .2s ease;
  }

  .forgot-input-wrap:focus-within .forgot-input-icon {
    color: #A6B8FF;
  }

  .forgot-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 48px;
    padding: 0 13px 0 42px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 10px;
    outline: none;
    background: rgba(255,255,255,.027);
    color: #F1F3FC;
    font-size: 12px;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .forgot-input::placeholder {
    color: #6D778F;
    opacity: 1;
  }

  .forgot-input:hover:not(:disabled) {
    border-color: rgba(255,255,255,.15);
  }

  .forgot-input:focus {
    border-color: rgba(145,169,255,.49);
    background: rgba(145,169,255,.035);
    box-shadow: 0 0 0 3px rgba(145,169,255,.065);
  }

  .forgot-input:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .forgot-field-hint {
    margin: 8px 0 0;
    color: #747E95;
    font-size: 9px;
    line-height: 1.6;
  }

  /* Submit button */

  .forgot-submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    margin-top: 1px;
    padding: 0 11px 0 17px;
    border: 1px solid rgba(166,184,255,.3);
    border-radius: 10px;
    background: linear-gradient(135deg, #A0B3FF, #8198F4);
    color: #11172B;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease, background .2s ease;
  }

  .forgot-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #B2C1FF, #91A5FF);
    box-shadow: 0 10px 28px rgba(102,128,235,.2);
  }

  .forgot-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .forgot-submit:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .forgot-submit-arrow {
    display: grid;
    width: 27px;
    height: 27px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(17,23,43,.13);
    border-radius: 8px;
    background: rgba(17,23,43,.055);
  }

  .forgot-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(17,23,43,.22);
    border-top-color: #11172B;
    border-radius: 50%;
    animation: forgotSpin .8s linear infinite;
  }

  /* Security info and footer links */

  .forgot-info-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 20px;
    padding: 12px;
    border: 1px solid rgba(145,169,255,.1);
    border-radius: 10px;
    background: rgba(145,169,255,.04);
  }

  .forgot-info-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #9EB2FF;
  }

  .forgot-info-card > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .forgot-info-card strong {
    color: #C8D1EB;
    font-size: 10px;
    font-weight: 600;
  }

  .forgot-info-card small {
    color: #8791A9;
    font-size: 9px;
    line-height: 1.7;
  }

  .forgot-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 23px 0 18px;
    color: #626C83;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1.1px;
    white-space: nowrap;
  }

  .forgot-divider > span:first-child,
  .forgot-divider > span:last-child {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.07);
  }

  .forgot-back-text {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
    margin: 0;
    color: #8E97AC;
    font-size: 10px;
    line-height: 1.8;
    text-align: center;
  }

  .forgot-back-text a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #A8BAFF;
    font-weight: 600;
    text-decoration: none;
    transition: color .2s ease;
  }

  .forgot-back-text a:hover {
    color: #DBE3FF;
  }

  /* Success state */

  .forgot-success-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    animation: forgotEnter .35s ease both;
  }

  .forgot-success-visual {
    position: relative;
    display: grid;
    width: 90px;
    height: 90px;
    margin: 0 auto 23px;
    place-items: center;
  }

  .forgot-success-orbit {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(114,216,184,.2);
    border-radius: 50%;
  }

  .forgot-success-orbit-two {
    inset: 10px;
    border-color: rgba(114,216,184,.12);
  }

  .forgot-success-icon {
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.2);
    border-radius: 15px;
    background: rgba(145,169,255,.09);
    color: #A8BBFF;
  }

  .forgot-success-check {
    position: absolute;
    right: 2px;
    bottom: 8px;
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border: 3px solid #131724;
    border-radius: 50%;
    background: #72D8B8;
    color: #10251F;
  }

  .forgot-success-eyebrow {
    justify-content: center;
    margin-bottom: 13px;
    color: #A1B1DD;
  }

  .forgot-success-card > h2 {
    text-align: center;
    font-size: 28px;
  }

  .forgot-success-description {
    margin-top: 10px;
    font-size: 11px;
    text-align: center;
  }

  .forgot-email-display {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin-top: 19px;
    padding: 12px;
    border: 1px solid rgba(145,169,255,.14);
    border-radius: 10px;
    background: rgba(145,169,255,.045);
  }

  .forgot-email-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #A8BBFF;
  }

  .forgot-email-display > span:last-child {
    min-width: 0;
    overflow-wrap: anywhere;
    color: #DEE4FA;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.6;
  }

  .forgot-success-instructions {
    display: flex;
    flex-direction: column;
    gap: 17px;
    margin-top: 25px;
  }

  .forgot-instruction {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .instruction-number {
    display: grid;
    width: 27px;
    height: 27px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 8px;
    background: rgba(255,255,255,.035);
    color: #A7B7F2;
    font-size: 9px;
    font-weight: 700;
  }

  .forgot-instruction > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    padding-top: 2px;
  }

  .forgot-instruction strong {
    color: #DCE1EF;
    font-size: 10px;
    font-weight: 600;
  }

  .forgot-instruction small {
    color: #8791A9;
    font-size: 9px;
    line-height: 1.65;
  }

  .forgot-expiry-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 23px;
    padding: 12px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 9px;
    background: rgba(255,255,255,.02);
    color: #969FB4;
    font-size: 9px;
    line-height: 1.65;
  }

  .forgot-expiry-note svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #A6B8FF;
  }

  .forgot-success-submit {
    margin-top: 18px;
  }

  .forgot-resend-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    align-self: center;
    min-height: 36px;
    margin-top: 11px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: #A8BAFF;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: color .2s ease, background .2s ease;
  }

  .forgot-resend-button:hover {
    background: rgba(145,169,255,.055);
    color: #D7E0FF;
  }

  /* Footer */

  .forgot-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    color: #7D869C;
    font-size: 9px;
    text-align: center;
    line-height: 1.6;
  }

  .forgot-bottom-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #91A9FF;
  }

  .forgot-copyright {
    margin: 13px 0 0;
    color: #555E74;
    font-size: 9px;
    text-align: center;
  }

  /* Focus and animation */

  .forgot-page button:focus-visible,
  .forgot-page a:focus-visible {
    outline: 2px solid #A4B7FF;
    outline-offset: 3px;
  }

  @keyframes forgotSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes forgotEnter {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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

  /* Tablet */

  @media (max-width: 1000px) {
    .forgot-page {
      padding: 27px;
    }

    .forgot-layout {
      grid-template-columns: minmax(0, 1fr) minmax(370px, .96fr);
      gap: 32px;
    }

    .forgot-showcase-content > h1 {
      font-size: clamp(33px, 4vw, 43px);
      letter-spacing: -1.9px;
    }

    .forgot-illustration {
      height: 245px;
    }

    .forgot-orbit-large {
      width: 230px;
      height: 230px;
    }

    .forgot-orbit-medium {
      width: 176px;
      height: 176px;
    }

    .forgot-card {
      padding-right: 25px;
      padding-left: 25px;
    }
  }

  /* Mobile */

  @media (max-width: 740px) {
    .forgot-page {
      align-items: flex-start;
      padding: 25px 20px 28px;
      overflow-y: auto;
    }

    .forgot-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      width: 100%;
      max-width: 460px;
      margin: auto;
    }

    .forgot-showcase {
      display: none;
    }

    .forgot-panel {
      width: 100%;
      padding: 0;
    }

    .forgot-mobile-brand-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 0 0 23px;
    }

    .forgot-brand {
      gap: 10px;
    }

    .forgot-brand-icon {
      width: 37px;
      height: 37px;
    }

    .forgot-brand-name {
      font-size: 18px;
    }

    .forgot-card {
      padding: 29px clamp(20px, 6vw, 31px);
      border-radius: 17px;
    }

    .forgot-card-heading h2 {
      font-size: 26px;
    }

    .forgot-bottom {
      margin-top: 18px;
    }

    .forgot-copyright {
      margin-top: 12px;
    }
  }

  /* Small phones */

  @media (max-width: 400px) {
    .forgot-page {
      padding: 20px 14px 24px;
    }

    .forgot-mobile-brand-wrap {
      margin-bottom: 20px;
    }

    .forgot-card {
      padding: 25px 18px;
      border-radius: 15px;
    }

    .forgot-card-eyebrow {
      margin-bottom: 15px;
      font-size: 8px;
    }

    .forgot-card-heading {
      margin-bottom: 20px;
    }

    .forgot-card-heading h2 {
      font-size: 23px;
      letter-spacing: -.8px;
    }

    .forgot-card-heading p {
      font-size: 10px;
    }

    .forgot-steps {
      gap: 6px;
    }

    .forgot-step {
      gap: 5px;
      font-size: 8px;
    }

    .forgot-step > span:first-child {
      width: 23px;
      height: 23px;
    }

    .forgot-step-line {
      min-width: 4px;
    }

    .forgot-input {
      height: 45px;
      font-size: 11px;
    }

    .forgot-divider {
      gap: 8px;
      font-size: 7px;
    }

    .forgot-bottom {
      font-size: 8px;
    }

    .forgot-success-card > h2 {
      font-size: 25px;
    }
  }
`;