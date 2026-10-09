import { useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function Learn() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'Binary Trees',
    'Recursion',
    'SQL Joins',
    'Operating System scheduling',
    'Linked Lists',
    'Dynamic Programming',
    'REST APIs',
    'Sorting algorithms',
  ];

  const learn = async () => {
    if (!topic.trim()) {
      toast.error('Enter a topic');
      return;
    }

    if (loading) return;

    setLoading(true);
    setContent('');

    try {
      const res = await teacherAPI.teach(topic.trim(), subject.trim());
      const explanation = res.data.content || res.data.explanation || '';

      if (!explanation.trim()) {
        toast.error('No explanation was returned. Please try again.');
        return;
      }

      setContent(explanation);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to load content'
      );
    } finally {
      setLoading(false);
    }
  };

  const startNewTopic = () => {
    setTopic('');
    setSubject('');
    setContent('');
  };

  return (
    <div className="learn-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .learn-page,
        .learn-page * {
          box-sizing: border-box;
        }

        .learn-page {
          min-height: 100vh;
          min-width: 320px;
          overflow-x: clip;
          background: #07090f;
          color: #f8fafc;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .learn-page button,
        .learn-page input {
          font: inherit;
        }

        .learn-page button:focus-visible,
        .learn-page a:focus-visible,
        .learn-page input:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 3px;
        }

        .learn-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Navigation */

        .learn-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-height: 68px;
          padding: 12px clamp(16px, 4vw, 40px);
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: rgba(7,9,15,.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .learn-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          color: #fff;
          text-decoration: none;
        }

        .learn-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 1px solid rgba(59,130,246,.25);
          border-radius: 11px;
          background: rgba(59,130,246,.12);
        }

        .learn-brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -.7px;
          white-space: nowrap;
        }

        .learn-nav-links {
          display: flex;
          align-items: center;
          gap: clamp(12px, 2.5vw, 28px);
          min-width: 0;
        }

        .learn-nav-link {
          color: #8b93a5;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          white-space: nowrap;
          transition: color .2s ease;
        }

        .learn-nav-link:hover,
        .learn-nav-link.active {
          color: #fff;
        }

        /* Page layout */

        .learn-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 42px clamp(16px, 4vw, 32px) 76px;
        }

        .learn-header {
          margin-bottom: 28px;
        }

        .learn-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          padding: 7px 11px;
          border: 1px solid rgba(96,165,250,.18);
          border-radius: 999px;
          background: rgba(59,130,246,.08);
          color: #93c5fd;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .learn-eyebrow-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 12px rgba(96,165,250,.5);
        }

        .learn-heading {
          margin: 0 0 10px;
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -1.8px;
          overflow-wrap: anywhere;
        }

        .learn-heading-accent {
          color: #60a5fa;
        }

        .learn-subheading {
          max-width: 620px;
          margin: 0;
          color: #8b93a5;
          font-size: 14px;
          line-height: 1.8;
        }

        /* Topic and subject form */

        .learn-search-card {
          margin-bottom: 24px;
          padding: clamp(18px, 3vw, 26px);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          background: linear-gradient(145deg, rgba(17,23,37,.96), rgba(12,16,26,.96));
          box-shadow: 0 20px 70px rgba(0,0,0,.12);
        }

        .learn-search-heading {
          margin: 0 0 7px;
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -.4px;
        }

        .learn-search-description {
          margin: 0 0 22px;
          color: #818b9d;
          font-size: 12px;
          line-height: 1.7;
        }

        /*
          Three correctly aligned desktop columns:
          Topic field | Subject field | Explain button.
          Each label and input stay together inside its own field.
        */

        .learn-search-row {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr) auto;
          align-items: end;
          gap: 13px;
          margin: 0 0 22px;
        }

        .learn-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .learn-field label {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          min-height: 18px;
          margin: 0;
          color: #D7DEEA;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .2px;
          line-height: 1.5;
        }

        .learn-field .required {
          margin-left: 2px;
          color: #91B5FF;
          font-size: 14px;
          font-weight: 700;
        }

        .learn-optional {
          margin-left: 4px;
          color: #747f92;
          font-size: 10px;
          font-weight: 500;
        }

        .learn-input {
          display: block;
          width: 100%;
          min-width: 0;
          min-height: 48px;
          padding: 12px 14px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 11px;
          background: rgba(4,8,16,.72);
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .learn-input::placeholder {
          color: #687184;
          opacity: 1;
        }

        .learn-input:hover:not(:disabled) {
          border-color: rgba(255,255,255,.17);
        }

        .learn-input:focus {
          border-color: rgba(96,165,250,.65);
          background: rgba(4,8,16,.9);
          box-shadow: 0 0 0 3px rgba(59,130,246,.11);
        }

        .learn-input:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .learn-explain-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-width: 124px;
          min-height: 48px;
          padding: 12px 17px;
          border: 1px solid rgba(96,165,250,.28);
          border-radius: 11px;
          background: #3b82f6;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: background .2s ease, transform .2s ease, opacity .2s ease;
        }

        .learn-explain-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #2563eb;
        }

        .learn-explain-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .learn-explain-button:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        .learn-spinner {
          display: inline-block;
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: learnSpin .75s linear infinite;
        }

        @keyframes learnSpin {
          to { transform: rotate(360deg); }
        }

        /* Topic suggestions */

        .learn-suggestions {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .learn-suggestions-label {
          color: #747f92;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .4px;
        }

        .learn-chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .learn-chip {
          max-width: 100%;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 999px;
          background: rgba(255,255,255,.035);
          color: #aab4c5;
          font-size: 11px;
          line-height: 1.4;
          text-align: left;
          overflow-wrap: anywhere;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease, color .2s ease;
        }

        .learn-chip:hover:not(:disabled) {
          border-color: rgba(96,165,250,.35);
          background: rgba(59,130,246,.1);
          color: #dbeafe;
        }

        .learn-chip:disabled {
          cursor: not-allowed;
          opacity: .5;
        }

        /* Loading state */

        .learn-loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          min-height: 220px;
          margin-bottom: 24px;
          padding: 35px 20px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          background: rgba(15,19,30,.8);
          text-align: center;
        }

        .learn-loading-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border: 1px solid rgba(96,165,250,.2);
          border-radius: 17px;
          background: rgba(59,130,246,.1);
          color: #93c5fd;
        }

        .learn-loading-title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 700;
        }

        .learn-loading-description {
          margin: 0;
          color: #818b9d;
          font-size: 12px;
          line-height: 1.7;
        }

        .learn-loading-dots {
          display: flex;
          gap: 6px;
        }

        .learn-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #60a5fa;
          animation: learnBounce 1s infinite ease-in-out;
        }

        .learn-dot:nth-child(2) {
          animation-delay: .15s;
        }

        .learn-dot:nth-child(3) {
          animation-delay: .3s;
        }

        @keyframes learnBounce {
          0%, 100% {
            opacity: .35;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }

        /* Explanation card */

        .learn-content-card {
          min-width: 0;
          padding: clamp(19px, 4vw, 34px);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 20px;
          background: rgba(15,19,30,.9);
          box-shadow: 0 20px 70px rgba(0,0,0,.12);
          animation: learnFadeIn .35s ease both;
        }

        .learn-content-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          min-width: 0;
          margin-bottom: 22px;
        }

        .learn-content-heading-group {
          min-width: 0;
        }

        .learn-content-label {
          margin-bottom: 7px;
          color: #7e8ba1;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .learn-content-title {
          margin: 0;
          color: #f8fafc;
          font-size: clamp(21px, 3vw, 28px);
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: -.8px;
          overflow-wrap: anywhere;
        }

        .learn-content-badge {
          flex-shrink: 0;
          max-width: 45%;
          padding: 7px 11px;
          border: 1px solid rgba(96,165,250,.2);
          border-radius: 999px;
          background: rgba(59,130,246,.09);
          color: #93c5fd;
          font-size: 10px;
          font-weight: 600;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .learn-content-divider {
          height: 1px;
          margin-bottom: 27px;
          background: rgba(255,255,255,.08);
        }

        .learn-content-body {
          min-width: 0;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.85;
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .learn-content-body h1,
        .learn-content-body h2,
        .learn-content-body h3,
        .learn-content-body h4 {
          color: #f8fafc;
          font-weight: 750;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .learn-content-body h1 {
          margin: 0 0 16px;
          font-size: clamp(23px, 3vw, 29px);
          letter-spacing: -.7px;
        }

        .learn-content-body h2 {
          margin: 30px 0 12px;
          padding-bottom: 9px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          font-size: clamp(18px, 2.5vw, 21px);
          letter-spacing: -.4px;
        }

        .learn-content-body h3 {
          margin: 23px 0 9px;
          font-size: 16px;
        }

        .learn-content-body h4 {
          margin: 18px 0 8px;
          font-size: 14px;
        }

        .learn-content-body p {
          margin: 0 0 16px;
          color: #b9c3d2;
          line-height: 1.9;
        }

        .learn-content-body strong {
          color: #f8fafc;
          font-weight: 700;
        }

        .learn-content-body ul,
        .learn-content-body ol {
          margin: 12px 0 20px;
          padding-left: 25px;
        }

        .learn-content-body li {
          margin-bottom: 8px;
          padding-left: 3px;
          color: #b9c3d2;
          line-height: 1.8;
        }

        .learn-content-body li::marker {
          color: #60a5fa;
        }

        .learn-content-body blockquote {
          margin: 18px 0;
          padding: 14px 18px;
          border-left: 3px solid #3b82f6;
          border-radius: 0 10px 10px 0;
          background: rgba(59,130,246,.07);
          color: #aab8cd;
        }

        .learn-content-body blockquote p:last-child {
          margin-bottom: 0;
        }

        .learn-content-body a {
          color: #93c5fd;
          text-decoration: underline;
          text-underline-offset: 3px;
          overflow-wrap: anywhere;
        }

        .learn-inline-code {
          padding: 3px 7px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 5px;
          background: rgba(255,255,255,.06);
          color: #93c5fd;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: .9em;
          overflow-wrap: anywhere;
        }

        .learn-code-wrapper {
          max-width: 100%;
          margin: 16px 0 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 12px;
          background: #080c14;
        }

        .learn-code-label {
          padding: 9px 14px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.025);
          color: #7e8ba1;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .6px;
          text-transform: uppercase;
        }

        .learn-code-block {
          max-width: 100%;
          margin: 0;
          padding: 17px;
          overflow-x: auto;
          color: #a7f3d0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 12px;
          line-height: 1.8;
          tab-size: 2;
          white-space: pre;
          -webkit-overflow-scrolling: touch;
        }

        .learn-content-body table {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 18px 0;
          overflow-x: auto;
          border-collapse: collapse;
          font-size: 12px;
          -webkit-overflow-scrolling: touch;
        }

        .learn-content-body th,
        .learn-content-body td {
          min-width: 100px;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,.09);
          text-align: left;
          vertical-align: top;
        }

        .learn-content-body th {
          background: rgba(59,130,246,.1);
          color: #dbeafe;
        }

        .learn-content-body td {
          color: #b9c3d2;
        }

        .learn-content-body hr {
          margin: 24px 0;
          border: 0;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .learn-content-body img {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 10px;
        }

        .learn-content-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 30px;
          padding-top: 21px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .learn-new-topic-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 41px;
          padding: 10px 15px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px;
          background: rgba(255,255,255,.04);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
        }

        .learn-new-topic-button:hover {
          border-color: rgba(255,255,255,.18);
          background: rgba(255,255,255,.08);
        }

        .learn-chat-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 41px;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: color .2s ease;
        }

        .learn-chat-link:hover {
          color: #bfdbfe;
        }

        /* Empty state */

        .learn-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          min-height: 245px;
          padding: 35px 22px;
          border: 1px dashed rgba(255,255,255,.1);
          border-radius: 18px;
          background: rgba(255,255,255,.015);
          text-align: center;
        }

        .learn-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          border: 1px solid rgba(96,165,250,.14);
          border-radius: 18px;
          background: rgba(59,130,246,.07);
          color: #60a5fa;
        }

        .learn-empty-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
        }

        .learn-empty-description {
          max-width: 390px;
          margin: 0;
          color: #7e8799;
          font-size: 12px;
          line-height: 1.8;
        }

        @keyframes learnFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Tablet */

        @media (max-width: 900px) {
          .learn-search-row {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 15px 12px;
          }

          .learn-explain-button {
            grid-column: 1 / -1;
            width: 100%;
          }
        }

        /* Mobile */

        @media (max-width: 640px) {
          .learn-nav {
            min-height: 62px;
            gap: 12px;
            padding: 11px 16px;
          }

          .learn-brand-name {
            font-size: 15px;
          }

          .learn-brand-icon {
            width: 32px;
            height: 32px;
          }

          .learn-nav-links {
            gap: 13px;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }

          .learn-nav-links::-webkit-scrollbar {
            display: none;
          }

          .learn-nav-link {
            font-size: 11px;
          }

          .learn-main {
            padding: 30px 17px 48px;
          }

          .learn-header {
            margin-bottom: 23px;
          }

          .learn-heading {
            letter-spacing: -1.3px;
          }

          .learn-subheading {
            font-size: 13px;
          }

          .learn-search-card {
            border-radius: 17px;
          }

          .learn-search-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
            margin-bottom: 20px;
          }

          .learn-field label {
            font-size: 12px;
          }

          .learn-input {
            min-height: 47px;
            font-size: 13px;
          }

          .learn-explain-button {
            grid-column: auto;
            width: 100%;
            min-height: 47px;
          }

          .learn-content-card {
            border-radius: 17px;
          }

          .learn-content-header {
            flex-direction: column;
            gap: 12px;
          }

          .learn-content-badge {
            max-width: 100%;
          }

          .learn-content-divider {
            margin-bottom: 22px;
          }

          .learn-content-body {
            font-size: 13px;
          }

          .learn-content-body p {
            line-height: 1.85;
          }

          .learn-content-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .learn-new-topic-button,
          .learn-chat-link {
            justify-content: center;
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .learn-nav {
            padding-left: 12px;
            padding-right: 12px;
          }

          .learn-nav-links {
            gap: 9px;
          }

          .learn-nav-link {
            font-size: 10px;
          }

          .learn-brand {
            gap: 7px;
          }

          .learn-brand-name {
            font-size: 14px;
          }

          .learn-main {
            padding-left: 13px;
            padding-right: 13px;
          }

          .learn-search-card,
          .learn-content-card {
            padding: 16px;
          }

          .learn-chip {
            padding: 7px 10px;
            font-size: 10px;
          }

          .learn-code-block {
            padding: 13px;
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .learn-page *,
          .learn-page *::before,
          .learn-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="learn-background" aria-hidden="true" />

      <nav className="learn-nav" aria-label="Main navigation">
        <Link to="/dashboard" className="learn-brand" aria-label="SyllabusAI dashboard">
          <span className="learn-brand-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="learn-brand-name">
            Syllabus<span style={{ color: '#60A5FA' }}>AI</span>
          </span>
        </Link>

        <div className="learn-nav-links">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/chat', label: 'Chat' },
            { to: '/exam', label: 'Exam' },
            { to: '/career', label: 'Career' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="learn-nav-link">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="learn-main">
        <header className="learn-header">
          <div className="learn-eyebrow">
            <span className="learn-eyebrow-dot" />
            YOUR PERSONAL LEARNING SPACE
          </div>

          <h1 className="learn-heading">
            Understand more.
            <br />
            <span className="learn-heading-accent">
              Learn smarter.
            </span>
          </h1>

          <p className="learn-subheading">
            Get clear, detailed explanations of any topic from your syllabus.
            Explore concepts, understand examples, and learn at your own pace.
          </p>
        </header>

        <section className="learn-search-card">
          <h2 className="learn-search-heading">
            What do you want to learn?
          </h2>

          <p className="learn-search-description">
            Enter a topic and optionally specify its subject for a more
            focused explanation.
          </p>

          <form
            className="learn-search-row"
            onSubmit={(event) => {
              event.preventDefault();
              learn();
            }}
          >
            <div className="learn-field">
              <label htmlFor="learn-topic">
                Topic <span className="required">*</span>
              </label>

              <input
                id="learn-topic"
                type="text"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Binary Search Trees"
                aria-describedby="learn-topic-hint"
                className="learn-input"
                autoComplete="off"
                maxLength={200}
                required
                disabled={loading}
              />

              <span id="learn-topic-hint" className="learn-field-hint">
                The concept you want explained.
              </span>
            </div>

            <div className="learn-field">
              <label htmlFor="learn-subject">
                Subject <span className="learn-optional">(Optional)</span>
              </label>

              <input
                id="learn-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Data Structures"
                className="learn-input"
                autoComplete="off"
                maxLength={150}
                disabled={loading}
              />

              <span className="learn-field-hint">
                Helps focus the explanation.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="learn-explain-button"
            >
              {loading ? (
                <>
                  <span className="learn-spinner" />
                  Preparing
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
                    <path d="M19 15l1.1 2.9L23 19l-2.9 1.1L19 23l-1.1-2.9L15 19l2.9-1.1L19 15z" />
                  </svg>
                  Explain topic
                </>
              )}
            </button>
          </form>

          <div className="learn-suggestions">
            <span className="learn-suggestions-label">
              POPULAR TOPICS
            </span>

            <div className="learn-chip-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => setTopic(suggestion)}
                  className="learn-chip"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && (
          <section className="learn-loading-card" aria-live="polite">
            <div className="learn-loading-icon">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <div>
              <p className="learn-loading-title">
                Preparing your explanation
              </p>
              <p className="learn-loading-description">
                Organizing the key concepts into an easy-to-understand guide.
              </p>
            </div>

            <div className="learn-loading-dots" aria-hidden="true">
              <span className="learn-dot" />
              <span className="learn-dot" />
              <span className="learn-dot" />
            </div>
          </section>
        )}

        {content && !loading && (
          <article className="learn-content-card">
            <header className="learn-content-header">
              <div className="learn-content-heading-group">
                <div className="learn-content-label">
                  YOUR STUDY GUIDE
                </div>

                <h2 className="learn-content-title">
                  {topic}
                </h2>
              </div>

              {subject && (
                <span className="learn-content-badge">
                  {subject}
                </span>
              )}
            </header>

            <div className="learn-content-divider" />

            <div className="learn-content-body">
              <ReactMarkdown
                components={{
                  code: ({ className, children, ...props }) => {
                    const isBlock = Boolean(className);

                    if (!isBlock) {
                      return (
                        <code className="learn-inline-code" {...props}>
                          {children}
                        </code>
                      );
                    }

                    const language =
                      className?.replace('language-', '') || 'code';

                    return (
                      <div className="learn-code-wrapper">
                        <div className="learn-code-label">
                          {language}
                        </div>
                        <pre className="learn-code-block">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },

                  h1: ({ children }) => <h1>{children}</h1>,
                  h2: ({ children }) => <h2>{children}</h2>,
                  h3: ({ children }) => <h3>{children}</h3>,
                  h4: ({ children }) => <h4>{children}</h4>,
                  p: ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => <ul>{children}</ul>,
                  ol: ({ children }) => <ol>{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  strong: ({ children }) => <strong>{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote>{children}</blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => <table>{children}</table>,
                  thead: ({ children }) => <thead>{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => <th>{children}</th>,
                  td: ({ children }) => <td>{children}</td>,
                  hr: () => <hr />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            <footer className="learn-content-footer">
              <button
                type="button"
                onClick={startNewTopic}
                className="learn-new-topic-button"
              >
                <span aria-hidden="true">＋ </span>
                Learn another topic
              </button>

              <Link to="/chat" className="learn-chat-link">
                Ask a follow-up in chat
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </Link>
            </footer>
          </article>
        )}

        {!content && !loading && (
          <section className="learn-empty-state">
            <div className="learn-empty-icon">
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M3 4.5A2.5 2.5 0 015.5 2H12v19H5.5A2.5 2.5 0 013 18.5z" />
                <path d="M21 4.5A2.5 2.5 0 0018.5 2H12v19h6.5a2.5 2.5 0 002.5-2.5z" />
                <path d="M6 7h3M6 11h3M15 7h3M15 11h3" />
              </svg>
            </div>

            <h2 className="learn-empty-title">
              Your next concept starts here
            </h2>

            <p className="learn-empty-description">
              Choose a popular topic or enter something from your syllabus.
              Your explanation will appear here, ready for you to study.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}