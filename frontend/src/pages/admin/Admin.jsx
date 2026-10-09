import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }

    fetchData(true);
  }, [user, navigate, fetchData]);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);

    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully.');
      await fetchData();
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Unable to sign out. Please try again.');
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statItems = stats
    ? [
        {
          label: 'Total users',
          value: stats.totalUsers ?? 0,
          detail: 'Registered accounts',
          color: 'blue',
        },
        {
          label: 'Students',
          value: stats.totalStudents ?? 0,
          detail: 'Student accounts',
          color: 'cyan',
        },
        {
          label: 'Teachers',
          value: stats.totalTeachers ?? 0,
          detail: 'Teaching accounts',
          color: 'violet',
        },
        {
          label: 'Syllabuses',
          value: stats.totalSyllabuses ?? 0,
          detail: 'Learning materials',
          color: 'indigo',
        },
        {
          label: 'AI messages',
          value: stats.totalMessages ?? 0,
          detail: 'Messages generated',
          color: 'teal',
        },
      ]
    : [];

  if (loading) {
    return (
      <>
        <main className="admin-loading-screen">
          <div className="admin-loading-orbit">
            <div className="admin-loading-spinner" />
          </div>
          <span className="admin-loading-brand">SyllabusAI</span>
          <p>Preparing your admin workspace</p>
          <div className="admin-loading-track">
            <span />
          </div>
        </main>

        <style>{adminCss}</style>
      </>
    );
  }

  return (
    <div className="admin-root">
      <style>{adminCss}</style>

      <div className="admin-background-grid" aria-hidden="true" />
      <div className="admin-background-glow admin-glow-one" aria-hidden="true" />
      <div className="admin-background-glow admin-glow-two" aria-hidden="true" />

      <header className="admin-nav">
        <div className="admin-nav-inner">
          <div className="admin-nav-left">
            <Link to="/dashboard" className="admin-brand" aria-label="SyllabusAI dashboard">
              <span className="admin-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 2.8 2.8 7.4 12 12l9.2-4.6L12 2.8Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m2.8 12 9.2 4.7 9.2-4.7M2.8 16.6l9.2 4.6 9.2-4.6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="admin-brand-name">SyllabusAI</span>
            </Link>

            <span className="admin-nav-divider" aria-hidden="true" />

            <span className="admin-context">
              <span className="admin-context-dot" />
              Administration
            </span>
          </div>

          <div className="admin-nav-right">
            <div className="admin-account">
              <div className="admin-account-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>

              <div className="admin-account-details">
                <span className="admin-account-name">{user?.name || 'Administrator'}</span>
                <span className="admin-account-role">Platform admin</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="admin-logout"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10 17l5-5-5-5M15 12H3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          <section className="admin-page-header">
            <div className="admin-header-copy">
              <div className="admin-eyebrow">
                <span className="admin-eyebrow-line" />
                CONTROL CENTER
              </div>

              <h1>
                Admin <span>overview</span>
              </h1>

              <p>
                Monitor your platform, review activity, and manage user accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchData()}
              disabled={refreshing}
              className="admin-refresh"
              aria-label="Refresh dashboard data"
            >
              <svg
                className={refreshing ? 'admin-refresh-icon is-refreshing' : 'admin-refresh-icon'}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 7v5h-5M4 17v-5h5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.1 9a6.5 6.5 0 0 1 10.9-2L20 12M4 12l3 5a6.5 6.5 0 0 0 10.9-2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{refreshing ? 'Refreshing' : 'Refresh data'}</span>
            </button>
          </section>

          <section className="admin-metrics-section" aria-label="Platform statistics">
            <div className="admin-section-heading">
              <div>
                <h2>Platform metrics</h2>
                <p>A snapshot of your platform at a glance.</p>
              </div>

              <span className="admin-live-indicator">
                <span />
                Overview
              </span>
            </div>

            {stats ? (
              <div className="admin-stats-grid">
                {statItems.map((stat, index) => (
                  <article
                    key={stat.label}
                    className={`admin-stat-card admin-stat-${stat.color}`}
                    style={{ '--admin-card-index': index }}
                  >
                    <div className="admin-stat-top">
                      <span className="admin-stat-label">{stat.label}</span>

                      <span className="admin-stat-mark" aria-hidden="true">
                        {index === 0 && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}

                        {index === 1 && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="m12 3 9 5-9 5-9-5 9-5ZM5 12l7 4 7-4M5 16l7 4 7-4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}

                        {index === 2 && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}

                        {index === 3 && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 3v5h5M9 13h6M9 17h6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}

                        {index === 4 && (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 3a9 9 0 0 0-9 9v4a3 3 0 0 0 3 3h1v-7H6a6 6 0 0 1 12 0h-1v7h1a3 3 0 0 0 3-3v-4a9 9 0 0 0-9-9Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18 19a6 6 0 0 1-6 2"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>
                    </div>

                    <div className="admin-stat-value">
                      {Number(stat.value || 0).toLocaleString()}
                    </div>

                    <div className="admin-stat-bottom">
                      <span className="admin-stat-indicator" />
                      <span>{stat.detail}</span>
                    </div>

                    <span className="admin-stat-decoration" aria-hidden="true" />
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-no-stats">
                <span>Statistics are currently unavailable.</span>
                <button type="button" onClick={() => fetchData()}>
                  Try again
                </button>
              </div>
            )}
          </section>

          <section className="admin-users-section">
            <div className="admin-users-header">
              <div className="admin-users-title-group">
                <div className="admin-users-heading-row">
                  <h2>User management</h2>
                  <span className="admin-total-pill">
                    {users.length.toLocaleString()}
                  </span>
                </div>

                <p>Search and manage registered platform accounts.</p>
              </div>

              <div className="admin-users-tools">
                <label className="admin-search">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="10.8"
                      cy="10.8"
                      r="6.8"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="m16 16 4.2 4.2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    aria-label="Search users by name or email"
                  />

                  {search && (
                    <button
                      type="button"
                      className="admin-clear-search"
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                    >
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="m7 7 10 10M17 7 7 17"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </label>
              </div>
            </div>

            <div className="admin-table-summary">
              <span>
                Showing <strong>{filtered.length}</strong> of{' '}
                <strong>{users.length}</strong> accounts
              </span>

              {search && (
                <button
                  type="button"
                  className="admin-filter-chip"
                  onClick={() => setSearch('')}
                >
                  Filter: {search}
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m7 7 10 10M17 7 7 17"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Role</th>
                    <th scope="col">Branch</th>
                    <th scope="col">Date joined</th>
                    <th scope="col" className="admin-action-heading">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((u) => {
                    const role = u.role?.toLowerCase();
                    const roleClass =
                      role === 'admin'
                        ? 'admin-role-admin'
                        : role === 'teacher'
                          ? 'admin-role-teacher'
                          : 'admin-role-student';

                    return (
                      <tr key={u._id} className="admin-table-row">
                        <td>
                          <div className="admin-user-info">
                            <div
                              className={`admin-user-avatar ${roleClass}`}
                              aria-hidden="true"
                            >
                              {u.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
                            </div>

                            <div className="admin-user-identity">
                              <span className="admin-user-name">
                                {u.name || 'Unnamed user'}
                              </span>
                              <span className="admin-user-email">
                                {u.email || 'No email available'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`admin-role-badge ${roleClass}`}>
                            <span />
                            {u.role || 'student'}
                          </span>
                        </td>

                        <td>
                          <span className="admin-branch">
                            {u.branch || '—'}
                          </span>
                        </td>

                        <td>
                          <span className="admin-date">
                            {u.createdAt && !Number.isNaN(new Date(u.createdAt).getTime())
                              ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </td>

                        <td className="admin-action-cell">
                          {role !== 'admin' ? (
                            <button
                              type="button"
                              onClick={() => deleteUser(u._id)}
                              disabled={deletingId === u._id}
                              className="admin-delete-button"
                              aria-label={`Delete ${u.name || 'user'}`}
                            >
                              {deletingId === u._id ? (
                                <span className="admin-button-spinner" />
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path
                                    d="M4 7h16M10 11v6M14 11v6M5.5 7l1 13h11l1-13M9 7V4h6v3"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                              <span>
                                {deletingId === u._id ? 'Deleting' : 'Delete'}
                              </span>
                            </button>
                          ) : (
                            <span className="admin-protected-label">
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <rect
                                  x="5"
                                  y="10"
                                  width="14"
                                  height="10"
                                  rx="2"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                />
                                <path
                                  d="M8 10V7a4 4 0 0 1 8 0v3"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                />
                              </svg>
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle
                        cx="10.8"
                        cy="10.8"
                        r="6.8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="m16 16 4 4M8 11h5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <h3>{search ? 'No matching users' : 'No users found'}</h3>

                  <p>
                    {search
                      ? 'Try another name or email address, or clear your search.'
                      : 'Registered accounts will appear here.'}
                  </p>

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="admin-empty-reset"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="admin-table-footer">
              <span className="admin-footer-dot" />
              <span>
                {search ? 'Search results updated as you type' : 'User directory'}
              </span>
              <span className="admin-footer-spacer" />
              <span>
                {filtered.length} {filtered.length === 1 ? 'account' : 'accounts'}
              </span>
            </div>
          </section>

          <footer className="admin-footer">
            <span className="admin-footer-brand">SyllabusAI</span>
            <span className="admin-footer-separator">/</span>
            <span>Administration workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

const adminCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;550;600;650;700;750;800&display=swap');

  .admin-root,
  .admin-loading-screen {
    --admin-bg: #080b12;
    --admin-panel: rgba(15, 19, 29, 0.88);
    --admin-border: rgba(255, 255, 255, 0.075);
    --admin-border-strong: rgba(255, 255, 255, 0.11);
    --admin-text: #eef2fb;
    --admin-muted: #8993a8;
    --admin-subtle: #596478;
    --admin-blue: #9eb5ff;
    min-height: 100vh;
    color: var(--admin-text);
    background: var(--admin-bg);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .admin-root *,
  .admin-root *::before,
  .admin-root *::after,
  .admin-loading-screen *,
  .admin-loading-screen *::before,
  .admin-loading-screen *::after {
    box-sizing: border-box;
  }

  .admin-root button,
  .admin-root input {
    font: inherit;
  }

  .admin-root button {
    -webkit-tap-highlight-color: transparent;
  }

  .admin-root button:focus-visible,
  .admin-root a:focus-visible,
  .admin-root input:focus-visible {
    outline: 2px solid rgba(154, 177, 255, 0.85);
    outline-offset: 3px;
  }

  .admin-background-grid {
    position: fixed;
    z-index: 0;
    inset: 0;
    pointer-events: none;
    opacity: 0.38;
    background-image:
      linear-gradient(rgba(150, 169, 208, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(150, 169, 208, 0.035) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.7) 62%, transparent 100%);
  }

  .admin-background-glow {
    position: fixed;
    z-index: 0;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(120px);
    opacity: 0.09;
  }

  .admin-glow-one {
    top: -290px;
    left: 13%;
    background: #607fff;
  }

  .admin-glow-two {
    top: 400px;
    right: -330px;
    background: #7863f5;
  }

  .admin-nav {
    position: sticky;
    z-index: 20;
    top: 0;
    height: 70px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
    background: rgba(8, 11, 18, 0.82);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .admin-nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1440px;
    height: 100%;
    margin: 0 auto;
    padding: 0 48px;
  }

  .admin-nav-left,
  .admin-nav-right,
  .admin-brand,
  .admin-account,
  .admin-context,
  .admin-logout {
    display: flex;
    align-items: center;
  }

  .admin-nav-left {
    gap: 20px;
    min-width: 0;
  }

  .admin-brand {
    flex-shrink: 0;
    gap: 10px;
    color: inherit;
    text-decoration: none;
  }

  .admin-brand-icon {
    display: grid;
    width: 35px;
    height: 35px;
    place-items: center;
    border: 1px solid rgba(145, 169, 255, 0.2);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(109, 140, 255, 0.17), rgba(109, 140, 255, 0.04));
    color: #a6bcff;
  }

  .admin-brand-icon svg {
    width: 19px;
    height: 19px;
  }

  .admin-brand-name {
    font-size: 16px;
    font-weight: 750;
    letter-spacing: -0.65px;
  }

  .admin-nav-divider {
    width: 1px;
    height: 25px;
    background: rgba(255, 255, 255, 0.105);
  }

  .admin-context {
    gap: 8px;
    color: #a4aec0;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  .admin-context-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a6b8ff;
    box-shadow: 0 0 12px rgba(166, 184, 255, 0.45);
  }

  .admin-nav-right {
    gap: 18px;
  }

  .admin-account {
    gap: 10px;
    min-width: 0;
  }

  .admin-account-avatar {
    display: grid;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(160, 176, 255, 0.2);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(126, 149, 255, 0.2), rgba(126, 149, 255, 0.06));
    color: #d4dcff;
    font-size: 12px;
    font-weight: 700;
  }

  .admin-account-details {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .admin-account-name {
    max-width: 180px;
    overflow: hidden;
    color: #e2e7f2;
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-account-role {
    color: #737f94;
    font-size: 10px;
  }

  .admin-logout {
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
    color: #9ca6ba;
    font-size: 11px;
    font-weight: 550;
    cursor: pointer;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .admin-logout:hover {
    border-color: rgba(159, 178, 255, 0.24);
    background: rgba(151, 171, 255, 0.07);
    color: #e1e7f8;
  }

  .admin-logout svg {
    width: 15px;
    height: 15px;
  }

  .admin-main {
    position: relative;
    z-index: 1;
  }

  .admin-container {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    padding: 45px 48px 24px;
  }

  .admin-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 37px;
    animation: admin-enter 450ms ease both;
  }

  .admin-eyebrow {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 13px;
    color: #a8b8f8;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
  }

  .admin-eyebrow-line {
    width: 17px;
    height: 1px;
    background: #96adff;
  }

  .admin-page-header h1 {
    margin: 0;
    color: #f1f4fc;
    font-size: clamp(30px, 3vw, 39px);
    font-weight: 700;
    letter-spacing: -1.8px;
    line-height: 1.13;
  }

  .admin-page-header h1 span {
    color: #a5b5f7;
  }

  .admin-page-header p {
    margin: 12px 0 0;
    color: var(--admin-muted);
    font-size: 13px;
    line-height: 1.7;
  }

  .admin-refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 39px;
    padding: 0 14px;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.105);
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.035);
    color: #b8c1d2;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .admin-refresh:hover:not(:disabled) {
    border-color: rgba(155, 177, 255, 0.28);
    background: rgba(151, 171, 255, 0.075);
    color: #e4eaff;
  }

  .admin-refresh:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .admin-refresh svg {
    width: 15px;
    height: 15px;
  }

  .admin-refresh-icon.is-refreshing {
    animation: admin-spin 900ms linear infinite;
  }

  .admin-metrics-section {
    margin-bottom: 37px;
    animation: admin-enter 500ms ease both;
  }

  .admin-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 17px;
  }

  .admin-section-heading h2,
  .admin-users-title-group h2 {
    margin: 0;
    color: #e9edf7;
    font-size: 15px;
    font-weight: 650;
    letter-spacing: -0.35px;
  }

  .admin-section-heading p,
  .admin-users-title-group p {
    margin: 6px 0 0;
    color: #727d91;
    font-size: 11px;
    line-height: 1.6;
  }

  .admin-live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 9px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 20px;
    color: #8e9ab0;
    font-size: 10px;
    white-space: nowrap;
  }

  .admin-live-indicator span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #8da8ff;
  }

  .admin-stats-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 13px;
  }

  .admin-stat-card {
    position: relative;
    min-width: 0;
    min-height: 145px;
    padding: 18px 17px 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012));
    transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
    animation: admin-stat-enter 500ms ease both;
    animation-delay: calc(var(--admin-card-index, 0) * 55ms);
  }

  .admin-stat-card:hover {
    transform: translateY(-3px);
    border-color: rgba(157, 177, 255, 0.2);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018));
  }

  .admin-stat-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .admin-stat-label {
    overflow: hidden;
    color: #9da7ba;
    font-size: 11px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-stat-mark {
    display: grid;
    width: 29px;
    height: 29px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.035);
    color: #b4c5ff;
  }

  .admin-stat-mark svg {
    width: 16px;
    height: 16px;
  }

  .admin-stat-value {
    position: relative;
    z-index: 1;
    margin-top: 17px;
    color: #f0f3fb;
    font-size: clamp(24px, 2.4vw, 30px);
    font-weight: 700;
    letter-spacing: -1.1px;
    line-height: 1.05;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }

  .admin-stat-bottom {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 12px;
    color: #707c91;
    font-size: 9.5px;
    line-height: 1.4;
  }

  .admin-stat-indicator {
    width: 5px;
    height: 5px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #8caaff;
    opacity: 0.85;
  }

  .admin-stat-decoration {
    position: absolute;
    right: -32px;
    bottom: -58px;
    width: 115px;
    height: 115px;
    border: 1px solid rgba(144, 166, 255, 0.08);
    border-radius: 50%;
    pointer-events: none;
  }

  .admin-stat-decoration::after {
    position: absolute;
    inset: 13px;
    border: 1px solid rgba(144, 166, 255, 0.06);
    border-radius: 50%;
    content: "";
  }

  .admin-stat-cyan .admin-stat-mark { color: #8bd6f2; }
  .admin-stat-cyan .admin-stat-indicator { background: #77cfe9; }
  .admin-stat-violet .admin-stat-mark { color: #c0a8ff; }
  .admin-stat-violet .admin-stat-indicator { background: #b39bff; }
  .admin-stat-indigo .admin-stat-mark { color: #aeb9ff; }
  .admin-stat-indigo .admin-stat-indicator { background: #a2b2ff; }
  .admin-stat-teal .admin-stat-mark { color: #83d8c6; }
  .admin-stat-teal .admin-stat-indicator { background: #83d8c6; }

  .admin-no-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 19px 20px;
    border: 1px solid var(--admin-border);
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.02);
    color: #919caf;
    font-size: 12px;
  }

  .admin-no-stats button {
    padding: 7px 10px;
    border: 1px solid rgba(155, 177, 255, 0.2);
    border-radius: 8px;
    background: rgba(151, 171, 255, 0.06);
    color: #c1ccff;
    font-size: 11px;
    cursor: pointer;
  }

  .admin-users-section {
    overflow: hidden;
    border: 1px solid var(--admin-border);
    border-radius: 17px;
    background: rgba(13, 17, 26, 0.83);
    box-shadow: 0 22px 70px rgba(0, 0, 0, 0.12);
    animation: admin-enter 550ms ease both;
  }

  .admin-users-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 24px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
  }

  .admin-users-title-group {
    min-width: 0;
  }

  .admin-users-heading-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .admin-users-heading-row h2 {
    font-size: 15px;
  }

  .admin-total-pill {
    display: inline-flex;
    min-width: 25px;
    height: 23px;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
    border: 1px solid rgba(151, 171, 255, 0.17);
    border-radius: 7px;
    background: rgba(151, 171, 255, 0.07);
    color: #b9c7ff;
    font-size: 10px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  .admin-users-title-group p {
    margin-top: 6px;
  }

  .admin-users-tools {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .admin-search {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 255px;
    min-height: 39px;
    padding: 0 11px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
    transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .admin-search:focus-within {
    border-color: rgba(147, 170, 255, 0.48);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 0 0 3px rgba(147, 170, 255, 0.07);
  }

  .admin-search > svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: #77839a;
  }

  .admin-search input {
    width: 100%;
    min-width: 0;
    padding: 9px 0;
    border: 0;
    outline: none;
    background: transparent;
    color: #e4e9f5;
    font-size: 11px;
    box-shadow: none;
  }

  .admin-search input::placeholder {
    color: #697489;
  }

  .admin-search input::-webkit-search-cancel-button {
    display: none;
  }

  .admin-clear-search {
    display: grid;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #8894a9;
    cursor: pointer;
  }

  .admin-clear-search:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e0e6f4;
  }

  .admin-clear-search svg {
    width: 13px;
    height: 13px;
  }

  .admin-table-summary {
    display: flex;
    min-height: 42px;
    align-items: center;
    gap: 12px;
    padding: 8px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.045);
    color: #737e93;
    font-size: 10px;
  }

  .admin-table-summary strong {
    color: #cbd3e2;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .admin-filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    max-width: 240px;
    overflow: hidden;
    padding: 4px 7px 4px 9px;
    border: 1px solid rgba(151, 171, 255, 0.16);
    border-radius: 7px;
    background: rgba(151, 171, 255, 0.055);
    color: #aebdff;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  .admin-filter-chip svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  .admin-table-scroll {
    width: 100%;
    overflow-x: auto;
    scrollbar-color: rgba(145, 161, 194, 0.2) transparent;
    scrollbar-width: thin;
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .admin-table thead {
    background: rgba(255, 255, 255, 0.018);
  }

  .admin-table th {
    padding: 13px 19px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
    color: #737f94;
    font-size: 9px;
    font-weight: 650;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .admin-table th:first-child,
  .admin-table td:first-child {
    padding-left: 24px;
  }

  .admin-table th:last-child,
  .admin-table td:last-child {
    padding-right: 24px;
  }

  .admin-table-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.042);
    transition: background 150ms ease;
  }

  .admin-table-row:last-child {
    border-bottom: 0;
  }

  .admin-table-row:hover {
    background: rgba(143, 164, 255, 0.028);
  }

  .admin-table td {
    padding: 15px 19px;
    color: #9ca6ba;
    font-size: 11px;
    vertical-align: middle;
  }

  .admin-user-info {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 210px;
  }

  .admin-user-avatar {
    display: grid;
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(151, 171, 255, 0.16);
    border-radius: 11px;
    font-size: 11px;
    font-weight: 650;
  }

  .admin-role-admin {
    border-color: rgba(244, 173, 126, 0.2);
    background: rgba(244, 173, 126, 0.075);
    color: #efbd99;
  }

  .admin-role-teacher {
    border-color: rgba(183, 154, 255, 0.2);
    background: rgba(164, 133, 255, 0.075);
    color: #c5b0ff;
  }

  .admin-role-student {
    border-color: rgba(131, 174, 255, 0.2);
    background: rgba(116, 160, 255, 0.075);
    color: #a8c4ff;
  }

  .admin-user-identity {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  .admin-user-name {
    max-width: 210px;
    overflow: hidden;
    color: #e0e5f0;
    font-size: 11px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-user-email {
    max-width: 220px;
    overflow: hidden;
    color: #717d91;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border: 1px solid;
    border-radius: 7px;
    font-size: 9px;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .admin-role-badge > span {
    width: 5px;
    height: 5px;
    flex-shrink: 0;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.85;
  }

  .admin-branch,
  .admin-date {
    color: #8d98ab;
    font-size: 10px;
    white-space: nowrap;
  }

  .admin-date {
    font-variant-numeric: tabular-nums;
  }

  .admin-action-heading,
  .admin-action-cell {
    text-align: right;
  }

  .admin-delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 29px;
    padding: 0 9px;
    border: 1px solid rgba(255, 255, 255, 0.085);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
    color: #9da7ba;
    font-size: 10px;
    font-weight: 550;
    cursor: pointer;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
  }

  .admin-delete-button:hover:not(:disabled) {
    border-color: rgba(244, 173, 126, 0.28);
    background: rgba(244, 173, 126, 0.08);
    color: #efc1a0;
  }

  .admin-delete-button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .admin-delete-button svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  .admin-button-spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    border-top-color: #c4cce0;
    border-radius: 50%;
    animation: admin-spin 700ms linear infinite;
  }

  .admin-protected-label {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    color: #727f94;
    font-size: 9px;
    white-space: nowrap;
  }

  .admin-protected-label svg {
    width: 13px;
    height: 13px;
  }

  .admin-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 245px;
    padding: 35px 20px;
    text-align: center;
  }

  .admin-empty-icon {
    display: grid;
    width: 47px;
    height: 47px;
    margin-bottom: 15px;
    place-items: center;
    border: 1px solid rgba(151, 171, 255, 0.14);
    border-radius: 15px;
    background: rgba(151, 171, 255, 0.055);
    color: #9baeff;
  }

  .admin-empty-icon svg {
    width: 21px;
    height: 21px;
  }

  .admin-empty-state h3 {
    margin: 0;
    color: #dbe2ef;
    font-size: 13px;
    font-weight: 650;
    letter-spacing: -0.2px;
  }

  .admin-empty-state p {
    max-width: 310px;
    margin: 8px 0 0;
    color: #79859a;
    font-size: 11px;
    line-height: 1.7;
  }

  .admin-empty-reset {
    margin-top: 16px;
    padding: 7px 11px;
    border: 1px solid rgba(151, 171, 255, 0.2);
    border-radius: 8px;
    background: rgba(151, 171, 255, 0.06);
    color: #bdc9ff;
    font-size: 10px;
    font-weight: 550;
    cursor: pointer;
    transition: background 160ms ease;
  }

  .admin-empty-reset:hover {
    background: rgba(151, 171, 255, 0.12);
  }

  .admin-table-footer {
    display: flex;
    min-height: 43px;
    align-items: center;
    gap: 8px;
    padding: 0 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
    color: #69758a;
    font-size: 10px;
  }

  .admin-footer-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #849de7;
  }

  .admin-footer-spacer {
    flex: 1;
  }

  .admin-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 28px 0 10px;
    color: #586378;
    font-size: 9px;
    letter-spacing: 0.2px;
  }

  .admin-footer-brand {
    color: #98a7c4;
    font-weight: 700;
    letter-spacing: -0.15px;
  }

  .admin-footer-separator {
    color: #7d8aab;
  }

  .admin-loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 13px;
    padding: 24px;
    background:
      radial-gradient(ellipse at 50% 42%, rgba(92, 117, 216, 0.09), transparent 37%),
      #080b12;
  }

  .admin-loading-orbit {
    display: grid;
    width: 47px;
    height: 47px;
    place-items: center;
    border: 1px solid rgba(151, 171, 255, 0.12);
    border-radius: 15px;
    background: rgba(151, 171, 255, 0.045);
  }

  .admin-loading-spinner {
    width: 19px;
    height: 19px;
    border: 2px solid rgba(151, 171, 255, 0.17);
    border-top-color: #a9bbff;
    border-radius: 50%;
    animation: admin-spin 800ms linear infinite;
  }

  .admin-loading-brand {
    margin-top: 4px;
    color: #e0e6f5;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .admin-loading-screen p {
    margin: 0;
    color: #7e899e;
    font-size: 11px;
  }

  .admin-loading-track {
    width: 100px;
    height: 2px;
    margin-top: 7px;
    overflow: hidden;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.06);
  }

  .admin-loading-track span {
    display: block;
    width: 45%;
    height: 100%;
    border-radius: inherit;
    background: #96adff;
    animation: admin-loading-progress 1.2s ease-in-out infinite;
  }

  @keyframes admin-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes admin-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes admin-stat-enter {
    from { opacity: 0; transform: translateY(7px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes admin-loading-progress {
    0% { transform: translateX(-110%); }
    100% { transform: translateX(330%); }
  }

  @media (min-width: 1440px) {
    .admin-container {
      padding-top: 54px;
    }

    .admin-stat-card {
      min-height: 151px;
      padding: 20px 19px 17px;
    }

    .admin-table td {
      padding-top: 17px;
      padding-bottom: 17px;
    }
  }

  @media (max-width: 1100px) {
    .admin-nav-inner {
      padding-right: 30px;
      padding-left: 30px;
    }

    .admin-container {
      padding-right: 30px;
      padding-left: 30px;
    }

    .admin-stats-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .admin-stat-card {
      min-height: 137px;
    }

    .admin-stat-value {
      font-size: 28px;
    }

    .admin-table {
      min-width: 780px;
    }
  }

  @media (max-width: 700px) {
    .admin-nav {
      height: 63px;
    }

    .admin-nav-inner {
      padding-right: 19px;
      padding-left: 19px;
    }

    .admin-nav-left {
      gap: 12px;
    }

    .admin-brand {
      gap: 8px;
    }

    .admin-brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
    }

    .admin-brand-name {
      font-size: 14px;
    }

    .admin-nav-divider {
      height: 21px;
    }

    .admin-context {
      gap: 6px;
      font-size: 10px;
    }

    .admin-nav-right {
      gap: 10px;
    }

    .admin-account {
      gap: 0;
    }

    .admin-account-avatar {
      width: 31px;
      height: 31px;
      border-radius: 10px;
    }

    .admin-account-details {
      display: none;
    }

    .admin-logout {
      gap: 6px;
      min-height: 33px;
      padding: 0 9px;
      font-size: 10px;
    }

    .admin-container {
      padding: 34px 20px 21px;
    }

    .admin-page-header {
      align-items: flex-start;
      margin-bottom: 29px;
    }

    .admin-page-header h1 {
      font-size: clamp(28px, 6vw, 36px);
    }

    .admin-page-header p {
      max-width: 420px;
      font-size: 12px;
    }

    .admin-refresh {
      min-width: 38px;
      width: 38px;
      height: 38px;
      min-height: 38px;
      padding: 0;
    }

    .admin-refresh span {
      display: none;
    }

    .admin-section-heading {
      margin-bottom: 14px;
    }

    .admin-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .admin-stat-card {
      min-height: 130px;
      padding: 16px 15px 14px;
      border-radius: 13px;
    }

    .admin-stat-card:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }

    .admin-stat-label {
      font-size: 10.5px;
    }

    .admin-stat-mark {
      width: 27px;
      height: 27px;
    }

    .admin-stat-value {
      margin-top: 15px;
      font-size: 27px;
    }

    .admin-stat-bottom {
      margin-top: 10px;
      font-size: 9px;
    }

    .admin-metrics-section {
      margin-bottom: 28px;
    }

    .admin-users-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 17px;
      padding: 20px;
    }

    .admin-users-tools,
    .admin-search {
      width: 100%;
    }

    .admin-search {
      min-height: 41px;
    }

    .admin-table-summary {
      flex-wrap: wrap;
      padding-right: 20px;
      padding-left: 20px;
    }

    .admin-table {
      min-width: 720px;
    }

    .admin-table th:first-child,
    .admin-table td:first-child {
      padding-left: 20px;
    }

    .admin-table th:last-child,
    .admin-table td:last-child {
      padding-right: 20px;
    }

    .admin-table-footer {
      padding-right: 20px;
      padding-left: 20px;
    }
  }

  @media (max-width: 420px) {
    .admin-nav-inner {
      padding-right: 14px;
      padding-left: 14px;
    }

    .admin-nav-left {
      gap: 9px;
    }

    .admin-brand-name {
      font-size: 13px;
    }

    .admin-context {
      font-size: 9px;
    }

    .admin-nav-right {
      gap: 7px;
    }

    .admin-logout {
      gap: 5px;
      padding: 0 7px;
      font-size: 9px;
    }

    .admin-logout svg {
      width: 13px;
      height: 13px;
    }

    .admin-container {
      padding: 29px 14px 18px;
    }

    .admin-page-header {
      gap: 10px;
    }

    .admin-eyebrow {
      margin-bottom: 10px;
      font-size: 8px;
      letter-spacing: 1.5px;
    }

    .admin-page-header h1 {
      font-size: 28px;
      letter-spacing: -1.3px;
    }

    .admin-page-header p {
      max-width: 270px;
      font-size: 11px;
    }

    .admin-stats-grid {
      gap: 8px;
    }

    .admin-stat-card {
      min-height: 124px;
      padding: 13px 12px;
    }

    .admin-stat-label {
      font-size: 10px;
    }

    .admin-stat-mark {
      width: 25px;
      height: 25px;
      border-radius: 8px;
    }

    .admin-stat-mark svg {
      width: 14px;
      height: 14px;
    }

    .admin-stat-value {
      font-size: 25px;
    }

    .admin-stat-bottom {
      font-size: 8.5px;
    }

    .admin-users-header {
      padding: 17px 14px;
    }

    .admin-table-summary,
    .admin-table-footer {
      padding-right: 14px;
      padding-left: 14px;
    }

    .admin-footer {
      flex-wrap: wrap;
      gap: 7px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-root *,
    .admin-root *::before,
    .admin-root *::after,
    .admin-loading-screen *,
    .admin-loading-screen *::before,
    .admin-loading-screen *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
`;