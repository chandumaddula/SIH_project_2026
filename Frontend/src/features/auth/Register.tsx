import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Phase 1: Mock registration - just show success message
    setTimeout(() => {
      alert('Registration feature is not available in Phase 1. Please use the demo credentials to login.');
      navigate('/login');
      setIsLoading(false);
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-page__content">
          <button className="register-page__back" onClick={handleBack}>
            ← Back to Selection
          </button>

          <Card className="register-page__card">
            <div className="register-page__header">
              <div className="register-page__logo">
                <span className="register-page__logo-icon">⚖️</span>
              </div>
              <h1 className="register-page__title">Employee Registration</h1>
              <p className="register-page__subtitle">
                Create a new account - Note: Phase 1 uses demo credentials only
              </p>
            </div>

            <form className="register-page__form" onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                error={errors.name}
                required
              />

              <Input
                label="Employee ID"
                type="text"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="e.g., MET-2024-001"
                error={errors.employeeId}
                required
              />

              <Input
                label="Department"
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g., Weights and Measures"
                error={errors.department}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@gov.org"
                error={errors.email}
                required
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Create a password"
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
              />

              <div className="register-page__note">
                <strong>Note:</strong> Registration is for demonstration purposes in Phase 1.
                Please use the demo credentials on the login page.
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                Create Account
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <style>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-navy-50) 0%, var(--color-white) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        .register-page__content {
          max-width: 480px;
          width: 100%;
        }

        .register-page__back {
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

        .register-page__back:hover {
          color: var(--color-navy-500);
          text-decoration: underline;
        }

        .register-page__card {
          padding: var(--space-8);
        }

        .register-page__header {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .register-page__logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--color-navy-500), var(--color-navy-700));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
        }

        .register-page__logo-icon {
          font-size: 2rem;
        }

        .register-page__title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-2);
        }

        .register-page__subtitle {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0;
        }

        .register-page__form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .register-page__note {
          background-color: var(--color-warning-100);
          border: 1px solid var(--color-warning-600);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-gray-800);
        }

        @media (max-width: 480px) {
          .register-page__card {
            padding: var(--space-5);
          }
        }
      `}</style>
    </div>
  );
};

export default Register;