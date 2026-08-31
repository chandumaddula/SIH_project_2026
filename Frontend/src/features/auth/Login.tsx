import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store';
import { PersonType } from './PersonSelector';

const roleConfig: Record<PersonType, {
  title: string;
  subtitle: string;
  identifierLabel: string;
  identifierPlaceholder: string;
}> = {
  employee: {
    title: 'Employee Sign In',
    subtitle: 'Enter your credentials to access the Metrology Dashboard',
    identifierLabel: 'Employee ID or Email',
    identifierPlaceholder: 'e.g., MET-2024-001 or officer@metrology.gov.in',
  },
  citizen: {
    title: 'Citizen Sign In',
    subtitle: 'Enter your credentials to access the Citizen Portal',
    identifierLabel: 'Citizen ID or Email',
    identifierPlaceholder: 'e.g., CIT-2024-001 or citizen@gmail.com',
  },
  admin: {
    title: 'Admin Sign In',
    subtitle: 'Enter your credentials to access the Admin Dashboard',
    identifierLabel: 'Admin ID or Email',
    identifierPlaceholder: 'e.g., ADM-2024-001 or admin@metrology.gov.in',
  }
};

const GoogleLogoSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useUserStore();

  const personType = (location.state?.personType as PersonType) || 'employee';
  const config = roleConfig[personType];

  const getRedirectPath = (type: PersonType) => {
    switch (type) {
      case 'employee':
        return '/employee/home';
      case 'citizen':
        return '/citizen/home';
      case 'admin':
        return '/admin/overview';
      default:
        return '/employee/home';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(identifier, password, personType);
      navigate(getRedirectPath(personType));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await googleLogin(personType);
      navigate(getRedirectPath(personType));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
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
                <span className="login-page__logo-icon">⚖️</span>
              </div>
              <h1 className="login-page__title">{config.title}</h1>
              <p className="login-page__subtitle">
                {config.subtitle}
              </p>
            </div>

            <div className="login-page__sso-section">
              <button
                type="button"
                className="google-sign-in-btn"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                <GoogleLogoSvg />
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <div className="login-page__divider">
                <span>OR</span>
              </div>
            </div>

            <form className="login-page__form" onSubmit={handleSubmit}>
              {error && (
                <div className="login-page__error" role="alert">
                  <span>⚠️</span> {error}
                </div>
              )}

              <Input
                label={config.identifierLabel}
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={config.identifierPlaceholder}
                required
                fullWidth
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                fullWidth
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>
          </Card>

          <div className="login-page__footer">
            <p>Legal Metrology Compliance Portal</p>
            <p>Regional Metrology Department</p>
          </div>
        </div>
      </div>
      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-navy-50) 0%, var(--color-white) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        .login-page__content {
          max-width: 440px;
          width: 100%;
        }

        .login-page__back {
          background: none;
          border: none;
          color: var(--color-navy-600);
          font-size: var(--font-size-base);
          cursor: pointer;
          margin-bottom: var(--space-6);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0;
          font-weight: 500;
        }

        .login-page__back:hover {
          color: var(--color-navy-800);
          text-decoration: underline;
        }

        .login-page__card {
          padding: var(--space-8);
        }

        .login-page__header {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .login-page__logo {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--color-navy-500), var(--color-navy-700));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-5);
          box-shadow: var(--shadow-md);
        }

        .login-page__logo-icon {
          font-size: 2.5rem;
        }

        .login-page__title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-2);
        }

        .login-page__subtitle {
          font-size: var(--font-size-base);
          color: var(--color-gray-600);
          margin: 0;
        }

        .login-page__sso-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .google-sign-in-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          width: 100%;
          padding: 12px 16px;
          background-color: #ffffff;
          color: #3c4043;
          border: 1px solid #dadce0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 1px 2px rgba(60,64,67,0.08);
        }

        .google-sign-in-btn:hover {
          background-color: #f8f9fa;
          border-color: #d2e3fc;
          box-shadow: 0 2px 4px rgba(60,64,67,0.15);
        }

        .google-sign-in-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-page__divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--color-gray-400);
          font-size: var(--font-size-xs);
          font-weight: 600;
          margin: var(--space-2) 0;
        }

        .login-page__divider::before,
        .login-page__divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .login-page__divider span {
          padding: 0 var(--space-3);
        }

        .login-page__form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .login-page__error {
          background-color: var(--color-error-100);
          border: 1px solid var(--color-error-600);
          color: var(--color-error-600);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .login-page__footer {
          text-align: center;
          margin-top: var(--space-6);
          font-size: var(--font-size-sm);
          color: var(--color-gray-500);
        }

        .login-page__footer p {
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-page__card {
            padding: var(--space-6);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
