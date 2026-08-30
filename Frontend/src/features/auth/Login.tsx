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
  demoId: string;
  demoPassword: string;
}> = {
  employee: {
    title: 'Employee Sign In',
    subtitle: 'Enter your credentials to access the Metrology Dashboard',
    identifierLabel: 'Employee ID',
    identifierPlaceholder: 'e.g., MET-2024-001',
    demoId: 'MET-2024-001',
    demoPassword: 'securePassword123'
  },
  citizen: {
    title: 'Citizen Sign In',
    subtitle: 'Enter your credentials to access the Citizen Portal',
    identifierLabel: 'Citizen ID',
    identifierPlaceholder: 'e.g., CIT-2024-001',
    demoId: 'CIT-2024-001',
    demoPassword: 'citizenPass123'
  },
  admin: {
    title: 'Admin Sign In',
    subtitle: 'Enter your credentials to access the Admin Dashboard',
    identifierLabel: 'Admin ID',
    identifierPlaceholder: 'e.g., ADM-2024-001',
    demoId: 'ADM-2024-001',
    demoPassword: 'adminPass123'
  }
};

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserStore();

  const personType = (location.state?.personType as PersonType) || 'employee';
  const config = roleConfig[personType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(identifier, password, personType);
      const redirectPath = personType === 'employee'
        ? '/employee/home'
        : personType === 'citizen'
          ? '/citizen/home'
          : '/admin/overview';
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
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
                <span className="login-page__logo-icon">⚖️</span>
              </div>
              <h1 className="login-page__title">{config.title}</h1>
              <p className="login-page__subtitle">
                {config.subtitle}
              </p>
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

              <p className="login-page__hint">
                <strong>Demo Credentials:</strong><br />
                {config.identifierLabel}: {config.demoId}<br />
                Password: {config.demoPassword}
              </p>
            </form>
          </Card>

          <div className="login-page__footer">
            <p>Metrology Portal v1.0</p>
            <p>Regional Metrology Office</p>
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
        }

        .login-page__back:hover {
          color: var(--color-navy-500);
          text-decoration: underline;
        }

        .login-page__card {
          padding: var(--space-8);
        }

        .login-page__header {
          text-align: center;
          margin-bottom: var(--space-8);
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

        .login-page__hint {
          background-color: var(--color-navy-50);
          border: 1px solid var(--color-navy-100);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-navy-700);
          text-align: center;
          margin: 0;
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
