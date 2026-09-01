import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useUserStore } from '../../store';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export const AdminMfaPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, personType, logout } = useUserStore();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // If somehow user lands here without being authenticated as admin, bounce back
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }
    if (personType !== 'admin') {
      // Wrong role — send to the matching dashboard
      const target =
        personType === 'employee' ? '/employee/home'
          : personType === 'citizen' ? '/citizen/home'
            : '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, personType, navigate]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleChange = (idx: number, value: string) => {
    if (error) setError('');
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    const last = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[last]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const joined = code.join('');
    if (joined.length !== CODE_LENGTH) {
      setError(`Please enter the ${CODE_LENGTH}-digit verification code.`);
      return;
    }
    setVerifying(true);
    try {
      // FRONTEND DEMO MOCK — any 6-digit code is accepted in this demo
      // Replace with a real TOTP/SMS/email challenge when backend is wired
      await new Promise((r) => setTimeout(r, 600));
      navigate('/admin/overview', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    setResendIn(RESEND_SECONDS);
    setCode(Array(CODE_LENGTH).fill(''));
    setResent(true);
    inputRefs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  };

  const handleCancel = () => {
    // Cancel MFA → log out and return to login
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-page__content">
          <button className="login-page__back" onClick={handleCancel}>
            ← Cancel & Sign Out
          </button>

          <Card className="login-page__card">
            <div className="login-page__header">
              <div className="login-page__logo">
                <span className="login-page__logo-icon">🔐</span>
              </div>
              <h1 className="login-page__title">MFA / OTP Verification</h1>
              <p className="login-page__subtitle">
                Enter the {CODE_LENGTH}-digit code to continue.
              </p>
            </div>

            <form className="login-page__form" onSubmit={handleVerify}>
              {error && (
                <div className="login-page__error" role="alert">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="mfa-field">
                <label className="mfa-field__label">Verification Code</label>
                <div className="mfa-field__boxes" onPaste={handlePaste}>
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="mfa-field__box"
                      autoFocus={i === 0}
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mfa-demo-note">
                <strong>Demo notice:</strong> This is a frontend mock MFA — any {CODE_LENGTH}-digit
                code is accepted. No real SMS, email or authenticator is connected in this demo.
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={verifying}
              >
                VERIFY
              </Button>

              <div className="mfa-resend">
                {resendIn > 0 ? (
                  <span className="mfa-resend__countdown">
                    Resend code available in {resendIn}s
                  </span>
                ) : (
                  <button
                    type="button"
                    className="mfa-resend__btn"
                    onClick={handleResend}
                  >
                    {resent ? 'Code Resent' : 'RESEND CODE'}
                  </button>
                )}
              </div>
            </form>
          </Card>

          <div className="login-page__footer">
            <p>Metrology Portal v1.0</p>
            <p>Restricted Access · For Authorised Administrators Only</p>
          </div>
        </div>
      </div>

      <style>{`
        .mfa-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .mfa-field__label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-gray-700, #374151);
        }

        .mfa-field__boxes {
          display: flex;
          gap: var(--space-2);
          justify-content: space-between;
        }

        .mfa-field__box {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: var(--font-weight-semibold);
          border: 1.5px solid var(--color-gray-300, #cbd5e1);
          border-radius: var(--radius-md);
          background: #ffffff;
          color: var(--color-navy-900, #0f172a);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .mfa-field__box:focus {
          border-color: var(--color-navy-500, #1e40af);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
        }

        .mfa-demo-note {
          background-color: var(--color-navy-50, #eff6ff);
          border: 1px solid var(--color-navy-100, #dbeafe);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-navy-800, #1e3a8a);
          text-align: left;
          margin: 0;
        }

        .mfa-resend {
          display: flex;
          justify-content: center;
          margin-top: calc(-1 * var(--space-2));
        }

        .mfa-resend__countdown {
          font-size: var(--font-size-sm);
          color: var(--color-gray-500, #6b7280);
        }

        .mfa-resend__btn {
          background: none;
          border: none;
          color: var(--color-navy-600, #1e40af);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          padding: 0;
          letter-spacing: 0.5px;
        }

        .mfa-resend__btn:hover {
          color: var(--color-navy-500, #3b82f6);
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .mfa-field__box {
            width: 40px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminMfaPage;
