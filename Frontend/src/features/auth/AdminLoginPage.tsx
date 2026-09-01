import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useUserStore } from '../../store';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, personType } = useUserStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user is already authenticated, send to correct dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      if (personType === 'admin') navigate('/admin/overview', { replace: true });
      else if (personType === 'employee') navigate('/employee/home', { replace: true });
      else if (personType === 'citizen') navigate('/citizen/home', { replace: true });
    }
  }, [isAuthenticated, personType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Admin ID or Official Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: validate credentials via existing auth service
      await login(identifier.trim(), password, 'admin');
      // Step 2: route to MFA verification (keeps token in store; only navigates)
      navigate('/admin/mfa');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid Admin ID or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-page__content">
          <button className="login-page__back" onClick={handleBack}>
            ← Back to Selection
          </button>

          <Card className="login-page__card">
            <div className="login-page__header">
              <div className="login-page__logo">
                <span className="login-page__logo-icon">⚡</span>
              </div>
              <h1 className="login-page__title">Admin Sign In</h1>
              <p className="login-page__subtitle">
                Enter your credentials to access the Admin Console.
              </p>
            </div>

            <form className="login-page__form" onSubmit={handleSubmit}>
              {error && (
                <div className="login-page__error" role="alert">
                  <span>⚠️</span> {error}
                </div>
              )}

              <Input
                label="Admin ID / Official Email"
                type="text"
                id="admin-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g., ADM-2024-001 or admin@metrology.gov"
                required
                fullWidth
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                fullWidth
                autoComplete="current-password"
              />

              <div className="login-page__forgot">
                <button
                  type="button"
                  className="login-page__forgot-link"
                  onClick={() => alert('Password reset is handled by your system administrator.')}
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                LOGIN
              </Button>

              <p className="login-page__admin-note">
                <strong>Admin accounts</strong> are provisioned by the system administrator.
                Registration is not available for this role.
              </p>

              <p className="login-page__hint">
                <strong>Demo Credentials:</strong><br />
                Admin ID: <code>ADM-2024-001</code><br />
                Password: <code>adminPass123</code>
              </p>
            </form>
          </Card>

          <div className="login-page__footer">
            <p>Metrology Portal v1.0</p>
            <p>Restricted Access · For Authorised Administrators Only</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page__forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: calc(-1 * var(--space-2));
        }

        .login-page__forgot-link {
          background: none;
          border: none;
          color: var(--color-navy-600);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          padding: 0;
        }

        .login-page__forgot-link:hover {
          color: var(--color-navy-500);
          text-decoration: underline;
        }

        .login-page__admin-note {
          background-color: var(--color-warning-100, #fef3c7);
          border: 1px solid var(--color-warning-600, #d97706);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-gray-800, #1f2937);
          text-align: center;
          margin: 0;
        }

        .login-page__hint code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          background: rgba(15, 23, 42, 0.08);
          padding: 0 4px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;
