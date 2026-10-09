import { useCallback, useEffect, useState } from 'react';
import './Admin.css';

const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

const sections = [
  { id: 'contacts', label: 'Enquiries' },
  { id: 'feedback', label: 'Feedback' },
];

async function readJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      'The backend did not return JSON. Please check the Railway API URL and backend routes.'
    );
  }

  return response.json();
}

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('contacts');
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/admin/session`, {
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          if (!cancelled) setAuthenticated(true);
        } else if (response.status !== 401) {
          throw new Error('Could not check the admin session.');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoginError(
            error.message || 'Could not connect to the admin service. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    setRecordsError('');

    try {
      const response = await fetch(
        `${API_URL}/api/admin/${activeSection}`,
        { credentials: 'include' }
      );

      const result = await readJsonResponse(response);

      if (response.status === 401) {
        setAuthenticated(false);
        setRecords([]);
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Could not load records.');
      }

      setRecords(Array.isArray(result.records) ? result.records : []);
    } catch (error) {
      setRecordsError(
        error.message || 'Could not connect to the admin service.'
      );
    } finally {
      setLoadingRecords(false);
    }
  }, [activeSection]);

  useEffect(() => {
    if (authenticated && activeView !== 'dashboard') {
      loadRecords();
    }
  }, [authenticated, activeView, loadRecords]);

  useEffect(() => {
    if (!authenticated) return undefined;

    let cancelled = false;

    fetch(`${API_URL}/api/admin/summary`, {
      credentials: 'include',
    })
      .then(async (response) => {
        const result = await readJsonResponse(response);

        if (response.status === 401) {
          if (!cancelled) setAuthenticated(false);
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message || 'Could not load dashboard summary.'
          );
        }

        if (!cancelled) setSummary(result.summary);
      })
      .catch((error) => {
        if (!cancelled) {
          setSummaryError(
            error.message || 'Could not load dashboard summary.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        setLoginError(
          result.message || 'Sign-in failed. Please try again.'
        );
        return;
      }

      setPassword('');
      setAuthenticated(true);
    } catch (error) {
      setLoginError(
        error.message || 'Could not connect to the admin service. Please try again.'
      );
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Could not sign out.');
      }

      setAuthenticated(false);
      setRecords([]);
      setPassword('');
      setLoginError('');
      setSummary(null);
      setSummaryError('');
    } catch (error) {
      setRecordsError(error.message || 'Could not sign out.');
    }
  }

  function openSection(section) {
    setActiveSection(section);
    setActiveView(section);
    setRecordsError('');
  }

  if (checkingSession) {
    return (
      <main className="admin-page">
        <p className="admin-loading">Checking admin session…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-page admin-login-page">
        <section className="admin-login-card">
          <a href="/" className="admin-brand">
            oak &amp; stone<span> / admin</span>
          </a>

          <span className="admin-eyebrow">PRIVATE WORKSPACE</span>

          <h1>
            Welcome <em>back.</em>
          </h1>

          <p>Sign in to view project enquiries and client feedback.</p>

          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              Username
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {loginError && (
              <p className="admin-error" role="alert">
                {loginError}
              </p>
            )}

            <button className="admin-button" type="submit">
              Sign in <span aria-hidden="true">↗</span>
            </button>
          </form>

          <a className="admin-back-link" href="/">
            ← Back to website
          </a>
        </section>
      </main>
    );
  }

  const isContacts = activeSection === 'contacts';
  const isDashboard = activeView === 'dashboard';

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">
          <span className="admin-brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <span className="admin-brand-type">
            oak &amp; stone
            <span>build / admin</span>
          </span>
        </a>

        <span className="admin-sidebar-label">WORKSPACE</span>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <button
            type="button"
            className={
              isDashboard
                ? 'admin-side-link active'
                : 'admin-side-link'
            }
            aria-current={isDashboard ? 'page' : undefined}
            onClick={() => setActiveView('dashboard')}
          >
            <span aria-hidden="true">▦</span> Dashboard
          </button>

          {sections.map((section) => {
            const active = activeView === section.id;
            const count =
              section.id === 'contacts'
                ? summary?.enquiries
                : summary?.feedback;

            return (
              <button
                key={section.id}
                type="button"
                className={
                  active
                    ? 'admin-side-link active'
                    : 'admin-side-link'
                }
                aria-current={active ? 'page' : undefined}
                onClick={() => openSection(section.id)}
              >
                <span aria-hidden="true">
                  {section.id === 'contacts' ? '↗' : '☆'}
                </span>

                {section.label}

                {count !== undefined && (
                  <span className="admin-side-count">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <a href="/" className="admin-sidebar-back">
            ← Back to website
          </a>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Sign out <span aria-hidden="true">↗</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            {isDashboard
              ? 'Dashboard'
              : isContacts
                ? 'Project enquiries'
                : 'Client feedback'}
          </span>

          <span className="admin-topbar-status">
            <span /> Admin workspace
          </span>
        </header>

        <section className="admin-content">
          <div
            className={
              isDashboard
                ? 'admin-heading admin-dashboard-heading'
                : 'admin-heading'
            }
          >
            <div>
              <span className="admin-eyebrow">
                PRIVATE WORKSPACE /{' '}
                {isDashboard
                  ? 'DASHBOARD'
                  : isContacts
                    ? 'ENQUIRIES'
                    : 'FEEDBACK'}
              </span>

              <h1>
                {isDashboard ? (
                  <>
                    Good morning.
                    <br />
                    <em>Here’s your overview.</em>
                  </>
                ) : isContacts ? (
                  <>
                    Project
                    <br />
                    <em>enquiries.</em>
                  </>
                ) : (
                  <>
                    Client
                    <br />
                    <em>feedback.</em>
                  </>
                )}
              </h1>

              <p>
                {isDashboard
                  ? 'Keep track of project enquiries and hear directly from your clients.'
                  : isContacts
                    ? 'Review incoming project enquiries and get back to prospective clients.'
                    : 'Read what clients have shared about their experience with your team.'}
              </p>
            </div>

            {isDashboard && (
              <div className="admin-heading-art" aria-hidden="true">
                <span>O.</span>
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          {isDashboard ? (
            <>
              <section
                className="admin-overview"
                aria-label="Dashboard overview"
              >
                <button
                  className="admin-stat-card"
                  type="button"
                  onClick={() => openSection('contacts')}
                >
                  <span
                    className="admin-stat-icon admin-icon-enquiries"
                    aria-hidden="true"
                  >
                    ↗
                  </span>

                  <span className="admin-stat-label">
                    TOTAL ENQUIRIES
                  </span>

                  <strong>
                    {summary ? summary.enquiries : '—'}
                  </strong>

                  <span className="admin-stat-link">
                    View enquiries <span aria-hidden="true">↗</span>
                  </span>
                </button>

                <button
                  className="admin-stat-card"
                  type="button"
                  onClick={() => openSection('feedback')}
                >
                  <span
                    className="admin-stat-icon admin-icon-feedback"
                    aria-hidden="true"
                  >
                    “
                  </span>

                  <span className="admin-stat-label">
                    CLIENT FEEDBACK
                  </span>

                  <strong>
                    {summary ? summary.feedback : '—'}
                  </strong>

                  <span className="admin-stat-link">
                    Read feedback <span aria-hidden="true">↗</span>
                  </span>
                </button>

                <div className="admin-stat-card admin-stat-rating">
                  <span
                    className="admin-stat-icon admin-icon-rating"
                    aria-hidden="true"
                  >
                    ★
                  </span>

                  <span className="admin-stat-label">
                    AVERAGE RATING
                  </span>

                  <strong>
                    {summary
                      ? Number(summary.averageRating || 0).toFixed(1)
                      : '—'}
                    <small> / 5</small>
                  </strong>

                  <span className="admin-stat-stars">
                    {'★'.repeat(
                      Math.round(Number(summary?.averageRating || 0))
                    )}
                    {'☆'.repeat(
                      5 -
                        Math.round(
                          Number(summary?.averageRating || 0)
                        )
                    )}
                  </span>
                </div>
              </section>

              {summaryError && (
                <p className="admin-error admin-summary-error" role="alert">
                  {summaryError}
                </p>
              )}

              <section className="admin-dashboard-note">
                <div>
                  <span className="admin-eyebrow">
                    BUILT ON GOOD CONVERSATIONS
                  </span>

                  <h2>Every great project starts with a hello.</h2>

                  <p>
                    Review new project requests, follow up with potential
                    clients, and keep every conversation moving.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openSection('contacts')}
                >
                  Explore enquiries <span aria-hidden="true">↗</span>
                </button>
              </section>
            </>
          ) : (
            <section className="admin-records" aria-live="polite">
              <div className="admin-records-heading">
                <div>
                  <span className="admin-eyebrow">
                    {isContacts ? 'PROJECT ENQUIRIES' : 'CLIENT STORIES'}
                  </span>

                  <h2>{isContacts ? 'Enquiries' : 'Feedback'}</h2>
                </div>

                <div className="admin-record-controls">
                  <span className="admin-record-count">
                    {records.length}{' '}
                    {records.length === 1 ? 'record' : 'records'}
                  </span>

                  <button
                    type="button"
                    className="admin-refresh"
                    onClick={loadRecords}
                    disabled={loadingRecords}
                  >
                    {loadingRecords ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>

              {recordsError && (
                <p className="admin-error" role="alert">
                  {recordsError}
                </p>
              )}

              {loadingRecords ? (
                <p className="admin-empty">Loading records…</p>
              ) : recordsError ? null : records.length === 0 ? (
                <p className="admin-empty">
                  Nothing here yet. New{' '}
                  {isContacts ? 'enquiries' : 'feedback'} will appear here.
                </p>
              ) : (
                <div className="admin-record-list">
                  {records.map((record) => {
                    const recordName =
                      typeof record.name === 'string' &&
                      record.name.trim()
                        ? record.name
                        : 'Name not provided';

                    const projectType =
                      typeof record.project_type === 'string' &&
                      record.project_type.trim()
                        ? record.project_type
                        : 'Project type not provided';

                    const rating = Math.max(
                      0,
                      Math.min(5, Number(record.rating) || 0)
                    );

                    return (
                      <article
                        className="admin-record"
                        key={record.id}
                      >
                        <div className="admin-record-topline">
                          <span className="admin-record-id">
                            RECORD / {String(record.id).padStart(4, '0')}
                          </span>

                          {isContacts && record.email && (
                            <a
                              href={`mailto:${record.email}`}
                              className="admin-record-action"
                            >
                              Reply by email ↗
                            </a>
                          )}
                        </div>

                        <h3>{recordName}</h3>

                        <div className="admin-record-meta">
                          {isContacts && record.email && (
                            <a href={`mailto:${record.email}`}>
                              {record.email}
                            </a>
                          )}

                          {isContacts && record.phone && (
                            <a href={`tel:${record.phone}`}>
                              {record.phone}
                            </a>
                          )}

                          <span>
                            {isContacts
                              ? projectType
                              : `Project: ${projectType}`}
                          </span>

                          {!isContacts && (
                            <span
                              className="admin-rating"
                              aria-label={`${rating} out of 5 stars`}
                            >
                              {'★'.repeat(rating)}
                              {'☆'.repeat(5 - rating)}
                              <span> ({rating}/5)</span>
                            </span>
                          )}
                        </div>

                        <p className="admin-record-message">
                          {isContacts
                            ? record.message || 'No message provided.'
                            : record.feedback || 'No feedback provided.'}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default Admin;