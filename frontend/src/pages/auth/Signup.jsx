import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
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
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8M8 11h6" />
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
    graduation: (
      <>
        <path d="m2 10 10-5 10 5-10 5-10-5Z" />
        <path d="M6 12v5c3.5 3 8.5 3 12 0v-5" />
        <path d="M22 10v6" />
      </>
    ),
  };

  return <svg {...props}>{icons[name] || icons.sparkle}</svg>;
};

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    semester: '1',
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const strength =
    form.password.length === 0
      ? 0
      : form.password.length < 6
      ? 1
      : form.password.length < 10
      ? 2
      : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedForm = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      branch: form.branch.trim(),
    };

    if (!normalizedForm.name || !normalizedForm.email || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Your password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(normalizedForm);

      if (result?.success) {
        toast.success('Your account has been created!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result?.message || 'Signup failed. Please try again.');
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
    <div className="signup-page">
      <style>{signupCSS}</style>

      <div className="signup-background" aria-hidden="true">
        <div className="signup-grid" />
        <div className="signup-glow signup-glow-blue" />
        <div className="signup-glow signup-glow-green" />
        <div className="signup-glow signup-glow-bottom" />
      </div>

      <div className="signup-layout">
        <section className="signup-showcase">
          <Link to="/" className="signup-brand">
            <span className="signup-brand-icon">
              <Icon name="layers" size={20} />
            </span>
            <span className="signup-brand-name">
              Syllabus<span>AI</span>
            </span>
          </Link>

          <div className="signup-showcase-content">
            <div className="signup-eyebrow">
              <span />
              YOUR FUTURE, YOUR PACE
            </div>

            <h1>
              Make every
              <br />
              study session <span>count.</span>
            </h1>

            <p className="signup-showcase-description">
              Bring your syllabus, learning goals and career ambitions
              together in one intelligent learning space.
            </p>

            <div className="signup-illustration" aria-hidden="true">
              <div className="signup-orbit signup-orbit-large" />
              <div className="signup-orbit signup-orbit-medium" />
              <div className="signup-orbit signup-orbit-small" />

              <div className="signup-illustration-core">
                <div className="signup-core-inner">
                  <Icon name="graduation" size={43} />
                </div>
              </div>

              <div className="signup-floating-card signup-floating-one">
                <span className="signup-floating-icon">
                  <Icon name="check" size={14} />
                </span>
                <span>
                  <strong>Your progress</strong>
                  <small>Build better habits</small>
                </span>
              </div>

              <div className="signup-floating-card signup-floating-two">
                <span className="signup-floating-sparkle">
                  <Icon name="sparkle" size={17} />
                </span>
                <span>
                  <strong>AI-powered learning</strong>
                  <small>Learn with clarity</small>
                </span>
              </div>

              <span className="signup-visual-dot signup-dot-one" />
              <span className="signup-visual-dot signup-dot-two" />
              <span className="signup-visual-dot signup-dot-three" />
            </div>

            <div className="signup-benefits">
              <div className="signup-benefit">
                <span className="signup-benefit-icon">
                  <Icon name="book" size={16} />
                </span>
                <span>
                  <strong>Learn</strong>
                  <small>Understand concepts</small>
                </span>
              </div>

              <div className="signup-benefit">
                <span className="signup-benefit-icon">
                  <Icon name="check" size={16} />
                </span>
                <span>
                  <strong>Practice</strong>
                  <small>Prepare with purpose</small>
                </span>
              </div>

              <div className="signup-benefit">
                <span className="signup-benefit-icon">
                  <Icon name="arrow" size={16} />
                </span>
                <span>
                  <strong>Progress</strong>
                  <small>Reach your next goal</small>
                </span>
              </div>
            </div>
          </div>

          <div className="signup-showcase-footer">
            <span>Start where you are.</span>
            <span className="signup-footer-dot" />
            <span>Grow from there.</span>
          </div>
        </section>

        <main className="signup-panel">
          <div className="signup-mobile-brand-wrap">
            <Link to="/" className="signup-brand signup-mobile-brand">
              <span className="signup-brand-icon">
                <Icon name="layers" size={19} />
              </span>
              <span className="signup-brand-name">
                Syllabus<span>AI</span>
              </span>
            </Link>
          </div>

          <div className="signup-card">
            <div className="signup-card-topline">
              <span className="signup-heading-dot" />
              GET STARTED
            </div>

            <div className="signup-card-heading">
              <h2>Create your account</h2>
              <p>A smarter learning experience starts right here.</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-field">
                <label htmlFor="signup-name" className="signup-label">
                  Full name <span>*</span>
                </label>

                <div className="signup-input-wrap">
                  <span className="signup-input-icon">
                    <Icon name="user" size={17} />
                  </span>

                  <input
                    id="signup-name"
                    type="text"
                    value={form.name}
                    onChange={updateField('name')}
                    placeholder="Your full name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={loading}
                    className="signup-input"
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="signup-email" className="signup-label">
                  Email address <span>*</span>
                </label>

                <div className="signup-input-wrap">
                  <span className="signup-input-icon">
                    <Icon name="mail" size={17} />
                  </span>

                  <input
                    id="signup-email"
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="you@college.edu"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    required
                    disabled={loading}
                    className="signup-input"
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="signup-password" className="signup-label">
                  Create password <span>*</span>
                </label>

                <div className="signup-input-wrap">
                  <span className="signup-input-icon">
                    <Icon name="lock" size={17} />
                  </span>

                  <input
                    id="signup-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={loading}
                    className="signup-input signup-password-input"
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPass((previous) => !previous)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    aria-pressed={showPass}
                    disabled={loading}
                  >
                    <Icon name={showPass ? 'eyeOff' : 'eye'} size={17} />
                  </button>
                </div>

                {form.password.length > 0 && (
                  <div className="password-strength">
                    <div
                      className="password-strength-bars"
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

                    <span className={`strength-label strength-label-${strength}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                <p className="signup-field-hint">
                  Use 6 or more characters for your password.
                </p>
              </div>

              <div className="signup-academic-grid">
                <div className="signup-field">
                  <label htmlFor="signup-branch" className="signup-label">
                    Branch <span className="optional-label">OPTIONAL</span>
                  </label>

                  <div className="signup-input-wrap">
                    <span className="signup-input-icon">
                      <Icon name="book" size={17} />
                    </span>

                    <input
                      id="signup-branch"
                      type="text"
                      value={form.branch}
                      onChange={updateField('branch')}
                      placeholder="Computer Science"
                      autoComplete="off"
                      maxLength={100}
                      disabled={loading}
                      className="signup-input"
                    />
                  </div>
                </div>

                <div className="signup-field signup-semester-field">
                  <label htmlFor="signup-semester" className="signup-label">
                    Semester
                  </label>

                  <div className="signup-select-wrap">
                    <select
                      id="signup-semester"
                      value={form.semester}
                      onChange={updateField('semester')}
                      disabled={loading}
                      className="signup-input signup-select"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                        <option key={semester} value={String(semester)}>
                          Semester {semester}
                        </option>
                      ))}
                    </select>

                    <span className="signup-select-chevron" aria-hidden="true">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !form.name.trim() || !form.email.trim() || !form.password}
                className="signup-submit"
              >
                {loading ? (
                  <>
                    <span className="signup-spinner" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <span className="signup-submit-arrow">
                      <Icon name="arrow" size={17} />
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="signup-divider">
              <span />
              <span>YOUR LEARNING JOURNEY</span>
              <span />
            </div>

            <p className="signup-switch">
              Already have an account?
              <Link to="/login">
                Sign in
                <Icon name="arrow" size={14} />
              </Link>
            </p>
          </div>

          <div className="signup-bottom">
            <span className="signup-bottom-icon">
              <Icon name="lock" size={13} />
            </span>
            <span>Free to get started · Built for your learning journey</span>
          </div>

          <p className="signup-copyright">
            © {new Date().getFullYear()} SyllabusAI
          </p>
        </main>
      </div>
    </div>
  );
}

const signupCSS = `
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
  input,
  select {
    font: inherit;
  }

  .signup-page {
    --signup-bg: #090B12;
    --signup-text: #F2F4FC;
    --signup-muted: #9299AD;
    --signup-blue: #91A9FF;
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: center;
    justify-content: center;
    padding: 32px clamp(20px, 4.5vw, 66px);
    overflow: hidden;
    background: var(--signup-bg);
    color: var(--signup-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .signup-background {
    position: fixed;
    z-index: -1;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .signup-grid {
    position: absolute;
    inset: 0;
    opacity: .22;
    background-image:
      linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: linear-gradient(to bottom, #000, rgba(0,0,0,.65) 60%, transparent);
  }

  .signup-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(105px);
  }

  .signup-glow-blue {
    top: -280px;
    right: -160px;
    width: 610px;
    height: 610px;
    background: #4169E1;
    opacity: .13;
  }

  .signup-glow-green {
    bottom: -240px;
    left: -230px;
    width: 590px;
    height: 590px;
    background: #1E957E;
    opacity: .105;
  }

  .signup-glow-bottom {
    right: 28%;
    bottom: -450px;
    width: 580px;
    height: 580px;
    background: #3159C7;
    opacity: .05;
  }

  /* Main layout */

  .signup-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(420px, .98fr);
    align-items: center;
    gap: clamp(35px, 5.5vw, 84px);
    width: 100%;
    max-width: 1160px;
    margin: auto;
    animation: signupEnter .55s ease both;
  }

  /* Branding */

  .signup-brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    width: fit-content;
    color: #F3F5FC;
    text-decoration: none;
  }

  .signup-brand-icon {
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

  .signup-brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -.9px;
  }

  .signup-brand-name span {
    color: #91A9FF;
  }

  .signup-mobile-brand-wrap {
    display: none;
  }

  /* Showcase panel */

  .signup-showcase {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    min-width: 0;
    padding: 12px 0 5px;
  }

  .signup-showcase-content {
    margin-top: auto;
    margin-bottom: auto;
    padding: 38px 0 33px;
  }

  .signup-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    color: #929DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.65px;
  }

  .signup-eyebrow > span {
    width: 23px;
    height: 1px;
    background: #91A9FF;
  }

  .signup-showcase-content > h1 {
    margin: 0;
    color: #F3F5FC;
    font-size: clamp(35px, 4.1vw, 50px);
    font-weight: 700;
    letter-spacing: -2.4px;
    line-height: 1.22;
  }

  .signup-showcase-content > h1 span {
    color: #9DB1FF;
  }

  .signup-showcase-description {
    max-width: 440px;
    margin: 19px 0 0;
    color: #949CB1;
    font-size: 13px;
    line-height: 1.95;
  }

  /* Illustration */

  .signup-illustration {
    position: relative;
    display: grid;
    width: 100%;
    max-width: 475px;
    height: 270px;
    margin-top: 19px;
    place-items: center;
    isolation: isolate;
  }

  .signup-orbit {
    position: absolute;
    z-index: -1;
    border: 1px solid rgba(145,169,255,.13);
    border-radius: 50%;
  }

  .signup-orbit-large {
    width: 260px;
    height: 260px;
    border-style: dashed;
    opacity: .7;
  }

  .signup-orbit-medium {
    width: 196px;
    height: 196px;
    border-color: rgba(145,169,255,.19);
  }

  .signup-orbit-small {
    width: 139px;
    height: 139px;
    border-color: rgba(145,169,255,.24);
  }

  .signup-illustration-core {
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

  .signup-core-inner {
    display: grid;
    width: 77px;
    height: 77px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.14);
    border-radius: 22px;
    background: rgba(10,13,24,.62);
    color: #B1C2FF;
  }

  .signup-floating-card {
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

  .signup-floating-one {
    top: 25px;
    right: 0;
  }

  .signup-floating-two {
    bottom: 24px;
    left: 0;
  }

  .signup-floating-icon,
  .signup-floating-sparkle {
    display: grid;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 9px;
  }

  .signup-floating-icon {
    border: 1px solid rgba(100,215,181,.17);
    background: rgba(100,215,181,.09);
    color: #78DCC0;
  }

  .signup-floating-sparkle {
    border: 1px solid rgba(145,169,255,.17);
    background: rgba(145,169,255,.1);
    color: #ADBEFF;
  }

  .signup-floating-card > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .signup-floating-card strong {
    color: #E4E8F6;
    font-size: 10px;
    font-weight: 600;
  }

  .signup-floating-card small {
    color: #838CA3;
    font-size: 9px;
  }

  .signup-visual-dot {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #A6B8FF;
    box-shadow: 0 0 12px rgba(145,169,255,.55);
  }

  .signup-dot-one {
    top: 26px;
    left: 21%;
  }

  .signup-dot-two {
    right: 19%;
    bottom: 36px;
  }

  .signup-dot-three {
    top: 51%;
    left: 9%;
    width: 4px;
    height: 4px;
    opacity: .65;
  }

  .signup-benefits {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
    padding-top: 22px;
    border-top: 1px solid rgba(255,255,255,.07);
  }

  .signup-benefit {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .signup-benefit-icon {
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

  .signup-benefit > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    padding-top: 2px;
  }

  .signup-benefit strong {
    color: #D8DDEC;
    font-size: 10px;
    font-weight: 600;
  }

  .signup-benefit small {
    color: #798198;
    font-size: 9px;
    line-height: 1.5;
  }

  .signup-showcase-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    color: #727B91;
    font-size: 9px;
  }

  .signup-footer-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #68738C;
  }

  /* Form panel */

  .signup-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 8px 0;
  }

  .signup-card {
    width: 100%;
    min-width: 0;
    padding: 30px clamp(22px, 3vw, 35px);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 20px;
    background: linear-gradient(150deg, rgba(20,24,37,.94), rgba(13,16,26,.96));
    box-shadow: 0 30px 100px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.025);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .signup-card-topline {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 17px;
    color: #939DBB;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.55px;
  }

  .signup-heading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #91A9FF;
    box-shadow: 0 0 9px rgba(145,169,255,.35);
  }

  .signup-card-heading {
    margin-bottom: 23px;
  }

  .signup-card-heading h2 {
    margin: 0;
    color: #F2F4FC;
    font-size: clamp(23px, 2.5vw, 28px);
    font-weight: 700;
    letter-spacing: -1.05px;
    line-height: 1.35;
  }

  .signup-card-heading p {
    margin: 9px 0 0;
    color: #969EB3;
    font-size: 11px;
    line-height: 1.7;
  }

  .signup-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .signup-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .signup-label {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
    color: #C4CAD9;
    font-size: 11px;
    font-weight: 600;
  }

  .signup-label > span:first-child:not(.optional-label) {
    color: #A5B7FF;
  }

  .signup-label .optional-label {
    margin-left: auto;
    color: #69738A;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: .6px;
  }

  .signup-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .signup-input-icon {
    position: absolute;
    left: 13px;
    display: grid;
    place-items: center;
    color: #768098;
    pointer-events: none;
    transition: color .2s ease;
  }

  .signup-input-wrap:focus-within .signup-input-icon {
    color: #A6B8FF;
  }

  .signup-input {
    display: block;
    width: 100%;
    min-width: 0;
    height: 45px;
    padding: 0 13px 0 40px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 10px;
    outline: none;
    background: rgba(255,255,255,.027);
    color: #F1F3FC;
    font-size: 11px;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .signup-input::placeholder {
    color: #6D778F;
    opacity: 1;
  }

  .signup-input:hover:not(:disabled) {
    border-color: rgba(255,255,255,.15);
  }

  .signup-input:focus {
    border-color: rgba(145,169,255,.49);
    background: rgba(145,169,255,.035);
    box-shadow: 0 0 0 3px rgba(145,169,255,.065);
  }

  .signup-input:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .signup-password-input {
    padding-right: 43px;
  }

  .signup-password-toggle {
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

  .signup-password-toggle:hover:not(:disabled) {
    background: rgba(255,255,255,.055);
    color: #DEE3F2;
  }

  .signup-password-toggle:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 9px;
  }

  .password-strength-bars {
    display: flex;
    flex: 1;
    gap: 5px;
    min-width: 0;
  }

  .password-strength-bars span {
    display: block;
    flex: 1;
    height: 3px;
    border-radius: 6px;
    background: rgba(255,255,255,.09);
    transition: background .25s ease;
  }

  .password-strength-bars .strength-active.strength-1 {
    background: #F18D95;
  }

  .password-strength-bars .strength-active.strength-2 {
    background: #EAC078;
  }

  .password-strength-bars .strength-active.strength-3 {
    background: #72D8B8;
  }

  .strength-label {
    min-width: 35px;
    color: #929AAF;
    font-size: 9px;
    text-align: right;
  }

  .strength-label-1 {
    color: #F18D95;
  }

  .strength-label-2 {
    color: #EAC078;
  }

  .strength-label-3 {
    color: #72D8B8;
  }

  .signup-field-hint {
    margin: 7px 0 0;
    color: #6F788E;
    font-size: 9px;
    line-height: 1.6;
  }

  /* Academic details */

  .signup-academic-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(125px, .8fr);
    gap: 12px;
    align-items: end;
  }

  .signup-select-wrap {
    position: relative;
    min-width: 0;
  }

  .signup-select {
    padding-right: 29px;
    padding-left: 12px;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .signup-select option {
    background: #111624;
    color: #F2F4FC;
  }

  .signup-select-chevron {
    position: absolute;
    top: 50%;
    right: 9px;
    display: grid;
    place-items: center;
    transform: translateY(-50%);
    color: #8A94AD;
    pointer-events: none;
  }

  /* Submit and links */

  .signup-submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 47px;
    margin-top: 3px;
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

  .signup-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #B2C1FF, #91A5FF);
    box-shadow: 0 10px 28px rgba(102,128,235,.2);
  }

  .signup-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .signup-submit:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .signup-submit-arrow {
    display: grid;
    width: 27px;
    height: 27px;
    place-items: center;
    border: 1px solid rgba(17,23,43,.13);
    border-radius: 8px;
    background: rgba(17,23,43,.055);
  }

  .signup-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(17,23,43,.22);
    border-top-color: #11172B;
    border-radius: 50%;
    animation: signupSpin .8s linear infinite;
  }

  .signup-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 21px 0 17px;
    color: #626C83;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1.05px;
    white-space: nowrap;
  }

  .signup-divider > span:first-child,
  .signup-divider > span:last-child {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.07);
  }

  .signup-switch {
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

  .signup-switch a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #A8BAFF;
    font-weight: 600;
    text-decoration: none;
    transition: color .2s ease;
  }

  .signup-switch a:hover {
    color: #DBE3FF;
  }

  .signup-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 17px;
    color: #7D869C;
    font-size: 9px;
    text-align: center;
    line-height: 1.6;
  }

  .signup-bottom-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    color: #91A9FF;
  }

  .signup-copyright {
    margin: 12px 0 0;
    color: #555E74;
    font-size: 9px;
    text-align: center;
  }

  /* Accessibility */

  .signup-page button:focus-visible,
  .signup-page a:focus-visible {
    outline: 2px solid #A4B7FF;
    outline-offset: 3px;
  }

  @keyframes signupSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes signupEnter {
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
    .signup-page {
      padding: 27px;
    }

    .signup-layout {
      grid-template-columns: minmax(0, 1fr) minmax(370px, .96fr);
      gap: 32px;
    }

    .signup-showcase-content > h1 {
      font-size: clamp(33px, 4vw, 43px);
      letter-spacing: -1.9px;
    }

    .signup-illustration {
      height: 235px;
    }

    .signup-orbit-large {
      width: 230px;
      height: 230px;
    }

    .signup-orbit-medium {
      width: 176px;
      height: 176px;
    }

    .signup-card {
      padding-right: 25px;
      padding-left: 25px;
    }

    .signup-benefits {
      gap: 8px;
    }

    .signup-benefit {
      gap: 6px;
    }

    .signup-benefit-icon {
      width: 26px;
      height: 26px;
    }
  }

  /* Mobile */

  @media (max-width: 740px) {
    .signup-page {
      align-items: flex-start;
      padding: 25px 20px 28px;
      overflow-y: auto;
    }

    .signup-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      width: 100%;
      max-width: 460px;
      margin: auto;
    }

    .signup-showcase {
      display: none;
    }

    .signup-panel {
      width: 100%;
      padding: 0;
    }

    .signup-mobile-brand-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 0 0 23px;
    }

    .signup-mobile-brand {
      gap: 10px;
    }

    .signup-brand-icon {
      width: 37px;
      height: 37px;
    }

    .signup-brand-name {
      font-size: 18px;
    }

    .signup-card {
      padding: 28px clamp(20px, 6vw, 31px);
      border-radius: 17px;
    }

    .signup-card-heading h2 {
      font-size: 26px;
    }

    .signup-bottom {
      margin-top: 18px;
    }

    .signup-copyright {
      margin-top: 12px;
    }
  }

  /* Small mobile */

  @media (max-width: 400px) {
    .signup-page {
      padding: 19px 13px 24px;
    }

    .signup-mobile-brand-wrap {
      margin-bottom: 19px;
    }

    .signup-card {
      padding: 24px 17px;
      border-radius: 15px;
    }

    .signup-card-topline {
      margin-bottom: 15px;
      font-size: 8px;
    }

    .signup-card-heading {
      margin-bottom: 21px;
    }

    .signup-card-heading h2 {
      font-size: 23px;
      letter-spacing: -.8px;
    }

    .signup-card-heading p {
      font-size: 10px;
    }

    .signup-form {
      gap: 15px;
    }

    .signup-label {
      font-size: 10px;
    }

    .signup-input {
      height: 44px;
      font-size: 11px;
    }

    .signup-academic-grid {
      grid-template-columns: minmax(0, 1fr) 115px;
      gap: 9px;
    }

    .signup-select {
      padding-left: 9px;
      font-size: 10px;
    }

    .signup-divider {
      gap: 8px;
      font-size: 7px;
    }

    .signup-bottom {
      font-size: 8px;
    }
  }

  @media (max-width: 340px) {
    .signup-academic-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 15px;
    }

    .signup-select {
      font-size: 11px;
    }
  }
`;