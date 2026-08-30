import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';

export const CitizenHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const citizenName = user?.name || 'Citizen';

  const scanProduct = useCallback(() => navigate('/citizen/scan'), [navigate]);
  const viewScans = useCallback(() => navigate('/citizen/scans'), [navigate]);
  const viewComplaints = useCallback(() => navigate('/citizen/complaints'), [navigate]);

  return (
    <section className="cit-home">
      <header className="cit-home__header">
        <h1 className="cit-home__title">Welcome</h1>
        <p className="cit-home__subtitle">Legal Metrology Compliance System</p>
      </header>

      <main className="cit-home__content">
        <div className="cit-home__welcome-section">
          <p className="cit-home__welcome-msg">
            Hello, {citizenName}! You can help keep products safe by reporting
            compliance concerns.
          </p>
        </div>

        <div className="cit-home__quick-actions">
          <div className="cit-home__quick-action-card">
            <button
              className="cit-home__quick-action-btn"
              onClick={scanProduct}
            >
              [SCAN PRODUCT]
            </button>
          </div>

          <div className="cit-home__quick-action-card">
            <button
              className="cit-home__quick-action-btn"
              onClick={viewScans}
            >
              [MY SCANS]
            </button>
          </div>

          <div className="cit-home__quick-action-card">
            <button
              className="cit-home__quick-action-btn"
              onClick={viewComplaints}
            >
              [MY COMPLAINTS]
            </button>
          </div>
        </div>

        <div className="cit-home__recent-section">
          <h2 className="cit-home__section-title">Recent Scans</h2>

          {/* No scans yet state */}
          <p className="cit-home__no-scans">
            No scans yet. Start by scanning a product.
          </p>
        </div>

        <div className="cit-home__complaint-section">
          <h2 className="cit-home__section-title">Complaint Status</h2>

          {/* No complaints yet state */}
          <p className="cit-home__no-complaints">
            No complaints submitted yet. Submit your first complaint to track.
          </p>
        </div>

        <div className="cit-home__help-section">
          <h2 className="cit-home__section-title">Helpful Information</h2>
          <ul className="cit-home__help-list">
            <li>
              Scan product packages to check compliance
            </li>
            <li>
              Submit complaints if you spot issues
            </li>
            <li>
              Track your complaint status
            </li>
          </ul>
        </div>
      </main>
    </section>
  );
};
