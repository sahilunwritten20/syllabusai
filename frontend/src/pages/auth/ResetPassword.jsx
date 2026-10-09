import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.8" />
        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 2 21h20L12 3Z" />
        <path d="M12 9v4M12 17h.01" />
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!resetSuccess) return undefined;

    const timer = window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [resetSuccess, navigate]);

  const strength =
    password.length === 0
      ? 0
      : password.length < 6
      ? 1
      : password.length < 10
      ? 2
      : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('This password reset link is invalid.');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please complete both password fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Your password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (loading || resetSuccess) return;

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setResetSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to reset your password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <style>{resetCSS}</style>

      <div className="reset-background" aria-hidden="true">
        <div className="reset-grid" />
        <div className="reset-glow reset-glow-blue" />
        <div className="reset-glow reset-glow-purple" />
      </div>

      <main className="reset-layout">
        <section className="reset-showcase">
          <Link to="/" className="reset-brand">
            <span className="reset-brand-icon">
              <Icon name="layers" size={20} />
            </span>
            <span className="reset-brand-name">
              Syllabus<span>AI</span>
            </span>
          </Link>

          <div className="reset-showcase-content">
            <div className="reset-eyebrow">
              <span />
              ACCOUNT SECURITY
            </div>

            <h1>
              A fresh start
              <br />
              begins <span>here.</span>
            </h1>

            <p>
              Choose a new password to secure your account and get back to
              learning, growing, and reaching your goals.
            </p>

            <div className="reset-visual" aria-hidden="true">
              <div className="reset-orbit reset-orbit-one" />
              <div className="reset-orbit reset-orbit-two" />
              <div className="reset-orbit reset-orbit-three" />

              <div className="reset-shield">
                <div className="reset-shield-inner">
                  <Icon name="lock" size={43} />
                </div>
                <span className="reset-shield-check">
                  <Icon name="check" size={15} />
                </span>
              </div>

              <div className="reset-floating-card reset-floating-top">
                <span className="reset-floating-icon">
                  <Icon name="shield" size={17} />
                </span>
                <span>
                  <strong>Protect your account</strong>
                  <small>Your security matters</small>
                </span>
              </div>

              <div className="reset-floating-card reset-floating-bottom">
                <span className="reset-floating-sparkle">
                  <Icon name="sparkle" size={17} />
                </span>
                <span>
                  <strong>Start fresh</strong>
                  <small>Your journey continues</small>
                </span>
              </div>
            </div>

            <div className="reset-security-note">
              <span>
                <Icon name="shield" size={16} />
              </span>
              <p>
                <strong>A little security goes a long way.</strong>
                <small>Use a password that is difficult to guess.</small>
              </p>
            </div>
          </div>

          <div className="reset-showcase-footer">
            <span>Secure your account.</span>
            <span className="reset-footer-dot" />
            <span>Return to learning.</span>
          </div>
        </section>

        <section className="reset-panel">
          <div className="reset-mobile-brand-wrap">
            <Link to="/" className="reset-brand">
              <span className="reset-brand-icon">
                <Icon name="layers" size={19} />
              </span>
              <span className="reset-brand-name">
                Syllabus<span>AI</span>
              </span>
            </Link>
          </div>

          {!token ? (
            <div className="reset-card reset-state-card">
              <div className="reset-state-icon reset-error-icon">
                <Icon name="alert" size={28} />
              </div>

              <div className="reset-card-eyebrow">
                <span className="reset-status-dot error-dot" />
                LINK NOT AVAILABLE
              </div>

              <h2>Invalid reset link</h2>

              <p className="reset-state-description">
                This link is missing its reset token. Request a new password
                reset link to continue securely.
              </p>

              <Link to="/forgot-password" className="reset-primary-link">
                <span>Request a new link</span>
                <Icon name="arrow" size={17} />
              </Link>

              <Link to="/login" className="reset-back-link">
                Back to sign in
              </Link>
            </div>
          ) : resetSuccess ? (
            <div className="reset-card reset-state-card success-state">
              <div className="reset-state-icon reset-success-icon">
                <Icon name="check" size={29} />
              </div>

              <div className="reset-card-eyebrow">
                <span className="reset-status-dot success-dot" />
                PASSWORD UPDATED
              </div>

              <h2>You’re all set.</h2>

              <p className="reset-state-description">
                Your password has been reset successfully. You can now sign
                in using your new password.
              </p>

              <div className="reset-success-message">
                <Icon name="shield" size={18} />
                <span>Your account is ready for you.</span>
              </div>

              <Link to="/login" className="reset-primary-link">
                <span>Continue to sign in</span>
                <Icon name="arrow" size={17} />
              </Link>

              <p className="reset-redirect-note">
                Redirecting to sign in shortly…
              </p>
            </div>
          ) : (
            <div className="reset-card">
              <div className="reset-card-eyebrow">
                <span className="reset-status-dot" />
                PASSWORD RECOVERY
              </div>

              <div className="reset-card-heading">
                <h2>Create a new password</h2>
                <p>
                  Choose a new password for your SyllabusAI account.
                </p>
              </div>

              <div className="reset-step-indicator">
                <span className="step-complete">
                  <Icon name="check" size={13} />
                </span>
                <span className="step-line" />
                <span className="step-current">02</span>
                <span className="step-label">NEW PASSWORD</span>
              </div>

              <form onSubmit={handleSubmit} className="reset-form">
                <div className="reset-field">
                  <label htmlFor="new-password" className="reset-label">
                    New password
                  </label>

                  <div className="reset-input-wrap">
                    <span className="reset-input-icon">
                      <Icon name="lock" size={17} />
                    </span>

                    <input
                      id="new-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      disabled={loading}
                      className="reset-input"
                    />

                    <button
                      type="button"
                      className="reset-password-toggle"
                      onClick={() => setShowPass((previous) => !previous)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      aria-pressed={showPass}
                      disabled={loading}
                    >
                      <Icon name={showPass ? 'eyeOff' : 'eye'} size={17} />
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="reset-password-strength">
                      <div
                        className="reset-strength-bars"
                        aria-label={`Password strength: ${strengthLabel}`}
                      >
                        {[1, 2, 3].map((level) => (
                          <span
                            key={level}
                            className={
                              level <= strength
                                ? `strength-active strength-${strength}`
                                : ''
                            }
                          />
                        ))}
                      </div>
                      <span className={`reset-strength-label strength-label-${strength}`}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}

                  <p className="reset-field-hint">
                    Use at least 6 characters.
                  </p>
                </div>

                <div className="reset-field">
                  <label htmlFor="confirm-password" className="reset-label">
                    Confirm new password
                  </label>

                  <div className="reset-input-wrap">
                    <span className="reset-input-icon">
                      <Icon name="lock" size={17} />
                    </span>

                    <input
                      id="confirm-password"
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Enter your password again"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      disabled={loading}
                      className="reset-input"
                      aria-invalid={
                        confirmPassword.length > 0 &&
                        password !== confirmPassword
                      }
                    />

                    {confirmPassword.length > 0 && password === confirmPassword && (
                      <span className="reset-confirm-check" aria-label="Passwords match">
                        <Icon name="check" size={16} />
                      </span>
                    )}
                  </div>

                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="reset-match-error">Passwords do not match.</p>
                  )}

                  {confirmPassword.length > 0 && password === confirmPassword && (
                    <p className="reset-match-success">Passwords match.</p>
                  )}
                </div>

                <div className="reset-password-tip">
                  <span className="reset-tip-icon">
                    <Icon name="shield" size={16} />
                  </span>
                  <span>
                    Avoid using a password you already use for another account.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !password ||
                    !confirmPassword ||
                    password.length < 6 ||
                    password !== confirmPassword
                  }
                  className="reset-submit"
                >
                  {loading ? (
                    <>
                      <span className="reset-spinner" />
                      <span>Updating password…</span>
                    </>
                  ) : (
                    <>
                      <span>Reset password</span>
                      <span className="reset-submit-arrow">
                        <Icon name="arrow" size={17} />
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="reset-divider">
                <span />
                <span>ACCOUNT SECURITY</span>
                <span />
              </div>

              <p className="reset-back-text">
                Remember your password?
                <Link to="/login">Sign in</Link>
              </p>
            </div>
          )}

          <div className="reset-bottom">
            <span className="reset-bottom-icon">
              <Icon name="lock" size={13} />
            </span>
            <span>Your learning journey is worth protecting.</span>
          </div>

          <p className="reset-copyright">
            © {new Date().getFullYear()} SyllabusAI
          </p>
        </section>
      </main>
    </div>
  );
}

const resetCSS = `
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

  .reset-page {
    --reset-bg: #090B12;
    --reset-text: #F2F4FC;
    --reset-muted: #9299AD;
    --reset-blue: #91A9FF;
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: center;
    justify-content: center;
    padding: 32px clamp(20px, 4.5vw, 66px);
    overflow: hidden;
    background: var(--reset-bg);
    color: var(--reset-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .reset-background {
    position: fixed;
    z-index: -1;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .reset-grid {
    position: absolute;
    inset: 0;
    opacity: .22;
    background-image:
      linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: linear-gradient(to bottom, #000, rgba(0,0,0,.65) 60%, transparent);
  }

  .reset-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(105px);
  }

  .reset-glow-blue {
    top: -280px;
    left: -180px;
    width: 610px;
    height: 610px;
    background: #4169E1;
    opacity: .13;
  }

  .reset-glow-purple {
    right: -230px;
    bottom: -270px;
    width: 620px;
    height: 620px;
    background: #7950D8;
    opacity: .1;
  }

  /* Layout */

  .reset-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(410px, .98fr);
    align-items: center;
    gap: clamp(35px, 5.5vw, 84px);
    width: 100%;
    max-width: 1160px;
    margin: auto;
    animation: resetEnter .55s ease both;
  }

  .reset-brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    width: fit-content;
    color: #F3F5FC;
    text-decoration: none;
  }

  .reset-brand-icon {
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

  .reset-brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -.9px;
  }

  .reset-brand-name span {
    color: #91A9FF;
  }

  .reset-mobile-brand-wrap {
    display: none;
  }

  /* Showcase */

  .reset-showcase {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    min-width: 0;
    padding: 12px 0 5px;
  }

  .reset-showcase-content {
    margin-top: auto;
    margin-bottom: auto;
    padding: 43px 0 35px;
  }

  .reset-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    color: #929DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.65px;
  }

  .reset-eyebrow > span {
    width: 23px;
    height: 1px;
    background: #91A9FF;
  }

  .reset-showcase-content > h1 {
    margin: 0;
    color: #F3F5FC;
    font-size: clamp(35px, 4.2vw, 50px);
    font-weight: 700;
    letter-spacing: -2.4px;
    line-height: 1.22;
  }

  .reset-showcase-content > h1 span {
    color: #9DB1FF;
  }

  .reset-showcase-content > p {
    max-width: 440px;
    margin: 19px 0 0;
    color: #949CB1;
    font-size: 13px;
    line-height: 1.95;
  }

  /* Security illustration */

  .reset-visual {
    position: relative;
    display: grid;
    width: 100%;
    max-width: 475px;
    height: 285px;
    margin-top: 18px;
    place-items: center;
    isolation: isolate;
  }

  .reset-orbit {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(145,169,255,.13);
    border-radius: 50%;
  }

  .reset-orbit-one {
    width: 265px;
    height: 265px;
    border-style: dashed;
    opacity: .68;
  }

  .reset-orbit-two {
    width: 195px;
    height: 195px;
    border-color: rgba(145,169,255,.19);
  }

  .reset-orbit-three {
    width: 138px;
    height: 138px;
    border-color: rgba(145,169,255,.24);
  }

  .reset-shield {
    position: relative;
    display: grid;
    width: 106px;
    height: 106px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.24);
    border-radius: 30px;
    background: linear-gradient(145deg, rgba(145,169,255,.13), rgba(145,169,255,.025));
    box-shadow: 0 20px 60px rgba(36,52,111,.2), inset 0 1px rgba(255,255,255,.06);
    transform: rotate(-7deg);
  }

  .reset-shield-inner {
    display: grid;
    width: 77px;
    height: 77px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.14);
    border-radius: 22px;
    background: rgba(10,13,24,.62);
    color: #B1C2FF;
  }

  .reset-shield-check {
    position: absolute;
    right: -7px;
    bottom: -6px;
    display: grid;
    width: 27px;
    height: 27px;
    place-items: center;
    border: 3px solid #090B12;
    border-radius: 50%;
    background: #6BD6B5;
    color: #0B1B18;
  }

  .reset-floating-card {
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

  .reset-floating-top {
    top: 25px;
    right: 0;
  }

  .reset-floating-bottom {
    bottom: 25px;
    left: 0;
  }

  .reset-floating-icon,
  .reset-floating-sparkle {
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 9px;
  }

  .reset-floating-icon {
    border: 1px solid rgba(100,215,181,.17);
    background: rgba(100,215,181,.09);
    color: #78DCC0;
  }

  .reset-floating-sparkle {
    border: 1px solid rgba(145,169,255,.17);
    background: rgba(145,169,255,.1);
    color: #ADBEFF;
  }

  .reset-floating-card > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .reset-floating-card strong {
    color: #E4E8F6;
    font-size: 10px;
    font-weight: 600;
  }

  .reset-floating-card small {
    color: #838CA3;
    font-size: 9px;
  }

  .reset-security-note {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 18px 0 0;
    border-top: 1px solid rgba(255,255,255,.07);
  }

  .reset-security-note > span {
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

  .reset-security-note p {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin: 0;
  }

  .reset-security-note strong {
    color: #D8DDEC;
    font-size: 10px;
    font-weight: 600;
  }

  .reset-security-note small {
    color: #7D869C;
    font-size: 9px;
    line-height: 1.6;
  }

  .reset-showcase-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    color: #727B91;
    font-size: 9px;
  }

  .reset-footer-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #68738C;
  }

  /* Main form */

  .reset-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 8px 0;
  }

  .reset-card {
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

  .reset-card-eyebrow {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 17px;
    color: #939DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.45px;
  }

  .reset-status-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #91A9FF;
    box-shadow: 0 0 9px rgba(145,169,255,.35);
  }

  .reset-status-dot.error-dot {
    background: #F18D95;
    box-shadow: 0 0 9px rgba(241,141,149,.25);
  }

  .reset-status-dot.success-dot {
    background: #72D8B8;
    box-shadow: 0 0 9px rgba(114,216,184,.3);
  }

  .reset-card-heading {
    margin-bottom: 22px;
  }

  .reset-card-heading h2,
  .reset-state-card h2 {
    margin: 0;
    color: #F2F4FC;
    font-size: clamp(23px, 2.5vw, 28px);
    font-weight: 700;
    letter-spacing: -1.05px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .reset-card-heading p,
  .reset-state-description {
    margin: 10px 0 0;
    color: #969EB3;
    font-size: 11px;
    line-height: 1.8;
  }

  /* Steps */

  .reset-step-indicator {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 24px;
  }

  .step-complete,
  .step-current {
    display: grid;
    width: 25px;
    height: 25px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 8px;
  }

  .step-complete {
    border: 1px solid rgba(114,216,184,.17);
    background: rgba(114,216,184,.08);
    color: #72D8B8;
  }

  .step-line {
    width: 29px;
    height: 1px;
    background: rgba(255,255,255,.12);
  }

  .step-current {
    border: 1px solid rgba(145,169,255,.2);
    background: rgba(145,169,255,.1);
    color: #B3C2FF;
    font-size: 9px;
    font-weight: 700;
  }

  .step-label {
    color: #8F9BB9;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.1px;
  }

  /* Inputs */

  .reset-form {
    display: flex;
    flex-direction: column;
    gap: 19px;
  }

  .reset-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .reset-label {
    display: block;
    margin-bottom: 8px;
    color: #C4CAD9;
    font-size: 11px;
    font-weight: 600;
  }

  .reset-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .reset-input-icon {
    position: absolute;
    left: 13px;
    display: grid;
    place-items: center;
    color: #768098;
    pointer-events: none;
    transition: color .2s ease;
  }

  .reset-input-wrap:focus-within .reset-input-icon {
    color: #A6B8FF;
  }

  .reset-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 47px;
    padding: 0 42px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 10px;
    outline: none;
    background: rgba(255,255,255,.027);
    color: #F1F3FC;
    font-size: 11px;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .reset-input::placeholder {
    color: #6D778F;
    opacity: 1;
  }

  .reset-input:hover:not(:disabled) {
    border-color: rgba(255,255,255,.15);
  }

  .reset-input:focus {
    border-color: rgba(145,169,255,.49);
    background: rgba(145,169,255,.035);
    box-shadow: 0 0 0 3px rgba(145,169,255,.065);
  }

  .reset-input:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .reset-input[aria-invalid="true"] {
    border-color: rgba(241,141,149,.5);
  }

  .reset-password-toggle {
    position: absolute;
    top: 50%;
    right: 8px;
    display: grid;
    width: 31px;
    height: 31px;
    place-items: center;
    transform: translateY(-50%);
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: #7E879E;
    cursor: pointer;
    transition: background .2s ease, color .2s ease;
  }

  .reset-password-toggle:hover:not(:disabled) {
    background: rgba(255,255,255,.055);
    color: #DEE3F2;
  }

  .reset-password-toggle:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .reset-confirm-check {
    position: absolute;
    right: 14px;
    display: grid;
    place-items: center;
    color: #72D8B8;
    pointer-events: none;
  }

  .reset-password-strength {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 10px;
  }

  .reset-strength-bars {
    display: flex;
    flex: 1;
    gap: 5px;
    min-width: 0;
  }

  .reset-strength-bars > span {
    display: block;
    flex: 1;
    height: 3px;
    border-radius: 6px;
    background: rgba(255,255,255,.09);
    transition: background .25s ease;
  }

  .reset-strength-bars .strength-active.strength-1 {
    background: #F18D95;
  }

  .reset-strength-bars .strength-active.strength-2 {
    background: #EAC078;
  }

  .reset-strength-bars .strength-active.strength-3 {
    background: #72D8B8;
  }

  .reset-strength-label {
    min-width: 35px;
    color: #929AAF;
    font-size: 9px;
    text-align: right;
  }

  .strength-label-1 { color: #F18D95; }
  .strength-label-2 { color: #EAC078; }
  .strength-label-3 { color: #72D8B8; }

  .reset-field-hint {
    margin: 7px 0 0;
    color: #6F788E;
    font-size: 9px;
    line-height: 1.6;
  }

  .reset-match-error {
    margin: 7px 0 0;
    color: #F18D95;
    font-size: 10px;
    line-height: 1.6;
  }

  .reset-match-success {
    margin: 7px 0 0;
    color: #72D8B8;
    font-size: 10px;
    line-height: 1.6;
  }

  /* Security note */

  .reset-password-tip {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 12px;
    border: 1px solid rgba(145,169,255,.1);
    border-radius: 10px;
    background: rgba(145,169,255,.04);
    color: #929BB0;
    font-size: 9px;
    line-height: 1.7;
  }

  .reset-tip-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #9EB2FF;
  }

  /* Submit */

  .reset-submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 47px;
    margin-top: 1px;
    padding: 0 11px 0 17px;
    border: 1px solid rgba(166,184,255,.3);
    border-radius: 10px;
    background: linear-gradient(135deg, #A0B3FF, #8198F4);
    color: #11172B;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease, background .2s ease;
  }

  .reset-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #B2C1FF, #91A5FF);
    box-shadow: 0 10px 28px rgba(102,128,235,.2);
  }

  .reset-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .reset-submit:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .reset-submit-arrow {
    display: grid;
    width: 27px;
    height: 27px;
    place-items: center;
    border: 1px solid rgba(17,23,43,.13);
    border-radius: 8px;
    background: rgba(17,23,43,.055);
  }

  .reset-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(17,23,43,.22);
    border-top-color: #11172B;
    border-radius: 50%;
    animation: resetSpin .8s linear infinite;
  }

  .reset-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0 18px;
    color: #626C83;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1.1px;
    white-space: nowrap;
  }

  .reset-divider > span:first-child,
  .reset-divider > span:last-child {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.07);
  }

  .reset-back-text {
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

  .reset-back-text a {
    color: #A8BAFF;
    font-weight: 600;
    text-decoration: none;
    transition: color .2s ease;
  }

  .reset-back-text a:hover {
    color: #DBE3FF;
  }

  /* Invalid and successful states */

  .reset-state-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: 34px;
    padding-bottom: 31px;
  }

  .reset-state-icon {
    display: grid;
    width: 58px;
    height: 58px;
    margin-bottom: 23px;
    place-items: center;
    border-radius: 17px;
  }

  .reset-error-icon {
    border: 1px solid rgba(241,141,149,.18);
    background: rgba(241,141,149,.08);
    color: #F1A0A7;
  }

  .reset-success-icon {
    border: 1px solid rgba(114,216,184,.2);
    background: rgba(114,216,184,.09);
    color: #72D8B8;
  }

  .reset-state-card .reset-card-eyebrow {
    margin-bottom: 15px;
  }

  .reset-state-card h2 {
    font-size: 27px;
  }

  .reset-state-description {
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.9;
  }

  .reset-primary-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 47px;
    margin-top: 25px;
    padding: 0 12px 0 16px;
    border: 1px solid rgba(166,184,255,.3);
    border-radius: 10px;
    background: linear-gradient(135deg, #A0B3FF, #8198F4);
    color: #11172B;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .reset-primary-link:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(102,128,235,.2);
  }

  .reset-primary-link > svg {
    flex-shrink: 0;
  }

  .reset-back-link {
    display: block;
    width: 100%;
    margin-top: 19px;
    color: #A8BAFF;
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
  }

  .reset-back-link:hover {
    color: #DBE3FF;
  }

  .reset-success-message {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 22px;
    padding: 13px;
    border: 1px solid rgba(114,216,184,.15);
    border-radius: 10px;
    background: rgba(114,216,184,.045);
    color: #A6DFCE;
    font-size: 10px;
    line-height: 1.6;
  }

  .reset-success-message svg {
    flex-shrink: 0;
    color: #72D8B8;
  }

  .reset-success-message + .reset-primary-link {
    margin-top: 16px;
  }

  .reset-redirect-note {
    width: 100%;
    margin: 13px 0 0;
    color: #727D94;
    font-size: 9px;
    text-align: center;
  }

  /* Footer */

  .reset-bottom {
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

  .reset-bottom-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #91A9FF;
  }

  .reset-copyright {
    margin: 13px 0 0;
    color: #555E74;
    font-size: 9px;
    text-align: center;
  }

  /* Accessibility */

  .reset-page button:focus-visible,
  .reset-page a:focus-visible {
    outline: 2px solid #A4B7FF;
    outline-offset: 3px;
  }

  @keyframes resetSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes resetEnter {
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
    .reset-page {
      padding: 27px;
    }

    .reset-layout {
      grid-template-columns: minmax(0, 1fr) minmax(370px, .96fr);
      gap: 32px;
    }

    .reset-showcase-content > h1 {
      font-size: clamp(33px, 4vw, 43px);
      letter-spacing: -1.9px;
    }

    .reset-visual {
      height: 245px;
    }

    .reset-orbit-one {
      width: 230px;
      height: 230px;
    }

    .reset-orbit-two {
      width: 176px;
      height: 176px;
    }

    .reset-card {
      padding-right: 25px;
      padding-left: 25px;
    }
  }

  /* Mobile */

  @media (max-width: 740px) {
    .reset-page {
      align-items: flex-start;
      padding: 25px 20px 28px;
      overflow-y: auto;
    }

    .reset-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      width: 100%;
      max-width: 460px;
      margin: auto;
    }

    .reset-showcase {
      display: none;
    }

    .reset-panel {
      width: 100%;
      padding: 0;
    }

    .reset-mobile-brand-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 0 0 23px;
    }

    .reset-mobile-brand {
      gap: 10px;
    }

    .reset-brand-icon {
      width: 37px;
      height: 37px;
    }

    .reset-brand-name {
      font-size: 18px;
    }

    .reset-card {
      padding: 29px clamp(20px, 6vw, 31px);
      border-radius: 17px;
    }

    .reset-card-heading h2 {
      font-size: 26px;
    }

    .reset-bottom {
      margin-top: 18px;
    }

    .reset-copyright {
      margin-top: 12px;
    }
  }

  @media (max-width: 400px) {
    .reset-page {
      padding: 20px 14px 24px;
    }

    .reset-mobile-brand-wrap {
      margin-bottom: 20px;
    }

    .reset-card {
      padding: 25px 18px;
      border-radius: 15px;
    }

    .reset-card-eyebrow {
      margin-bottom: 15px;
      font-size: 8px;
    }

    .reset-card-heading {
      margin-bottom: 20px;
    }

    .reset-card-heading h2 {
      font-size: 23px;
      letter-spacing: -.8px;
    }

    .reset-card-heading p {
      font-size: 10px;
    }

    .reset-form {
      gap: 17px;
    }

    .reset-input {
      height: 45px;
      font-size: 11px;
    }

    .reset-password-tip {
      padding: 10px;
    }

    .reset-divider {
      gap: 8px;
      margin-top: 20px;
      font-size: 7px;
    }

    .reset-bottom {
      font-size: 8px;
    }

    .reset-state-card h2 {
      font-size: 25px;
    }
  }
`;