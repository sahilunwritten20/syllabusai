import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import API from '../../services/api';
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
  };

  return <svg {...props}>{icons[name] || icons.sparkle}</svg>;
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  // Uses the existing API base URL to start Google OAuth.
  const handleGoogleLogin = () => {
    const baseURL = (API.defaults.baseURL || '/api').replace(/\/+$/, '');
    window.location.assign(`${baseURL}/auth/google`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        email: normalizedEmail,
        password,
      });

      if (result?.success) {
        toast.success('Welcome back!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{loginCSS}</style>

      <div className="login-background" aria-hidden="true">
        <div className="login-grid" />
        <div className="login-glow login-glow-blue" />
        <div className="login-glow login-glow-purple" />
        <div className="login-glow login-glow-bottom" />
      </div>

      <div className="login-layout">
        <section className="login-showcase">
          <Link to="/" className="login-brand">
            <span className="login-brand-icon">
              <Icon name="layers" size={20} />
            </span>
            <span className="login-brand-name">
              Syllabus<span>AI</span>
            </span>
          </Link>

          <div className="showcase-content">
            <div className="showcase-eyebrow">
              <span className="showcase-eyebrow-line" />
              YOUR LEARNING JOURNEY
            </div>

            <h1 className="showcase-heading">
              Learn with purpose.
              <br />
              <span>Grow with confidence.</span>
            </h1>

            <p className="showcase-description">
              A smarter space for understanding your syllabus, preparing for
              exams, building skills, and planning your future.
            </p>

            <div className="showcase-visual" aria-hidden="true">
              <div className="showcase-orbit orbit-large" />
              <div className="showcase-orbit orbit-medium" />
              <div className="showcase-orbit orbit-small" />

              <div className="showcase-core">
                <div className="showcase-core-inner">
                  <Icon name="layers" size={42} />
                </div>
              </div>

              <div className="showcase-floating-card floating-card-one">
                <span className="floating-card-check">
                  <Icon name="check" size={13} />
                </span>
                <span>
                  <strong>Stay on track</strong>
                  <small>Your progress, organized</small>
                </span>
              </div>

              <div className="showcase-floating-card floating-card-two">
                <span className="floating-card-sparkle">
                  <Icon name="sparkle" size={17} />
                </span>
                <span>
                  <strong>Learn smarter</strong>
                  <small>One topic at a time</small>
                </span>
              </div>

              <span className="visual-point visual-point-one" />
              <span className="visual-point visual-point-two" />
              <span className="visual-point visual-point-three" />
            </div>

            <div className="showcase-features">
              <div className="showcase-feature">
                <span className="feature-icon">
                  <Icon name="book" size={16} />
                </span>
                <span>
                  <strong>Understand</strong>
                  <small>Learn at your pace</small>
                </span>
              </div>

              <div className="showcase-feature">
                <span className="feature-icon">
                  <Icon name="check" size={16} />
                </span>
                <span>
                  <strong>Prepare</strong>
                  <small>Practice with purpose</small>
                </span>
              </div>

              <div className="showcase-feature">
                <span className="feature-icon">
                  <Icon name="arrow" size={16} />
                </span>
                <span>
                  <strong>Progress</strong>
                  <small>Move forward confidently</small>
                </span>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>Built around your learning journey.</span>
            <span className="showcase-footer-dot" />
            <span>Powered by AI</span>
          </div>
        </section>

        <main className="login-panel">
          <div className="mobile-brand-wrap">
            <Link to="/" className="login-brand mobile-brand">
              <span className="login-brand-icon">
                <Icon name="layers" size={19} />
              </span>
              <span className="login-brand-name">
                Syllabus<span>AI</span>
              </span>
            </Link>
          </div>

          <div className="login-card">
            <div className="login-card-topline">
              <span className="login-section-indicator" />
              WELCOME BACK
            </div>

            <div className="login-card-heading">
              <h2>Sign in to your account</h2>
              <p>Pick up where your learning journey left off.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="login-email" className="login-label">
                  Email address
                </label>

                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <Icon name="mail" size={17} />
                  </span>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@college.edu"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    disabled={loading}
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label htmlFor="login-password" className="login-label">
                    Password
                  </label>

                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot password?
                  </Link>
                </div>

                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <Icon name="lock" size={17} />
                  </span>

                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="login-input login-password-input"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPass((previous) => !previous)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    aria-pressed={showPass}
                    disabled={loading}
                  >
                    <Icon name={showPass ? 'eyeOff' : 'eye'} size={17} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="login-submit"
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <span className="login-submit-arrow">
                      <Icon name="arrow" size={17} />
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Google sign-in option restored. */}
            <div className="login-divider">
              <span />
              <span>OR CONTINUE WITH</span>
              <span />
            </div>

            <button
              type="button"
              className="login-google-button"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg
                className="login-google-icon"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#FBBC05"
                  d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.2H5.8a20 20 0 0 0 0 17.6l6.8-5.2Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 11.9c3 0 5.6 1 7.7 3l5.8-5.8C34 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.2c1.6-4.9 6.1-8.5 11.4-8.5Z"
                />
              </svg>

              <span>Continue with Google</span>

              <span className="login-google-arrow" aria-hidden="true">
                <Icon name="arrow" size={15} />
              </span>
            </button>

            <p className="login-switch">
              New to SyllabusAI?
              <Link to="/signup">
                Create an account <Icon name="arrow" size={14} />
              </Link>
            </p>
          </div>

          <div className="login-bottom">
            <span className="login-bottom-icon">
              <Icon name="lock" size={13} />
            </span>
            <span>Your learning journey starts with a single step.</span>
          </div>

          <p className="login-copyright">
            © {new Date().getFullYear()} SyllabusAI
          </p>
        </main>
      </div>
    </div>
  );
}

const loginCSS = `
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

  .login-page {
    --login-bg: #090B12;
    --login-text: #F2F4FC;
    --login-muted: #9199AE;
    --login-blue: #91A9FF;
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: center;
    justify-content: center;
    padding: 36px clamp(20px, 5vw, 72px);
    overflow: hidden;
    background: var(--login-bg);
    color: var(--login-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .login-background {
    position: fixed;
    z-index: -1;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .login-grid {
    position: absolute;
    inset: 0;
    opacity: .23;
    background-image:
      linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,.65) 55%, transparent 100%);
  }

  .login-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(105px);
  }

  .login-glow-blue {
    top: -260px;
    left: -130px;
    width: 600px;
    height: 600px;
    background: #4169E1;
    opacity: .13;
  }

  .login-glow-purple {
    right: -240px;
    bottom: -260px;
    width: 620px;
    height: 620px;
    background: #7950D8;
    opacity: .095;
  }

  .login-glow-bottom {
    right: 25%;
    bottom: -410px;
    width: 540px;
    height: 540px;
    background: #286AB9;
    opacity: .06;
  }

  /* Main layout */

  .login-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(390px, .95fr);
    align-items: center;
    gap: clamp(35px, 6vw, 100px);
    width: 100%;
    max-width: 1120px;
    margin: auto;
    animation: loginEnter .55s ease both;
  }

  /* Brand */

  .login-brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    width: fit-content;
    color: #F3F5FC;
    text-decoration: none;
  }

  .login-brand-icon {
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

  .login-brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -.9px;
  }

  .login-brand-name span {
    color: #91A9FF;
  }

  .mobile-brand-wrap {
    display: none;
  }

  /* Left showcase */

  .login-showcase {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    min-width: 0;
    padding: 13px 0 5px;
  }

  .showcase-content {
    margin-top: auto;
    margin-bottom: auto;
    padding: 46px 0 35px;
  }

  .showcase-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    color: #929DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.65px;
  }

  .showcase-eyebrow-line {
    width: 24px;
    height: 1px;
    background: #91A9FF;
  }

  .showcase-heading {
    margin: 0;
    color: #F3F5FC;
    font-size: clamp(35px, 4.2vw, 51px);
    font-weight: 700;
    letter-spacing: -2.5px;
    line-height: 1.22;
  }

  .showcase-heading > span {
    color: #9DB1FF;
  }

  .showcase-description {
    max-width: 440px;
    margin: 20px 0 0;
    color: #949CB1;
    font-size: 13px;
    line-height: 1.95;
  }

  /* Decorative learning graphic */

  .showcase-visual {
    position: relative;
    display: grid;
    width: 100%;
    max-width: 475px;
    height: 270px;
    margin-top: 23px;
    place-items: center;
    isolation: isolate;
  }

  .showcase-orbit {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(145,169,255,.13);
    border-radius: 50%;
  }

  .orbit-large {
    width: 260px;
    height: 260px;
    border-style: dashed;
    opacity: .7;
  }

  .orbit-medium {
    width: 196px;
    height: 196px;
    border-color: rgba(145,169,255,.19);
  }

  .orbit-small {
    width: 139px;
    height: 139px;
    border-color: rgba(145,169,255,.24);
  }

  .showcase-core {
    display: grid;
    width: 106px;
    height: 106px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.25);
    border-radius: 30px;
    background: linear-gradient(145deg, rgba(145,169,255,.13), rgba(145,169,255,.025));
    box-shadow: 0 20px 60px rgba(36,52,111,.2), inset 0 1px rgba(255,255,255,.06);
    transform: rotate(-7deg);
  }

  .showcase-core-inner {
    display: grid;
    width: 77px;
    height: 77px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.14);
    border-radius: 22px;
    background: rgba(10,13,24,.62);
    color: #B1C2FF;
  }

  .showcase-floating-card {
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

  .floating-card-one {
    top: 25px;
    right: 0;
  }

  .floating-card-two {
    bottom: 24px;
    left: 0;
  }

  .floating-card-check,
  .floating-card-sparkle {
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 9px;
  }

  .floating-card-check {
    border: 1px solid rgba(100,215,181,.17);
    background: rgba(100,215,181,.09);
    color: #78DCC0;
  }

  .floating-card-sparkle {
    border: 1px solid rgba(145,169,255,.17);
    background: rgba(145,169,255,.1);
    color: #ADBEFF;
  }

  .showcase-floating-card > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .showcase-floating-card strong {
    color: #E4E8F6;
    font-size: 10px;
    font-weight: 600;
  }

  .showcase-floating-card small {
    color: #838CA3;
    font-size: 9px;
  }

  .visual-point {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #A6B8FF;
    box-shadow: 0 0 12px rgba(145,169,255,.55);
  }

  .visual-point-one {
    top: 26px;
    left: 21%;
  }

  .visual-point-two {
    right: 19%;
    bottom: 36px;
  }

  .visual-point-three {
    top: 51%;
    left: 9%;
    width: 4px;
    height: 4px;
    opacity: .65;
  }

  .showcase-features {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
    padding-top: 22px;
    border-top: 1px solid rgba(255,255,255,.07);
  }

  .showcase-feature {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    min-width: 0;
  }

  .feature-icon {
    display: grid;
    width: 29px;
    height: 29px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 9px;
    background: rgba(255,255,255,.035);
    color: #A5B6F8;
  }

  .showcase-feature > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    padding-top: 2px;
  }

  .showcase-feature strong {
    color: #D8DDEC;
    font-size: 10px;
    font-weight: 600;
  }

  .showcase-feature small {
    color: #798198;
    font-size: 9px;
    line-height: 1.5;
  }

  .showcase-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    color: #727B91;
    font-size: 9px;
  }

  .showcase-footer-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #68738C;
  }

  /* Login panel */

  .login-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 12px 0;
  }

  .login-card {
    width: 100%;
    min-width: 0;
    padding: 34px clamp(22px, 3.2vw, 37px);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 20px;
    background: linear-gradient(150deg, rgba(20,24,37,.92), rgba(13,16,26,.95));
    box-shadow: 0 30px 100px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.025);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .login-card-topline {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 20px;
    color: #939DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.55px;
  }

  .login-section-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #91A9FF;
    box-shadow: 0 0 9px rgba(145,169,255,.35);
  }

  .login-card-heading {
    margin-bottom: 29px;
  }

  .login-card-heading h2 {
    margin: 0;
    color: #F2F4FC;
    font-size: clamp(23px, 2.5vw, 28px);
    font-weight: 700;
    letter-spacing: -1.05px;
    line-height: 1.35;
  }

  .login-card-heading p {
    margin: 10px 0 0;
    color: #969EB3;
    font-size: 11px;
    line-height: 1.7;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .login-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .login-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 9px;
  }

  .login-label {
    display: block;
    margin-bottom: 9px;
    color: #C4CAD9;
    font-size: 11px;
    font-weight: 600;
  }

  .login-label-row .login-label {
    margin-bottom: 0;
  }

  .forgot-password-link {
    color: #A6B8FF;
    font-size: 10px;
    font-weight: 500;
    text-decoration: none;
    transition: color .2s ease;
  }

  .forgot-password-link:hover {
    color: #D7E0FF;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .login-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .login-input-icon {
    position: absolute;
    left: 14px;
    display: grid;
    place-items: center;
    color: #768098;
    pointer-events: none;
    transition: color .2s ease;
  }

  .login-input-wrap:focus-within .login-input-icon {
    color: #A6B8FF;
  }

  .login-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 48px;
    padding: 0 13px 0 42px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 11px;
    outline: none;
    background: rgba(255,255,255,.027);
    color: #F1F3FC;
    font-size: 12px;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .login-input::placeholder {
    color: #6D778F;
    opacity: 1;
  }

  .login-input:hover:not(:disabled) {
    border-color: rgba(255,255,255,.15);
  }

  .login-input:focus {
    border-color: rgba(145,169,255,.49);
    background: rgba(145,169,255,.035);
    box-shadow: 0 0 0 3px rgba(145,169,255,.075);
  }

  .login-input:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .login-password-input {
    padding-right: 44px;
  }

  .password-toggle {
    position: absolute;
    top: 50%;
    right: 9px;
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    transform: translateY(-50%);
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: #7E879E;
    cursor: pointer;
    transition: color .2s ease, background .2s ease;
  }

  .password-toggle:hover:not(:disabled) {
    background: rgba(255,255,255,.055);
    color: #DEE3F2;
  }

  .password-toggle:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .login-submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 49px;
    margin-top: 4px;
    padding: 0 12px 0 18px;
    border: 1px solid rgba(166,184,255,.3);
    border-radius: 11px;
    background: linear-gradient(135deg, #A0B3FF, #8198F4);
    color: #11172B;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease, background .2s ease;
  }

  .login-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #B2C1FF, #91A5FF);
    box-shadow: 0 10px 28px rgba(102,128,235,.2);
  }

  .login-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-submit:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .login-submit-arrow {
    display: grid;
    width: 27px;
    height: 27px;
    place-items: center;
    border: 1px solid rgba(17,23,43,.13);
    border-radius: 8px;
    background: rgba(17,23,43,.055);
  }

  .login-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(17,23,43,.22);
    border-top-color: #11172B;
    border-radius: 50%;
    animation: loginSpin .8s linear infinite;
  }

  .login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 25px 0 15px;
    color: #626C83;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1.1px;
    white-space: nowrap;
  }

  .login-divider > span:first-child,
  .login-divider > span:last-child {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.07);
  }

  /* Google sign-in button */

  .login-google-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    width: 100%;
    min-height: 47px;
    padding: 0 42px;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: 11px;
    background: rgba(255,255,255,.035);
    color: #E4E8F3;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, transform .2s ease;
  }

  .login-google-button:hover:not(:disabled) {
    border-color: rgba(255,255,255,.19);
    background: rgba(255,255,255,.065);
    transform: translateY(-1px);
  }

  .login-google-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-google-button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .login-google-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }

  .login-google-arrow {
    position: absolute;
    right: 13px;
    display: grid;
    width: 25px;
    height: 25px;
    place-items: center;
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 7px;
    color: #77839B;
    transition: color .2s ease, border-color .2s ease;
  }

  .login-google-button:hover:not(:disabled) .login-google-arrow {
    border-color: rgba(255,255,255,.12);
    color: #D9E0F2;
  }

  .login-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
    margin: 19px 0 0;
    color: #8E97AC;
    font-size: 11px;
    line-height: 1.8;
    text-align: center;
  }

  .login-switch a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #A8BAFF;
    font-weight: 600;
    text-decoration: none;
    transition: color .2s ease;
  }

  .login-switch a:hover {
    color: #DBE3FF;
  }

  .login-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 22px;
    color: #7D869C;
    font-size: 9px;
    text-align: center;
    line-height: 1.6;
  }

  .login-bottom-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #91A9FF;
  }

  .login-copyright {
    margin: 15px 0 0;
    color: #555E74;
    font-size: 9px;
    text-align: center;
  }

  /* Accessibility */

  .login-page button:focus-visible,
  .login-page a:focus-visible {
    outline: 2px solid #A4B7FF;
    outline-offset: 3px;
  }

  @keyframes loginSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes loginEnter {
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

  @media (max-width: 950px) {
    .login-page {
      padding: 30px;
    }

    .login-layout {
      grid-template-columns: minmax(0, 1fr) minmax(350px, .95fr);
      gap: 35px;
    }

    .showcase-heading {
      font-size: clamp(34px, 4.8vw, 43px);
      letter-spacing: -1.9px;
    }

    .showcase-visual {
      height: 245px;
    }

    .orbit-large {
      width: 230px;
      height: 230px;
    }

    .orbit-medium {
      width: 176px;
      height: 176px;
    }

    .login-card {
      padding-right: 25px;
      padding-left: 25px;
    }

    .showcase-features {
      gap: 9px;
    }

    .showcase-feature {
      gap: 7px;
    }

    .feature-icon {
      width: 26px;
      height: 26px;
    }
  }

  /* Mobile */

  @media (max-width: 700px) {
    .login-page {
      align-items: flex-start;
      padding: 25px 20px 28px;
      overflow-y: auto;
    }

    .login-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      width: 100%;
      max-width: 440px;
      margin: auto;
    }

    .login-showcase {
      display: none;
    }

    .login-panel {
      width: 100%;
      padding: 0;
    }

    .mobile-brand-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 0 0 25px;
    }

    .mobile-brand {
      gap: 10px;
    }

    .login-brand-icon {
      width: 37px;
      height: 37px;
    }

    .login-brand-name {
      font-size: 18px;
    }

    .login-card {
      padding: 30px clamp(20px, 6vw, 31px);
      border-radius: 17px;
    }

    .login-card-heading h2 {
      font-size: 26px;
    }

    .login-bottom {
      margin-top: 20px;
    }

    .login-copyright {
      margin-top: 13px;
    }
  }

  @media (max-width: 400px) {
    .login-page {
      padding: 21px 14px 25px;
    }

    .mobile-brand-wrap {
      margin-bottom: 21px;
    }

    .login-card {
      padding: 25px 19px;
      border-radius: 15px;
    }

    .login-card-topline {
      margin-bottom: 17px;
      font-size: 8px;
    }

    .login-card-heading {
      margin-bottom: 24px;
    }

    .login-card-heading h2 {
      font-size: 23px;
      letter-spacing: -.8px;
    }

    .login-card-heading p {
      font-size: 10px;
    }

    .login-form {
      gap: 18px;
    }

    .login-input {
      height: 46px;
      font-size: 12px;
    }

    .login-submit {
      min-height: 47px;
    }

    .login-divider {
      margin: 22px 0 15px;
      font-size: 7px;
    }

    .login-google-button {
      min-height: 45px;
      font-size: 10px;
    }

    .login-bottom {
      font-size: 8px;
    }
  }
`;