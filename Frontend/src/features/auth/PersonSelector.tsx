import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useNavigate } from 'react-router-dom';

export type PersonType = 'employee' | 'citizen' | 'admin';

export const PersonSelector: React.FC = () => {
  const [selectedPerson, setSelectedPerson] = useState<PersonType | null>(null);
  const navigate = useNavigate();

  const handlePersonSelect = (person: PersonType) => {
    setSelectedPerson(person);
  };

  const handleContinue = () => {
    if (selectedPerson) {
      if (selectedPerson === 'admin') {
        navigate('/admin/login');
      } else {
        navigate('/login', { state: { personType: selectedPerson } });
      }
    }
  };

  return (
    <div className="person-selector">
      <div className="container">
        <div className="person-selector__content">
          <h1 className="person-selector__title">Welcome to Metrology</h1>
          <p className="person-selector__subtitle">
            Please select your person type to begin the authentication process.
          </p>

          <div className="person-selector__cards">
            {/* Employee Card */}
            <Card
              className={`person-selector__card ${selectedPerson === 'employee' ? 'person-selector__card--selected' : ''}`}
              onClick={() => handlePersonSelect('employee')}
              hoverable
            >
              <div className="person-selector__card-content">
                <div className="person-selector__icon">👤</div>
                <h2 className="person-selector__card-title">Employee</h2>
                <p className="person-selector__card-description">
                  Government employee with access to inspection and compliance tools.
                </p>
                {selectedPerson === 'employee' && (
                  <div className="person-selector__check">
                    ✓
                  </div>
                )}
              </div>
            </Card>

            {/* Citizen Card */}
            <Card
              className={`person-selector__card ${selectedPerson === 'citizen' ? 'person-selector__card--selected' : ''}`}
              onClick={() => handlePersonSelect('citizen')}
              hoverable
            >
              <div className="person-selector__card-content">
                <div className="person-selector__icon">👥</div>
                <h2 className="person-selector__card-title">Citizen</h2>
                <p className="person-selector__card-description">
                  Citizen user with access to submit and track complaints.
                </p>
                {selectedPerson === 'citizen' && (
                  <div className="person-selector__check">
                    ✓
                  </div>
                )}
              </div>
            </Card>

            {/* Admin Card */}
            <Card
              className={`person-selector__card ${selectedPerson === 'admin' ? 'person-selector__card--selected' : ''}`}
              onClick={() => handlePersonSelect('admin')}
              hoverable
            >
              <div className="person-selector__card-content">
                <div className="person-selector__icon">⚡</div>
                <h2 className="person-selector__card-title">Admin</h2>
                <p className="person-selector__card-description">
                  System administrator with access to manage all platform data.
                </p>
                {selectedPerson === 'admin' && (
                  <div className="person-selector__check">
                    ✓
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="person-selector__actions">
            <Button
              variant="primary"
              size="lg"
              fullWidth={true}
              disabled={!selectedPerson}
              onClick={handleContinue}
            >
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        .person-selector {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-navy-50) 0%, var(--color-white) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        .person-selector__content {
          max-width: 800px;
          width: 100%;
          text-align: center;
        }

        .person-selector__title {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin-bottom: var(--space-4);
        }

        .person-selector__subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-gray-600);
          margin-bottom: var(--space-8);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .person-selector__cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .person-selector__card {
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .person-selector__card--selected {
          border: 2px solid var(--color-gold-600);
          box-shadow: var(--shadow-lg);
        }

        .person-selector__card--disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: var(--color-gray-100);
        }

        .person-selector__card-content {
          padding: var(--space-6);
          text-align: left;
        }

        .person-selector__icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--color-navy-500), var(--color-navy-600));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: var(--space-4);
          color: var(--color-white);
        }

        .person-selector__icon--disabled {
          background: linear-gradient(135deg, var(--color-gray-400), var(--color-gray-500));
          cursor: not-allowed;
        }

        .person-selector__card-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin-bottom: var(--space-2);
        }

        .person-selector__card-title--disabled {
          color: var(--color-gray-600);
        }

        .person-selector__card-description {
          font-size: var(--font-size-base);
          color: var(--color-gray-600);
          line-height: var(--line-height-base);
        }

        .person-selector__check {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          width: 28px;
          height: 28px;
          background: var(--color-gold-600);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
          font-weight: var(--font-weight-bold);
        }

        .person-selector__disabled-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
        }

        .person-selector__actions {
          margin-top: var(--space-8);
        }

        @media (max-width: 768px) {
          .person-selector__cards {
            grid-template-columns: 1fr;
          }

          .person-selector__title {
            font-size: var(--font-size-3xl);
          }
        }
      `}</style>
    </div>
  );
};

export default PersonSelector;