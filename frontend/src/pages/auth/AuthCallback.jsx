import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const error = params.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (!token || !userStr) {
      toast.error('Invalid login response. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userStr);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      window.location.href = '/dashboard';
    } catch {
      toast.error('Unable to complete Google login.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <main className="auth-callback">
        <div className="callback-grid" aria-hidden="true" />

        <div className="callback-glow callback-glow-one" aria-hidden="true" />
        <div className="callback-glow callback-glow-two" aria-hidden="true" />

        <section className="callback-card" aria-live="polite">
          <div className="callback-brand">
            <div className="callback-brand-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5h-13C4.67 20 4 19.33 4 18.5v-13Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 15.5V8.5l8 7v-7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className="callback-brand-name">SyllabusAI</span>
          </div>

          <div className="callback-status">
            <div className="callback-animation" aria-hidden="true">
              <div className="callback-orbit callback-orbit-one" />
              <div className="callback-orbit callback-orbit-two" />

              <div className="callback-google">
                <svg
                  width="32"
                  height="32"
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
              </div>
            </div>

            <div className="callback-progress">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="callback-copy">
            <span className="callback-eyebrow">
              <span className="callback-live-dot" />
              SECURE AUTHENTICATION
            </span>

            <h1>Almost there.</h1>

            <p>
              We're securely verifying your Google account and preparing your
              workspace.
            </p>
          </div>

          <div className="callback-steps">
            <div className="callback-step callback-step-complete">
              <div className="callback-step-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>Google sign-in initiated</span>
              <span className="callback-step-state">Done</span>
            </div>

            <div className="callback-step callback-step-active">
              <div className="callback-step-icon">
                <span className="callback-mini-spinner" />
              </div>
              <span>Verifying your account</span>
              <span className="callback-step-state">In progress</span>
            </div>

            <div className="callback-step">
              <div className="callback-step-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8v4l2.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </div>
              <span>Opening your dashboard</span>
              <span className="callback-step-state">Next</span>
            </div>
          </div>

          <div className="callback-footer">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 10V7a4 4 0 1 1 8 0v3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>Your connection is encrypted and secure</span>
          </div>
        </section>

        <div className="callback-bottom-note">
          <span>SYLLABUSAI</span>
          <span className="callback-bottom-separator">/</span>
          <span>YOUR LEARNING SPACE</span>
        </div>
      </main>

      <style>{`
        .auth-callback {
          --callback-bg: #080b12;
          --callback-surface: rgba(15, 20, 32, 0.88);
          --callback-border: rgba(255, 255, 255, 0.085);
          --callback-text: #f1f5fd;
          --callback-muted: #8a94a8;
          --callback-accent: #9caeff;
          --callback-accent-bright: #c1ccff;

          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 42px 22px 74px;
          overflow: hidden;
          background: var(--callback-bg);
          color: var(--callback-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .auth-callback *,
        .auth-callback *::before,
        .auth-callback *::after {
          box-sizing: border-box;
        }

        .callback-grid {
          position: absolute;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          opacity: 0.38;
          background-image:
            linear-gradient(rgba(160, 177, 214, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160, 177, 214, 0.04) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(
            to bottom,
            transparent 1%,
            black 24%,
            black 74%,
            transparent 100%
          );
        }

        .callback-glow {
          position: absolute;
          z-index: -2;
          width: 440px;
          height: 440px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(105px);
          opacity: 0.15;
        }

        .callback-glow-one {
          top: -250px;
          left: calc(50% - 330px);
          background: #536ff4;
        }

        .callback-glow-two {
          right: calc(50% - 460px);
          bottom: -320px;
          background: #6b5eea;
          opacity: 0.12;
        }

        .callback-card {
          position: relative;
          width: 100%;
          max-width: 438px;
          padding: 34px 35px 25px;
          overflow: hidden;
          border: 1px solid var(--callback-border);
          border-radius: 25px;
          background:
            radial-gradient(
              ellipse at 50% -20%,
              rgba(99, 123, 220, 0.10),
              transparent 65%
            ),
            var(--callback-surface);
          box-shadow:
            0 28px 100px rgba(0, 0, 0, 0.36),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          animation: callback-card-enter 650ms cubic-bezier(.2, .8, .2, 1)
            both;
        }

        .callback-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .callback-brand-icon {
          display: grid;
          width: 36px;
          height: 36px;
          place-items: center;
          border: 1px solid rgba(166, 183, 255, 0.25);
          border-radius: 11px;
          background: linear-gradient(
            145deg,
            rgba(120, 147, 255, 0.19),
            rgba(107, 119, 204, 0.06)
          );
          color: var(--callback-accent-bright);
        }

        .callback-brand-name {
          color: #f2f4fc;
          font-size: 17px;
          font-weight: 680;
          letter-spacing: -0.65px;
        }

        .callback-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 33px;
        }

        .callback-animation {
          position: relative;
          display: grid;
          width: 112px;
          height: 112px;
          place-items: center;
        }

        .callback-orbit {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(147, 166, 255, 0.16);
          border-radius: 50%;
        }

        .callback-orbit-one {
          animation: callback-orbit-spin 9s linear infinite;
        }

        .callback-orbit-one::before {
          position: absolute;
          top: 11px;
          left: 15px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b4c3ff;
          box-shadow: 0 0 15px rgba(147, 166, 255, 0.8);
          content: "";
        }

        .callback-orbit-two {
          inset: 11px;
          border-style: dashed;
          border-color: rgba(147, 166, 255, 0.2);
          animation: callback-orbit-spin 14s linear infinite reverse;
        }

        .callback-google {
          display: grid;
          width: 70px;
          height: 70px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.085),
            rgba(255, 255, 255, 0.025)
          );
          box-shadow:
            0 10px 35px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.07);
          animation: callback-google-float 3s ease-in-out infinite;
        }

        .callback-progress {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 17px;
        }

        .callback-progress span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #9baeff;
          animation: callback-dot 1.3s ease-in-out infinite;
        }

        .callback-progress span:nth-child(2) {
          animation-delay: 150ms;
        }

        .callback-progress span:nth-child(3) {
          animation-delay: 300ms;
        }

        .callback-copy {
          margin-top: 19px;
          text-align: center;
        }

        .callback-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #a9b8fb;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.65px;
        }

        .callback-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8ea6ff;
          box-shadow: 0 0 10px rgba(142, 166, 255, 0.65);
          animation: callback-live 2s ease-in-out infinite;
        }

        .callback-copy h1 {
          margin: 13px 0 9px;
          color: var(--callback-text);
          font-size: clamp(28px, 6vw, 33px);
          font-weight: 650;
          letter-spacing: -1.55px;
          line-height: 1.2;
        }

        .callback-copy p {
          max-width: 310px;
          margin: 0 auto;
          color: var(--callback-muted);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.8;
        }

        .callback-steps {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 29px;
          padding: 11px 14px;
          border: 1px solid rgba(255, 255, 255, 0.055);
          border-radius: 15px;
          background: rgba(5, 8, 15, 0.29);
        }

        .callback-step {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 39px;
          color: #788298;
          font-size: 11.5px;
        }

        .callback-step-icon {
          display: grid;
          flex: 0 0 23px;
          width: 23px;
          height: 23px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.075);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.025);
          color: #667187;
        }

        .callback-step-complete {
          color: #a5b0c2;
        }

        .callback-step-complete .callback-step-icon {
          border-color: rgba(106, 205, 164, 0.17);
          background: rgba(106, 205, 164, 0.07);
          color: #7bd8ad;
        }

        .callback-step-active {
          color: #e2e7f4;
        }

        .callback-step-active .callback-step-icon {
          border-color: rgba(147, 166, 255, 0.2);
          background: rgba(147, 166, 255, 0.08);
          color: #adbbff;
        }

        .callback-step-state {
          margin-left: auto;
          color: #5e687c;
          font-size: 10px;
          white-space: nowrap;
        }

        .callback-step-active .callback-step-state {
          color: #a8b7fb;
        }

        .callback-mini-spinner {
          width: 11px;
          height: 11px;
          border: 1.5px solid rgba(173, 187, 255, 0.23);
          border-top-color: #b0beff;
          border-radius: 50%;
          animation: callback-orbit-spin 800ms linear infinite;
        }

        .callback-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 23px;
          color: #636e82;
          font-size: 10px;
          letter-spacing: 0.05px;
        }

        .callback-footer svg {
          flex-shrink: 0;
          color: #7f8ba1;
        }

        .callback-bottom-note {
          position: absolute;
          right: 18px;
          bottom: 24px;
          left: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #444d60;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.6px;
        }

        .callback-bottom-separator {
          color: #717d9d;
        }

        @keyframes callback-card-enter {
          from {
            opacity: 0;
            transform: translateY(13px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes callback-orbit-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes callback-google-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes callback-dot {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        @keyframes callback-live {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.45;
          }
        }

        @media (max-width: 480px) {
          .auth-callback {
            padding: 26px 16px 64px;
          }

          .callback-card {
            max-width: 390px;
            padding: 29px 22px 23px;
            border-radius: 21px;
          }

          .callback-status {
            margin-top: 28px;
          }

          .callback-animation {
            width: 101px;
            height: 101px;
          }

          .callback-google {
            width: 64px;
            height: 64px;
            border-radius: 20px;
          }

          .callback-copy {
            margin-top: 17px;
          }

          .callback-copy h1 {
            font-size: 29px;
          }

          .callback-steps {
            margin-top: 25px;
            padding: 10px 11px;
          }

          .callback-step {
            gap: 8px;
            font-size: 11px;
          }

          .callback-step-state {
            font-size: 9px;
          }

          .callback-footer {
            font-size: 9.5px;
          }
        }

        @media (max-width: 350px) {
          .callback-card {
            padding: 25px 15px 20px;
          }

          .callback-step {
            gap: 6px;
            font-size: 10px;
          }

          .callback-steps {
            padding-inline: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-callback *,
          .auth-callback *::before,
          .auth-callback *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  );
}