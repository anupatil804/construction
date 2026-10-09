
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
      'The backend did not return JSON. Check your Railway API URL and backend routes.'
    );
  }

  return response.json();
}

export default function Admin() {
  const [admin, setAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [activeSection, setActiveSection] = useState('contacts');
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  const [summary, setSummary] = useState({
    enquiries: 0,
    feedback: 0,
    averageRating: 0,
  });
  const [summaryError, setSummaryError] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // Check whether an admin session already exists.
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/api/admin/session`, {
          method: 'GET',
          credentials: 'include',
        });

        const result = await readJsonResponse(response);

        if (!cancelled && response.ok && result.success && result.admin) {
          setAdmin(result.admin);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Session check failed:', error);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load dashboard summary.
  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setSummaryError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/summary`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await readJsonResponse(response);

      if (response.status === 401) {
        setAdmin(null);
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to load dashboard summary.'
        );
      }

      const summaryData = result.summary || result;

      setSummary({
        enquiries: Number(summaryData.totalContacts ?? summaryData.enquiries ?? 0),
        feedback: Number(summaryData.totalFeedback ?? summaryData.feedback ?? 0),
        averageRating: Number(summaryData.averageRating ?? 0),
      });
    } catch (error) {
      console.error('Dashboard summary error:', error);
      setSummaryError(error.message || 'Failed to load dashboard summary.');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Load enquiries or feedback records.
  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    setRecordsError('');

    try {
      const response = await fetch(
        `${API_URL}/api/admin/${activeSection}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const result = await readJsonResponse(response);

      if (response.status === 401) {
        setAdmin(null);
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load records.');
      }

      // The backend returns "contacts" for enquiries and "feedback" for feedback.
      const data =
        activeSection === 'contacts'
          ? result.contacts
          : result.feedback;

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Records loading error:', error);
      setRecords([]);
      setRecordsError(error.message || 'Failed to load records.');
    } finally {
      setLoadingRecords(false);
    }
  }, [activeSection]);

  // Load data after successful login.
  useEffect(() => {
    if (!admin) return;

    loadSummary();
  }, [admin, loadSummary]);

  useEffect(() => {
    if (!admin) return;

    loadRecords();
  }, [admin, loadRecords]);

  // Admin login.
  async function handleLogin(event) {
    event.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });

      const result = await readJsonResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed.');
      }

      setAdmin(
        result.admin || {
          username: loginForm.username,
        }
      );

      setLoginForm({
        username: '',
        password: '',
      });
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Unable to log in. Please try again.');
    } finally {
      setLoadingLogin(false);
    }
  }

  // Admin logout.
  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await readJsonResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Logout failed.');
      }

      setAdmin(null);
      setRecords([]);
      setSummary({
        enquiries: 0,
        feedback: 0,
        averageRating: 0,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setRecordsError(error.message || 'Unable to log out.');
    } finally {
      setLoggingOut(false);
    }
  }

  function formatDate(value) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  }

  // Login screen.
  if (!admin) {
    return (
      <main className="admin-page">
        <section className="admin-login">
          <h1>Admin Login</h1>
          <p>Log in to manage project enquiries and client feedback.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={loginForm.username}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    username: event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    password: event.target.value,
                  })
                }
                required
              />
            </div>

            {loginError && (
              <p className="admin-error" role="alert">
                {loginError}
              </p>
            )}

            <button type="submit" disabled={loadingLogin}>
              {loadingLogin ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  // Admin dashboard.
  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Welcome, {admin.username || 'Admin'}. Manage your website enquiries
            and feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <section className="admin-summary">
        <article className="summary-card">
          <h2>Project Enquiries</h2>
          <p className="summary-number">
            {loadingSummary ? '...' : summary.enquiries}
          </p>
          <span>Total enquiries received</span>
        </article>

        <article className="summary-card">
          <h2>Client Feedback</h2>
          <p className="summary-number">
            {loadingSummary ? '...' : summary.feedback}
          </p>
          <span>Total feedback received</span>
        </article>

        <article className="summary-card">
          <h2>Average Rating</h2>
          <p className="summary-number">
            {loadingSummary ? '...' : summary.averageRating.toFixed(1)}
            <span> / 5</span>
          </p>
          <div
            className="admin-stars"
            aria-label={`Average rating ${summary.averageRating.toFixed(1)} out of 5`}
          >
            {'★'.repeat(
              Math.max(
                0,
                Math.min(5, Math.round(summary.averageRating))
              )
            )}
            {'☆'.repeat(
              5 -
                Math.max(
                  0,
                  Math.min(5, Math.round(summary.averageRating))
                )
            )}
          </div>
        </article>
      </section>

      {summaryError && (
        <div className="admin-error" role="alert">
          {summaryError}
          <button type="button" onClick={loadSummary}>
            Try again
          </button>
        </div>
      )}

      <section className="admin-records">
        <div className="admin-records-header">
          <div>
            <h2>
              {activeSection === 'contacts'
                ? 'Project Enquiries'
                : 'Client Feedback'}
            </h2>
            <p>
              {records.length}{' '}
              {records.length === 1 ? 'record' : 'records'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              loadRecords();
              loadSummary();
            }}
            disabled={loadingRecords || loadingSummary}
          >
            {loadingRecords || loadingSummary ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <nav className="admin-tabs" aria-label="Dashboard sections">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                activeSection === section.id ? 'active' : ''
              }
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {recordsError && (
          <div className="admin-error" role="alert">
            {recordsError}
            <button type="button" onClick={loadRecords}>
              Try again
            </button>
          </div>
        )}

        {loadingRecords ? (
          <p className="admin-loading">Loading records...</p>
        ) : recordsError ? null : records.length === 0 ? (
          <div className="admin-empty">
            <h3>Nothing here yet</h3>
            <p>
              {activeSection === 'contacts'
                ? 'New enquiries will appear here.'
                : 'New client feedback will appear here.'}
            </p>
          </div>
        ) : activeSection === 'contacts' ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Project Type</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id ?? index}>
                    <td>{record.name || '—'}</td>
                    <td>{record.email || '—'}</td>
                    <td>{record.phone || '—'}</td>
                    <td>
                      {record.project_type ||
                        record.projectType ||
                        '—'}
                    </td>
                    <td>
                      {record.message ||
                        record.description ||
                        '—'}
                    </td>
                    <td>
                      {formatDate(
                        record.created_at ||
                          record.createdAt ||
                          record.date
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-feedback-list">
            {records.map((record, index) => (
              <article
                className="admin-feedback-card"
                key={record.id ?? index}
              >
                <div className="admin-feedback-header">
                  <h3>{record.name || 'Anonymous'}</h3>
                  <span className="admin-rating">
                    {'★'.repeat(
                      Math.max(
                        0,
                        Math.min(5, Number(record.rating) || 0)
                      )
                    )}
                    {'☆'.repeat(
                      5 -
                        Math.max(
                          0,
                          Math.min(5, Number(record.rating) || 0)
                        )
                    )}
                  </span>
                </div>

                <p>
                  {record.feedback ||
                    record.message ||
                    'No feedback text provided.'}
                </p>

                {record.project_type && (
                  <p>
                    <strong>Project:</strong> {record.project_type}
                  </p>
                )}

                <small>
                  {formatDate(
                    record.created_at ||
                      record.createdAt ||
                      record.date
                  )}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
