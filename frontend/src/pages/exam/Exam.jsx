import { useState } from 'react';
import { Link } from 'react-router-dom';
import { examinerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Exam() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Enter a topic');
      return;
    }

    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);

    try {
      const res = await examinerAPI.getQuiz(topic.trim(), subject.trim(), difficulty);
      const generatedQuiz = res.data.quiz;

      if (!generatedQuiz?.questions?.length) {
        toast.error('No questions were generated. Try another topic.');
        return;
      }

      setQuiz(generatedQuiz);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIndex, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const submitQuiz = () => {
    if (!quiz?.questions?.length) return;

    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Answer all questions first');
      return;
    }

    const correct = quiz.questions.reduce(
      (total, question, index) =>
        total + (answers[index] === question.correctAnswer ? 1 : 0),
      0
    );

    setScore(correct);
    setSubmitted(true);
  };

  const reset = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setTopic('');
    setSubject('');
    setDifficulty('medium');
  };

  const pct = quiz?.questions?.length
    ? Math.round((score / quiz.questions.length) * 100)
    : 0;

  const progress = quiz?.questions?.length
    ? Math.round((Object.keys(answers).length / quiz.questions.length) * 100)
    : 0;

  const scoreColor =
    pct >= 70 ? '#34D399' : pct >= 40 ? '#FBBF24' : '#FB7185';

  return (
    <div className="exam-page">
      <style>{css}</style>

      <div className="exam-background" aria-hidden="true">
        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />
        <div className="background-grid" />
      </div>

      <nav className="exam-nav">
        <Link to="/dashboard" className="exam-brand" aria-label="SyllabusAI dashboard">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2 2 7l10 5 10-5-10-5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="m2 12 10 5 10-5M2 17l10 5 10-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Syllabus<span className="brand-accent">AI</span></span>
        </Link>

        <div className="nav-links">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/chat', label: 'Chat' },
            { to: '/learn', label: 'Learn' },
            { to: '/career', label: 'Career' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${to === '/learn' ? 'nav-link-related' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-context">
          <span className="status-dot" />
          AI Practice
        </div>
      </nav>

      <main className="exam-main">
        <div className="exam-container">
          <header className="page-header">
            <div className="eyebrow">
              <span className="eyebrow-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M9 11h6m-6 4h6m-8 6h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              KNOWLEDGE CHECK
            </div>

            <h1>
              Practice <span className="heading-accent">exam.</span>
            </h1>

            <p className="page-subtitle">
              Test your understanding with AI-generated questions tailored to your topic.
            </p>

            <div className="header-meta">
              <span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Self-paced
              </span>
              <span className="meta-divider" />
              <span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Instant feedback
              </span>
            </div>
          </header>

          {!quiz && !loading && (
            <section className="setup-card fade-in">
              <div className="card-heading">
                <div className="card-heading-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3v18m9-9H3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2>Create your practice test</h2>
                  <p>Choose what you want to learn and set your challenge level.</p>
                </div>
              </div>

              <div className="form-fields">
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="exam-topic">Topic <span className="required">*</span></label>
                    <input
                      id="exam-topic"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generateQuiz()}
                      placeholder="e.g. Binary Trees"
                      className="exam-input"
                      autoComplete="off"
                    />
                    <span className="field-hint">The specific concept you want to practice</span>
                  </div>

                  <div className="form-field">
                    <label htmlFor="exam-subject">
                      Subject <span className="required">*</span>
                    </label>
                    <input
                      id="exam-subject"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generateQuiz()}
                      placeholder="e.g. Data Structures"
                      className="exam-input"
                      autoComplete="off"
                    />
                    <span className="field-hint">Add context for more relevant questions</span>
                  </div>
                </div>

                <div className="form-field difficulty-field">
                  <div className="label-row">
                    <label>Difficulty level</label>
                    <span className="selected-difficulty">
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                  </div>

                  <div className="difficulty-options">
                    {[
                      {
                        value: 'easy',
                        label: 'Easy',
                        description: 'Build confidence',
                        icon: '○',
                      },
                      {
                        value: 'medium',
                        label: 'Medium',
                        description: 'Test understanding',
                        icon: '◈',
                      },
                      {
                        value: 'hard',
                        label: 'Hard',
                        description: 'Push your limits',
                        icon: '✳',
                      },
                    ].map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setDifficulty(level.value)}
                        className={`difficulty-option ${
                          difficulty === level.value ? 'difficulty-active' : ''
                        }`}
                        aria-pressed={difficulty === level.value}
                      >
                        <span className="difficulty-symbol">{level.icon}</span>
                        <span className="difficulty-copy">
                          <strong>{level.label}</strong>
                          <small>{level.description}</small>
                        </span>
                        <span className="difficulty-radio">
                          {difficulty === level.value && <span />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="setup-footer">
                <div className="privacy-note">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Your progress is tracked in this session
                </div>

                <button
                  type="button"
                  onClick={generateQuiz}
                  disabled={loading}
                  className="primary-button"
                >
                  Generate quiz
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </section>
          )}

          {loading && (
            <section className="loading-card fade-in" aria-live="polite">
              <div className="loader-visual">
                <div className="loader-ring" />
                <div className="loader-core">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <h2>Preparing your quiz</h2>
              <p>Creating questions for <strong>{topic}</strong></p>
              <div className="loading-progress">
                <span />
              </div>
              <span className="loading-caption">This may take a moment</span>
            </section>
          )}

          {quiz && !submitted && (
            <section className="quiz-section fade-in">
              <div className="quiz-topbar">
                <button type="button" onClick={reset} className="back-button">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m15 18-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back to setup
                </button>
                <span className="quiz-status">
                  <span className="status-dot" />
                  In progress
                </span>
              </div>

              <div className="quiz-summary">
                <div className="quiz-summary-main">
                  <span className="section-kicker">PRACTICE SESSION</span>
                  <h2>{topic}</h2>
                  {subject.trim() && <p>{subject}</p>}
                  <div className="quiz-tags">
                    <span>{quiz.questions.length} questions</span>
                    <span className="tag-separator">·</span>
                    <span>{difficulty} difficulty</span>
                  </div>
                </div>

                <div className="progress-ring-wrap">
                  <svg viewBox="0 0 80 80" className="progress-ring" aria-hidden="true">
                    <circle cx="40" cy="40" r="33" className="progress-ring-track" />
                    <circle
                      cx="40"
                      cy="40"
                      r="33"
                      className="progress-ring-value"
                      strokeDasharray={`${2 * Math.PI * 33}`}
                      strokeDashoffset={`${2 * Math.PI * 33 * (1 - progress / 100)}`}
                    />
                  </svg>
                  <div className="progress-ring-label">
                    <strong>{Object.keys(answers).length}</strong>
                    <span>of {quiz.questions.length}</span>
                  </div>
                </div>
              </div>

              <div className="question-progress">
                <div className="question-progress-label">
                  <span>Quiz progress</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="questions-list">
                {quiz.questions.map((q, i) => (
                  <article key={i} className="question-card">
                    <div className="question-heading">
                      <span className="question-number">
                        <span>{String(i + 1).padStart(2, '0')}</span>
                      </span>
                      <span className="question-label">QUESTION {i + 1}</span>
                      {answers[i] !== undefined && (
                        <span className="answered-indicator">
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="m5 12 4 4L19 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Answered
                        </span>
                      )}
                    </div>

                    <h3 className="question-text">{q.question}</h3>

                    <div className="options-list">
                      {q.options?.map((opt, j) => {
                        const selected = answers[i] === opt;

                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => selectAnswer(i, opt)}
                            className={`answer-option ${selected ? 'answer-selected' : ''}`}
                            aria-pressed={selected}
                          >
                            <span className="answer-letter">
                              {String.fromCharCode(65 + j)}
                            </span>
                            <span className="answer-text">{opt}</span>
                            <span className="answer-radio">
                              {selected && <span />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>

              <div className="quiz-submit-panel">
                <div className="submit-panel-copy">
                  <strong>{Object.keys(answers).length} of {quiz.questions.length} answered</strong>
                  <span>
                    {progress === 100
                      ? 'You are ready to submit your answers.'
                      : 'Complete every question before submitting.'}
                  </span>
                </div>

                <div className="submit-actions">
                  <button type="button" onClick={reset} className="secondary-button">
                    Start over
                  </button>
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className="primary-button"
                    disabled={progress !== 100}
                  >
                    Submit answers
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="m5 12 4 4L19 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          )}

          {submitted && quiz && (
            <section className="results-section fade-in">
              <div className="results-hero">
                <div className="results-icon" style={{ color: scoreColor }}>
                  {pct >= 70 ? (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="m5 12 4 4L19 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 8v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <span className="section-kicker">SESSION COMPLETE</span>
                <h2>
                  {pct >= 80
                    ? 'Excellent work!'
                    : pct >= 60
                    ? 'Good progress!'
                    : pct >= 40
                    ? 'Keep building!'
                    : 'Keep practicing!'}
                </h2>
                <p className="results-description">
                  {pct >= 80
                    ? 'You have a strong grasp of this topic. Keep it up.'
                    : pct >= 60
                    ? 'You are making progress. Review the answers below to improve further.'
                    : 'Review the correct answers and explanations to strengthen your understanding.'}
                </p>

                <div className="score-overview">
                  <div className="score-circle" style={{ '--score-color': scoreColor }}>
                    <svg viewBox="0 0 160 160" aria-hidden="true">
                      <circle cx="80" cy="80" r="68" className="score-circle-track" />
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        className="score-circle-progress"
                        strokeDasharray={`${2 * Math.PI * 68}`}
                        strokeDashoffset={`${2 * Math.PI * 68 * (1 - pct / 100)}`}
                      />
                    </svg>
                    <div className="score-circle-content">
                      <strong>{pct}%</strong>
                      <span>Score</span>
                    </div>
                  </div>

                  <div className="score-stats">
                    <div className="score-stat">
                      <span className="stat-icon stat-correct">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="m5 12 4 4L19 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <div>
                        <strong>{score}</strong>
                        <span>Correct answers</span>
                      </div>
                    </div>

                    <div className="score-stat">
                      <span className="stat-icon stat-incorrect">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M18 6 6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <div>
                        <strong>{quiz.questions.length - score}</strong>
                        <span>Incorrect answers</span>
                      </div>
                    </div>

                    <div className="score-stat">
                      <span className="stat-icon stat-total">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <div>
                        <strong>{quiz.questions.length}</strong>
                        <span>Total questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="review-heading">
                <div>
                  <span className="section-kicker">LEARNING REVIEW</span>
                  <h2>Review your answers</h2>
                  <p>See the correct options and revisit concepts that need attention.</p>
                </div>
                <span className="review-count">{quiz.questions.length} questions</span>
              </div>

              <div className="questions-list">
                {quiz.questions.map((q, i) => {
                  const isCorrect = answers[i] === q.correctAnswer;

                  return (
                    <article
                      key={i}
                      className={`question-card review-card ${
                        isCorrect ? 'review-correct' : 'review-incorrect'
                      }`}
                    >
                      <div className="question-heading">
                        <span className="question-number">
                          <span>{String(i + 1).padStart(2, '0')}</span>
                        </span>
                        <span className="question-label">QUESTION {i + 1}</span>
                        <span className={`review-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {isCorrect ? (
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="m5 12 4 4L19 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M18 6 6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <h3 className="question-text">{q.question}</h3>

                      <div className="options-list">
                        {q.options?.map((opt, j) => {
                          const selected = answers[i] === opt;
                          const correctOption = opt === q.correctAnswer;

                          return (
                            <div
                              key={j}
                              className={`answer-option review-option ${
                                correctOption
                                  ? 'review-option-correct'
                                  : selected
                                  ? 'review-option-incorrect'
                                  : ''
                              }`}
                            >
                              <span className="answer-letter">
                                {String.fromCharCode(65 + j)}
                              </span>
                              <span className="answer-text">{opt}</span>
                              {correctOption && (
                                <svg className="review-option-icon" viewBox="0 0 24 24" fill="none" aria-label="Correct answer">
                                  <path
                                    d="m5 12 4 4L19 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                              {selected && !correctOption && (
                                <svg className="review-option-icon" viewBox="0 0 24 24" fill="none" aria-label="Your incorrect answer">
                                  <path
                                    d="M18 6 6 18M6 6l12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!isCorrect && (
                        <div className="answer-feedback">
                          <strong>Your answer</strong>
                          <span>{answers[i]}</span>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="explanation-box">
                          <div className="explanation-icon">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <strong>Explanation</strong>
                            <p>{q.explanation}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="results-actions">
                <button type="button" onClick={reset} className="secondary-button">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  New quiz
                </button>
                <Link to="/learn" className="primary-button study-button">
                  Study this topic
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </section>
          )}

          <footer className="exam-footer">
            <span>SYLLABUSAI</span>
            <span>Learn · Practice · Improve</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .exam-page {
    --exam-bg: #080B12;
    --exam-panel: rgba(16, 21, 33, 0.84);
    --exam-border: rgba(148, 163, 184, 0.13);
    --exam-text: #F1F5F9;
    --exam-muted: #8994A8;
    --exam-blue: #6D9EFF;
    --exam-blue-strong: #4F86F7;
    min-height: 100vh;
    position: relative;
    isolation: isolate;
    overflow: clip;
    background: var(--exam-bg);
    color: var(--exam-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .exam-page *,
  .exam-page *::before,
  .exam-page *::after {
    box-sizing: border-box;
  }

  .exam-page button,
  .exam-page input {
    font: inherit;
  }

  .exam-page button,
  .exam-page a {
    -webkit-tap-highlight-color: transparent;
  }

  .exam-background {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  .background-grid {
    position: absolute;
    inset: 0;
    opacity: .32;
    background-image:
      linear-gradient(rgba(148,163,184,.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148,163,184,.045) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: linear-gradient(to bottom, black, transparent 80%);
  }

  .background-glow {
    position: absolute;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    filter: blur(110px);
    opacity: .12;
  }

  .glow-one {
    background: #3678F6;
    top: 80px;
    left: -280px;
  }

  .glow-two {
    background: #6852D8;
    top: 360px;
    right: -340px;
    opacity: .08;
  }

  .exam-nav {
    min-height: 70px;
    width: 100%;
    padding: 0 5.5%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid rgba(148,163,184,.12);
    background: rgba(8,11,18,.84);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .exam-brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    color: #F8FAFC;
    text-decoration: none;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.8px;
    flex-shrink: 0;
  }

  .brand-mark {
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    color: #83AEFF;
    border: 1px solid rgba(109,158,255,.25);
    background: linear-gradient(145deg, rgba(109,158,255,.17), rgba(109,158,255,.04));
    border-radius: 11px;
  }

  .brand-mark svg {
    width: 20px;
    height: 20px;
  }

  .brand-accent {
    color: #83AEFF;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .nav-link {
    position: relative;
    padding: 10px 13px;
    color: #8994A8;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 500;
    border-radius: 9px;
    transition: color .2s ease, background .2s ease;
  }

  .nav-link:hover {
    color: #F1F5F9;
    background: rgba(255,255,255,.045);
  }

  .nav-link-related {
    color: #C3D7FF;
  }

  .nav-context {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 9px 12px;
    border: 1px solid var(--exam-border);
    border-radius: 30px;
    color: #AAB5C8;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ADE80;
    box-shadow: 0 0 10px rgba(74,222,128,.3);
    flex-shrink: 0;
  }

  .exam-main {
    position: relative;
  }

  .exam-container {
    width: min(100% - 48px, 820px);
    margin: 0 auto;
    padding: 54px 0 26px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: #8CAEFF;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.7px;
    margin-bottom: 17px;
  }

  .eyebrow-icon {
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(109,158,255,.2);
    border-radius: 9px;
    background: rgba(109,158,255,.08);
  }

  .eyebrow-icon svg {
    width: 16px;
    height: 16px;
  }

  .page-header h1 {
    margin: 0;
    font-size: clamp(32px, 5vw, 43px);
    line-height: 1.12;
    letter-spacing: -2.2px;
    font-weight: 800;
    color: #F8FAFC;
  }

  .heading-accent {
    color: #8BAEFF;
  }

  .page-subtitle {
    max-width: 510px;
    margin: 14px 0 0;
    color: #929DB0;
    font-size: 14px;
    line-height: 1.8;
  }

  .header-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 20px;
    color: #7F8A9D;
    font-size: 11px;
  }

  .header-meta > span:not(.meta-divider) {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .header-meta svg {
    width: 15px;
    height: 15px;
    color: #91A9D2;
  }

  .meta-divider {
    width: 3px;
    height: 3px;
    background: #475569;
    border-radius: 50%;
  }

  .setup-card,
  .loading-card,
  .question-card {
    border: 1px solid var(--exam-border);
    background: linear-gradient(145deg, rgba(19,25,39,.94), rgba(13,17,28,.94));
    box-shadow: 0 20px 70px rgba(0,0,0,.13);
  }

  .setup-card {
    padding: 30px;
    border-radius: 20px;
  }

  .card-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 25px;
    margin-bottom: 25px;
    border-bottom: 1px solid rgba(148,163,184,.1);
  }

  .card-heading-icon {
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    color: #94B7FF;
    border: 1px solid rgba(109,158,255,.2);
    background: rgba(109,158,255,.09);
    border-radius: 13px;
  }

  .card-heading-icon svg {
    width: 19px;
    height: 19px;
  }

  .card-heading h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -.4px;
  }

  .card-heading p {
    margin: 6px 0 0;
    color: #8792A5;
    font-size: 12px;
    line-height: 1.6;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: minmax(0,1fr) minmax(0,1fr);
    gap: 18px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 9px;
  }

  .form-field label,
  .label-row label {
    color: #D7DEEA;
    font-size: 12px;
    font-weight: 600;
  }

  .required {
    color: #91B5FF;
  }

  .optional {
    color: #778397;
    font-size: 10px;
    font-weight: 400;
    margin-left: 4px;
  }

  .exam-input {
    width: 100%;
    min-width: 0;
    min-height: 47px;
    padding: 0 14px;
    color: #F1F5F9;
    font-size: 13px !important;
    border: 1px solid rgba(148,163,184,.17);
    border-radius: 11px;
    outline: none;
    background: rgba(4,8,16,.48);
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }

  .exam-input::placeholder {
    color: #586477;
    opacity: 1;
  }

  .exam-input:focus {
    border-color: rgba(109,158,255,.65);
    background: rgba(10,16,29,.9);
    box-shadow: 0 0 0 3px rgba(109,158,255,.1);
  }

  .field-hint {
    color: #687489;
    font-size: 10px;
    line-height: 1.5;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .selected-difficulty {
    color: #9CB9F8;
    font-size: 11px;
    font-weight: 600;
  }

  .difficulty-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 10px;
    margin-top: 2px;
  }

  .difficulty-option {
    min-width: 0;
    min-height: 77px;
    padding: 13px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    cursor: pointer;
    border: 1px solid rgba(148,163,184,.15);
    border-radius: 12px;
    color: #C7D0DF;
    background: rgba(255,255,255,.018);
    transition: border-color .2s ease, background .2s ease, transform .2s ease;
  }

  .difficulty-option:hover {
    border-color: rgba(148,163,184,.32);
    background: rgba(255,255,255,.035);
  }

  .difficulty-option:active {
    transform: scale(.99);
  }

  .difficulty-active {
    border-color: rgba(109,158,255,.55);
    background: linear-gradient(135deg, rgba(67,113,210,.16), rgba(67,113,210,.05));
    box-shadow: inset 0 0 0 1px rgba(109,158,255,.06);
  }

  .difficulty-active:hover {
    border-color: rgba(109,158,255,.7);
    background: linear-gradient(135deg, rgba(67,113,210,.2), rgba(67,113,210,.07));
  }

  .difficulty-symbol {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(148,163,184,.13);
    border-radius: 9px;
    color: #94A3B8;
    font-size: 16px;
  }

  .difficulty-active .difficulty-symbol {
    color: #A9C4FF;
    border-color: rgba(109,158,255,.23);
    background: rgba(109,158,255,.1);
  }

  .difficulty-copy {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }

  .difficulty-copy strong {
    font-size: 12px;
    font-weight: 700;
  }

  .difficulty-copy small {
    color: #778397;
    font-size: 9px;
    line-height: 1.4;
  }

  .difficulty-active .difficulty-copy strong {
    color: #D8E5FF;
  }

  .difficulty-radio,
  .answer-radio {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid #596579;
    border-radius: 50%;
  }

  .difficulty-active .difficulty-radio {
    border-color: #83AAFF;
  }

  .difficulty-radio span,
  .answer-radio span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8CB2FF;
  }

  .setup-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 30px;
    padding-top: 23px;
    border-top: 1px solid rgba(148,163,184,.1);
  }

  .privacy-note {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #7E899D;
    font-size: 10px;
    line-height: 1.6;
  }

  .privacy-note svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: #7D9AC8;
  }

  .primary-button,
  .secondary-button {
    min-height: 43px;
    padding: 0 17px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease, opacity .2s ease;
  }

  .primary-button {
    color: #FFFFFF;
    background: linear-gradient(135deg, #5289F5, #3D72E5);
    border: 1px solid rgba(147,181,255,.25);
    box-shadow: 0 5px 20px rgba(50,105,226,.15);
  }

  .primary-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #6698FF, #4D82F1);
    box-shadow: 0 7px 24px rgba(50,105,226,.25);
    transform: translateY(-1px);
  }

  .primary-button:active:not(:disabled),
  .secondary-button:active {
    transform: translateY(0);
  }

  .primary-button:disabled {
    opacity: .38;
    cursor: not-allowed;
    box-shadow: none;
  }

  .primary-button svg,
  .secondary-button svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .secondary-button {
    color: #B1BDCF;
    border: 1px solid rgba(148,163,184,.18);
    background: rgba(255,255,255,.035);
  }

  .secondary-button:hover {
    color: #F1F5F9;
    border-color: rgba(148,163,184,.34);
    background: rgba(255,255,255,.065);
  }

  .loading-card {
    min-height: 350px;
    padding: 55px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 20px;
  }

  .loader-visual {
    width: 78px;
    height: 78px;
    position: relative;
    display: grid;
    place-items: center;
    margin-bottom: 25px;
  }

  .loader-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(109,158,255,.12);
    border-top-color: #83AEFF;
    border-right-color: rgba(109,158,255,.6);
    border-radius: 50%;
    animation: examSpin 1.1s linear infinite;
  }

  .loader-core {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    color: #9CBAFF;
    background: rgba(109,158,255,.1);
    border: 1px solid rgba(109,158,255,.2);
  }

  .loader-core svg {
    width: 23px;
    height: 23px;
    animation: examPulse 1.7s ease-in-out infinite;
  }

  .loading-card h2 {
    margin: 0;
    font-size: 19px;
    letter-spacing: -.5px;
  }

  .loading-card p {
    margin: 11px 0 22px;
    color: #8994A8;
    font-size: 12px;
    line-height: 1.7;
  }

  .loading-card p strong {
    color: #CBD8ED;
    font-weight: 600;
  }

  .loading-progress {
    width: min(100%, 230px);
    height: 4px;
    overflow: hidden;
    border-radius: 10px;
    background: rgba(148,163,184,.12);
  }

  .loading-progress span {
    display: block;
    width: 40%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5289F5, #A0BEFF);
    animation: examLoading 1.7s ease-in-out infinite;
  }

  .loading-caption {
    margin-top: 12px;
    color: #667286;
    font-size: 10px;
  }

  .quiz-section,
  .results-section {
    min-width: 0;
  }

  .quiz-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 0;
    color: #8C98AC;
    border: 0;
    background: transparent;
    font-size: 11px;
    cursor: pointer;
    transition: color .2s ease;
  }

  .back-button:hover {
    color: #E2E8F0;
  }

  .back-button svg {
    width: 16px;
    height: 16px;
  }

  .quiz-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 11px;
    color: #A9B5C8;
    border: 1px solid var(--exam-border);
    background: rgba(255,255,255,.025);
    border-radius: 30px;
    font-size: 10px;
    white-space: nowrap;
  }

  .quiz-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 25px 27px;
    border: 1px solid var(--exam-border);
    border-radius: 17px;
    background: linear-gradient(125deg, rgba(23,32,51,.96), rgba(14,19,31,.96));
  }

  .quiz-summary-main {
    min-width: 0;
  }

  .section-kicker {
    display: block;
    color: #8DAFFF;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.6px;
  }

  .quiz-summary h2 {
    margin: 10px 0 0;
    color: #F1F5F9;
    font-size: clamp(20px, 4vw, 25px);
    line-height: 1.3;
    letter-spacing: -.8px;
    overflow-wrap: anywhere;
  }

  .quiz-summary-main > p {
    margin: 6px 0 0;
    color: #8C9AB0;
    font-size: 12px;
  }

  .quiz-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 13px;
    color: #91A0B7;
    font-size: 10px;
    text-transform: capitalize;
  }

  .tag-separator {
    color: #58667B;
  }

  .progress-ring-wrap {
    position: relative;
    width: 83px;
    height: 83px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .progress-ring-track,
  .progress-ring-value {
    fill: none;
    stroke-width: 5;
  }

  .progress-ring-track {
    stroke: rgba(148,163,184,.12);
  }

  .progress-ring-value {
    stroke: #80A8FF;
    stroke-linecap: round;
    transition: stroke-dashoffset .3s ease;
  }

  .progress-ring-label {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .progress-ring-label strong {
    font-size: 19px;
    line-height: 1;
  }

  .progress-ring-label span {
    color: #8592A7;
    font-size: 9px;
  }

  .question-progress {
    padding: 19px 0 24px;
  }

  .question-progress-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #8D99AD;
    font-size: 10px;
  }

  .question-progress-label strong {
    color: #C8D8F5;
    font-size: 11px;
  }

  .progress-track {
    width: 100%;
    height: 4px;
    overflow: hidden;
    border-radius: 10px;
    background: rgba(148,163,184,.13);
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #4F86F7, #91B4FF);
    transition: width .3s ease;
  }

  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .question-card {
    min-width: 0;
    padding: 24px;
    border-radius: 16px;
    transition: border-color .2s ease;
  }

  .question-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin-bottom: 17px;
  }

  .question-number {
    width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 1px solid rgba(109,158,255,.19);
    border-radius: 9px;
    background: rgba(109,158,255,.08);
  }

  .question-number span {
    color: #A6C1FF;
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .question-label {
    color: #8794A9;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.2px;
  }

  .answered-indicator {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: auto;
    color: #6EE7B7;
    font-size: 10px;
    white-space: nowrap;
  }

  .answered-indicator svg {
    width: 14px;
    height: 14px;
  }

  .question-text {
    margin: 0 0 20px;
    color: #E5EAF3;
    font-size: 15px;
    line-height: 1.75;
    font-weight: 600;
    letter-spacing: -.2px;
    overflow-wrap: anywhere;
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .answer-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-width: 0;
    min-height: 49px;
    padding: 10px 13px;
    text-align: left;
    color: #B9C4D5;
    border: 1px solid rgba(148,163,184,.14);
    border-radius: 11px;
    background: rgba(255,255,255,.018);
    cursor: pointer;
    transition: border-color .18s ease, background .18s ease, color .18s ease;
  }

  .answer-option:hover {
    border-color: rgba(109,158,255,.38);
    background: rgba(109,158,255,.045);
    color: #E7EDF8;
  }

  .answer-option:focus-visible,
  .difficulty-option:focus-visible,
  .primary-button:focus-visible,
  .secondary-button:focus-visible,
  .back-button:focus-visible {
    outline: 2px solid #8DB2FF;
    outline-offset: 3px;
  }

  .answer-selected {
    border-color: rgba(109,158,255,.57);
    background: rgba(72,117,209,.13);
    color: #E5EDFF;
    box-shadow: inset 0 0 0 1px rgba(109,158,255,.06);
  }

  .answer-selected:hover {
    border-color: rgba(109,158,255,.7);
    background: rgba(72,117,209,.17);
  }

  .answer-letter {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(148,163,184,.13);
    border-radius: 7px;
    color: #9BA8BC;
    background: rgba(255,255,255,.035);
    font-size: 10px;
    font-weight: 700;
  }

  .answer-selected .answer-letter {
    color: #BCD1FF;
    border-color: rgba(109,158,255,.3);
    background: rgba(109,158,255,.12);
  }

  .answer-text {
    flex: 1;
    min-width: 0;
    color: inherit;
    font-size: 12px;
    line-height: 1.65;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .answer-selected .answer-radio {
    border-color: #88AEFF;
  }

  .quiz-submit-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 19px;
    padding: 20px;
    border: 1px solid var(--exam-border);
    border-radius: 15px;
    background: rgba(15,20,32,.9);
  }

  .submit-panel-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .submit-panel-copy strong {
    color: #DDE5F2;
    font-size: 12px;
  }

  .submit-panel-copy span {
    color: #7F8B9F;
    font-size: 10px;
    line-height: 1.6;
  }

  .submit-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 9px;
  }

  .results-hero {
    position: relative;
    overflow: hidden;
    padding: 32px 25px 30px;
    text-align: center;
    border: 1px solid var(--exam-border);
    border-radius: 20px;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(109,158,255,.09), transparent 65%),
      linear-gradient(145deg, rgba(19,25,39,.97), rgba(13,17,28,.97));
  }

  .results-icon {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    margin: 0 auto 17px;
    border: 1px solid currentColor;
    border-radius: 15px;
    background: rgba(255,255,255,.025);
  }

  .results-icon svg {
    width: 23px;
    height: 23px;
  }

  .results-hero > h2 {
    margin: 10px 0 0;
    color: #F1F5F9;
    font-size: 25px;
    letter-spacing: -.9px;
  }

  .results-description {
    max-width: 440px;
    margin: 10px auto 0;
    color: #8C98AC;
    font-size: 12px;
    line-height: 1.8;
  }

  .score-overview {
    width: min(100%, 440px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 38px;
    margin: 30px auto 0;
    padding: 23px 22px;
    border: 1px solid rgba(148,163,184,.11);
    border-radius: 16px;
    background: rgba(4,8,16,.25);
  }

  .score-circle {
    width: 145px;
    height: 145px;
    position: relative;
    flex-shrink: 0;
  }

  .score-circle > svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .score-circle-track,
  .score-circle-progress {
    fill: none;
    stroke-width: 8;
  }

  .score-circle-track {
    stroke: rgba(148,163,184,.12);
  }

  .score-circle-progress {
    stroke: var(--score-color);
    stroke-linecap: round;
    transition: stroke-dashoffset .8s ease;
  }

  .score-circle-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .score-circle-content strong {
    color: var(--score-color);
    font-size: 35px;
    line-height: 1;
    letter-spacing: -1.8px;
    font-variant-numeric: tabular-nums;
  }

  .score-circle-content span {
    color: #8C98AC;
    font-size: 10px;
  }

  .score-stats {
    display: flex;
    flex-direction: column;
    gap: 18px;
    text-align: left;
  }

  .score-stat {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .stat-icon {
    width: 33px;
    height: 33px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(148,163,184,.12);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .stat-icon svg {
    width: 16px;
    height: 16px;
  }

  .stat-correct {
    color: #6EE7B7;
    background: rgba(52,211,153,.07);
  }

  .stat-incorrect {
    color: #FDA4AF;
    background: rgba(251,113,133,.07);
  }

  .stat-total {
    color: #A9C5FF;
    background: rgba(109,158,255,.08);
  }

  .score-stat > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .score-stat strong {
    color: #E5EAF3;
    font-size: 17px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .score-stat span:not(.stat-icon) {
    color: #8692A6;
    font-size: 10px;
  }

  .review-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 15px;
    margin: 35px 0 18px;
  }

  .review-heading h2 {
    margin: 8px 0 0;
    color: #F1F5F9;
    font-size: 20px;
    letter-spacing: -.7px;
  }

  .review-heading p {
    margin: 7px 0 0;
    color: #8490A4;
    font-size: 11px;
    line-height: 1.7;
  }

  .review-count {
    flex-shrink: 0;
    padding: 7px 10px;
    color: #9BA8BC;
    border: 1px solid var(--exam-border);
    border-radius: 8px;
    background: rgba(255,255,255,.025);
    font-size: 10px;
    white-space: nowrap;
  }

  .review-correct {
    border-color: rgba(52,211,153,.19);
  }

  .review-incorrect {
    border-color: rgba(251,113,133,.2);
  }

  .review-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }

  .review-status svg {
    width: 15px;
    height: 15px;
  }

  .review-status.correct {
    color: #6EE7B7;
  }

  .review-status.incorrect {
    color: #FDA4AF;
  }

  .review-option {
    cursor: default;
  }

  .review-option:hover {
    color: inherit;
    background: rgba(255,255,255,.018);
    border-color: rgba(148,163,184,.14);
  }

  .review-option-correct,
  .review-option-correct:hover {
    border-color: rgba(52,211,153,.36);
    background: rgba(52,211,153,.075);
    color: #D6FBEA;
  }

  .review-option-incorrect,
  .review-option-incorrect:hover {
    border-color: rgba(251,113,133,.32);
    background: rgba(251,113,133,.065);
    color: #FFE0E5;
  }

  .review-option-correct .answer-letter {
    color: #8CECC7;
    border-color: rgba(52,211,153,.25);
    background: rgba(52,211,153,.09);
  }

  .review-option-incorrect .answer-letter {
    color: #FDA4AF;
    border-color: rgba(251,113,133,.25);
    background: rgba(251,113,133,.08);
  }

  .review-option-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    margin-left: auto;
  }

  .review-option-correct .review-option-icon {
    color: #6EE7B7;
  }

  .review-option-incorrect .review-option-icon {
    color: #FDA4AF;
  }

  .answer-feedback {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 14px;
    padding: 12px 14px;
    border-left: 2px solid rgba(251,113,133,.6);
    border-radius: 0 9px 9px 0;
    background: rgba(251,113,133,.045);
  }

  .answer-feedback strong {
    color: #FDA4AF;
    font-size: 10px;
  }

  .answer-feedback span {
    color: #D5AEB6;
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .explanation-box {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    margin-top: 17px;
    padding: 15px;
    border: 1px solid rgba(109,158,255,.12);
    border-radius: 11px;
    background: rgba(109,158,255,.045);
  }

  .explanation-icon {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 8px;
    color: #9DBAFF;
    background: rgba(109,158,255,.1);
  }

  .explanation-icon svg {
    width: 16px;
    height: 16px;
  }

  .explanation-box > div:last-child {
    min-width: 0;
  }

  .explanation-box strong {
    display: block;
    margin: 2px 0 6px;
    color: #C6D7F8;
    font-size: 11px;
  }

  .explanation-box p {
    margin: 0;
    color: #94A1B7;
    font-size: 11px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .results-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
    padding: 19px;
    border: 1px solid var(--exam-border);
    border-radius: 15px;
    background: rgba(15,20,32,.88);
  }

  .study-button {
    min-height: 43px;
  }

  .exam-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-top: 48px;
    padding: 22px 0 8px;
    border-top: 1px solid rgba(148,163,184,.1);
    color: #586477;
    font-size: 9px;
    letter-spacing: .3px;
  }

  .exam-footer span:first-child {
    color: #78869D;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
  }

  .fade-in {
    animation: examFadeIn .38s ease both;
  }

  @keyframes examFadeIn {
    from {
      opacity: 0;
      transform: translateY(9px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes examSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes examPulse {
    0%, 100% { opacity: .65; transform: scale(.94); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  @keyframes examLoading {
    0% { transform: translateX(-120%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(270%); }
  }

  @media (min-width: 1200px) {
    .exam-container {
      padding-top: 62px;
    }
  }

  @media (max-width: 900px) {
    .exam-nav {
      padding: 0 24px;
      gap: 15px;
    }

    .nav-links {
      gap: 2px;
    }

    .nav-link {
      padding: 9px 10px;
    }

    .nav-context {
      padding: 8px 10px;
    }

    .exam-container {
      width: min(100% - 40px, 820px);
      padding-top: 42px;
    }

    .difficulty-option {
      gap: 8px;
      padding: 12px 9px;
    }

    .difficulty-symbol {
      width: 27px;
      height: 27px;
    }
  }

  @media (max-width: 640px) {
    .exam-nav {
      min-height: 62px;
      padding: 0 16px;
      gap: 10px;
    }

    .exam-brand {
      gap: 8px;
      font-size: 15px;
    }

    .brand-mark {
      width: 31px;
      height: 31px;
      border-radius: 9px;
    }

    .brand-mark svg {
      width: 18px;
      height: 18px;
    }

    .nav-links {
      gap: 0;
    }

    .nav-link {
      padding: 9px 8px;
      font-size: 11px;
    }

    .nav-context {
      display: none;
    }

    .exam-container {
      width: calc(100% - 32px);
      padding: 35px 0 18px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .eyebrow {
      margin-bottom: 14px;
      font-size: 9px;
    }

    .page-header h1 {
      font-size: clamp(30px, 8vw, 38px);
      letter-spacing: -1.6px;
    }

    .page-subtitle {
      margin-top: 11px;
      font-size: 12px;
    }

    .header-meta {
      margin-top: 16px;
      gap: 10px;
      font-size: 10px;
    }

    .setup-card {
      padding: 21px 17px;
      border-radius: 16px;
    }

    .card-heading {
      align-items: flex-start;
      gap: 11px;
      padding-bottom: 19px;
      margin-bottom: 20px;
    }

    .card-heading-icon {
      width: 37px;
      height: 37px;
      border-radius: 11px;
    }

    .card-heading h2 {
      font-size: 14px;
      line-height: 1.5;
    }

    .card-heading p {
      font-size: 11px;
    }

    .form-grid {
      grid-template-columns: minmax(0,1fr);
      gap: 18px;
    }

    .form-fields {
      gap: 22px;
    }

    .exam-input {
      min-height: 46px;
    }

    .difficulty-options {
      grid-template-columns: minmax(0,1fr);
      gap: 8px;
    }

    .difficulty-option {
      min-height: 58px;
      padding: 10px 12px;
      gap: 11px;
    }

    .difficulty-symbol {
      width: 32px;
      height: 32px;
    }

    .difficulty-copy {
      gap: 3px;
    }

    .difficulty-copy strong {
      font-size: 12px;
    }

    .difficulty-copy small {
      font-size: 10px;
    }

    .difficulty-radio {
      margin-left: auto;
    }

    .setup-footer {
      align-items: stretch;
      flex-direction: column;
      gap: 17px;
      margin-top: 24px;
      padding-top: 19px;
    }

    .privacy-note {
      font-size: 10px;
    }

    .setup-footer .primary-button {
      width: 100%;
      min-height: 46px;
    }

    .loading-card {
      min-height: 310px;
      padding: 40px 18px;
      border-radius: 16px;
    }

    .quiz-summary {
      padding: 20px 17px;
      gap: 12px;
    }

    .quiz-summary h2 {
      font-size: 20px;
    }

    .progress-ring-wrap {
      width: 69px;
      height: 69px;
    }

    .progress-ring-label strong {
      font-size: 16px;
    }

    .progress-ring-label span {
      font-size: 8px;
    }

    .question-card {
      padding: 19px 15px;
      border-radius: 14px;
    }

    .question-heading {
      gap: 8px;
      margin-bottom: 15px;
    }

    .question-number {
      width: 29px;
      height: 29px;
    }

    .question-label {
      font-size: 8px;
      letter-spacing: 1px;
    }

    .answered-indicator {
      font-size: 9px;
    }

    .question-text {
      font-size: 14px;
      line-height: 1.75;
      margin-bottom: 16px;
    }

    .answer-option {
      min-height: 47px;
      padding: 10px;
      gap: 9px;
      border-radius: 10px;
    }

    .answer-letter {
      width: 25px;
      height: 25px;
    }

    .answer-text {
      font-size: 11px;
    }

    .answer-radio {
      width: 15px;
      height: 15px;
    }

    .quiz-submit-panel {
      align-items: stretch;
      flex-direction: column;
      padding: 16px;
      gap: 15px;
    }

    .submit-actions {
      display: grid;
      grid-template-columns: minmax(0,.8fr) minmax(0,1.2fr);
      width: 100%;
    }

    .submit-actions .primary-button,
    .submit-actions .secondary-button {
      min-width: 0;
      padding: 0 10px;
      font-size: 11px;
    }

    .results-hero {
      padding: 27px 15px 20px;
      border-radius: 16px;
    }

    .results-hero > h2 {
      font-size: 22px;
    }

    .results-description {
      font-size: 11px;
    }

    .score-overview {
      gap: 18px;
      padding: 19px 12px;
      margin-top: 23px;
    }

    .score-circle {
      width: 118px;
      height: 118px;
    }

    .score-circle-content strong {
      font-size: 29px;
    }

    .score-stats {
      gap: 16px;
    }

    .stat-icon {
      width: 29px;
      height: 29px;
      border-radius: 8px;
    }

    .stat-icon svg {
      width: 14px;
      height: 14px;
    }

    .score-stat {
      gap: 8px;
    }

    .score-stat strong {
      font-size: 15px;
    }

    .score-stat span:not(.stat-icon) {
      font-size: 9px;
    }

    .review-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 11px;
      margin-top: 29px;
    }

    .review-heading h2 {
      font-size: 19px;
    }

    .review-count {
      align-self: flex-start;
    }

    .review-status {
      gap: 4px;
      font-size: 9px;
    }

    .review-status svg {
      width: 13px;
      height: 13px;
    }

    .explanation-box {
      padding: 12px;
      gap: 9px;
    }

    .results-actions {
      display: grid;
      grid-template-columns: minmax(0,1fr) minmax(0,1fr);
      padding: 13px;
      gap: 9px;
    }

    .results-actions .primary-button,
    .results-actions .secondary-button {
      min-width: 0;
      padding: 0 10px;
      font-size: 11px;
    }

    .exam-footer {
      margin-top: 34px;
      font-size: 8px;
    }
  }

  @media (max-width: 390px) {
    .exam-nav {
      padding: 0 10px;
      gap: 5px;
    }

    .exam-brand {
      gap: 6px;
      font-size: 13px;
    }

    .brand-mark {
      width: 28px;
      height: 28px;
    }

    .nav-link {
      padding: 8px 6px;
      font-size: 10px;
    }

    .exam-container {
      width: calc(100% - 24px);
    }

    .header-meta {
      gap: 8px;
    }

    .quiz-summary {
      padding: 17px 13px;
    }

    .progress-ring-wrap {
      width: 61px;
      height: 61px;
    }

    .progress-ring-label strong {
      font-size: 14px;
    }

    .score-overview {
      flex-direction: column;
      gap: 22px;
    }

    .score-stats {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0,1fr));
      gap: 8px;
    }

    .score-stat {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 7px;
    }

    .score-stat > div {
      align-items: center;
      gap: 4px;
    }

    .score-stat span:not(.stat-icon) {
      font-size: 8px;
      line-height: 1.4;
    }

    .question-label {
      font-size: 7px;
      letter-spacing: .7px;
    }

    .answered-indicator {
      font-size: 8px;
      gap: 3px;
    }

    .answered-indicator svg {
      width: 12px;
      height: 12px;
    }

    .results-actions {
      grid-template-columns: minmax(0,1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .exam-page *,
    .exam-page *::before,
    .exam-page *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }
`;