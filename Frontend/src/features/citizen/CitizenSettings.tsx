import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

type NotificationPreference = 'all' | 'important' | 'none';
type Language = 'en' | 'hi' | 'ta' | 'bn' | 'gu' | 'mr';

interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ id, label, description, checked, onChange }) => (
  <label className="cit-settings__toggle-row" htmlFor={id}>
    <div className="cit-settings__toggle-info">
      <span className="cit-settings__toggle-label">{label}</span>
      {description && <span className="cit-settings__toggle-desc">{description}</span>}
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      className={`cit-settings__toggle-btn ${checked ? 'cit-settings__toggle-btn--on' : ''}`}
      onClick={() => onChange(id, !checked)}
      type="button"
    >
      <span className="cit-settings__toggle-thumb" />
    </button>
  </label>
);

export const CitizenSettings: React.FC = () => {
  const navigate = useNavigate();

  // Notification preferences
  const [notifPreference, setNotifPreference] = useState<NotificationPreference>('all');
  const [notifChannels, setNotifChannels] = useState({
    complaintUpdates: true,
    scanResults: true,
    reminders: false,
    platformNews: false,
  });

  // Language preference
  const [language, setLanguage] = useState<Language>('en');

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    shareHistory: false,
    anonymousReports: true,
  });

  const handleToggle = useCallback((id: string, checked: boolean) => {
    if (id === 'complaintUpdates') setNotifChannels(p => ({ ...p, complaintUpdates: checked }));
    else if (id === 'scanResults') setNotifChannels(p => ({ ...p, scanResults: checked }));
    else if (id === 'reminders') setNotifChannels(p => ({ ...p, reminders: checked }));
    else if (id === 'platformNews') setNotifChannels(p => ({ ...p, platformNews: checked }));
    else if (id === 'shareHistory') setPrivacy(p => ({ ...p, shareHistory: checked }));
    else if (id === 'anonymousReports') setPrivacy(p => ({ ...p, anonymousReports: checked }));
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const handleSaveNotifications = useCallback(() => {
    // In a real app, this would save to backend
    alert('Notification preferences saved.');
  }, []);

  const handleSavePrivacy = useCallback(() => {
    alert('Privacy settings saved.');
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
  ];

  return (
    <div className="cit-settings">
      <div className="cit-settings__container">
        <header className="cit-settings__header">
          <h1 className="cit-settings__title">Settings</h1>
          <p className="cit-settings__subtitle">
            Manage your preferences and account settings.
          </p>
        </header>

        {/* Notifications */}
        <section className="cit-settings__section" aria-labelledby="settings-notifications">
          <div className="cit-settings__section-header">
            <h2 id="settings-notifications" className="cit-settings__section-title">
              Notifications
            </h2>
          </div>

          <div className="cit-settings__setting-group">
            <span className="cit-settings__group-label">Notification Level</span>
            <div className="cit-settings__radio-group">
              {(['all', 'important', 'none'] as NotificationPreference[]).map(val => (
                <label key={val} className="cit-settings__radio-label">
                  <input
                    type="radio"
                    name="notif-pref"
                    value={val}
                    checked={notifPreference === val}
                    onChange={() => setNotifPreference(val)}
                    className="cit-settings__radio"
                  />
                  <span>
                    {val === 'all' ? 'All notifications' :
                     val === 'important' ? 'Important only' : 'None'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="cit-settings__toggles">
            <Toggle
              id="complaintUpdates"
              label="Complaint Updates"
              description="Get notified when your complaint status changes"
              checked={notifChannels.complaintUpdates}
              onChange={handleToggle}
            />
            <Toggle
              id="scanResults"
              label="Scan Results"
              description="Get notified when your scan is ready"
              checked={notifChannels.scanResults}
              onChange={handleToggle}
            />
            <Toggle
              id="reminders"
              label="Reminders"
              description="Reminders about pending actions"
              checked={notifChannels.reminders}
              onChange={handleToggle}
            />
            <Toggle
              id="platformNews"
              label="Platform News"
              description="Updates and announcements"
              checked={notifChannels.platformNews}
              onChange={handleToggle}
            />
          </div>

          <div className="cit-settings__actions">
            <Button variant="primary" size="sm" onClick={handleSaveNotifications}>
              Save Notification Settings
            </Button>
          </div>
        </section>

        {/* Language */}
        <section className="cit-settings__section" aria-labelledby="settings-language">
          <div className="cit-settings__section-header">
            <h2 id="settings-language" className="cit-settings__section-title">
              Language
            </h2>
          </div>

          <p className="cit-settings__setting-desc">
            Select your preferred language for the platform interface. This is a demonstration — language switching is illustrative only.
          </p>

          <div className="cit-settings__language-grid">
            {LANGUAGE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`cit-settings__language-option ${language === opt.value ? 'cit-settings__language-option--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="language"
                  value={opt.value}
                  checked={language === opt.value}
                  onChange={() => handleLanguageChange(opt.value)}
                  className="cit-settings__radio"
                />
                <span className="cit-settings__language-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="cit-settings__section" aria-labelledby="settings-privacy">
          <div className="cit-settings__section-header">
            <h2 id="settings-privacy" className="cit-settings__section-title">
              Privacy & Data
            </h2>
          </div>

          <p className="cit-settings__setting-desc">
            This is a demonstration platform with no real personal data collection. The toggles below are illustrative.
          </p>

          <div className="cit-settings__toggles">
            <Toggle
              id="shareHistory"
              label="Share Scan History"
              description="Allow anonymized scan history to be used for aggregate analysis"
              checked={privacy.shareHistory}
              onChange={handleToggle}
            />
            <Toggle
              id="anonymousReports"
              label="Anonymous Reports"
              description="Allow submitting reports without sharing your identity with the store"
              checked={privacy.anonymousReports}
              onChange={handleToggle}
            />
          </div>

          <div className="cit-settings__actions">
            <Button variant="primary" size="sm" onClick={handleSavePrivacy}>
              Save Privacy Settings
            </Button>
          </div>
        </section>

        {/* Security */}
        <section className="cit-settings__section" aria-labelledby="settings-security">
          <div className="cit-settings__section-header">
            <h2 id="settings-security" className="cit-settings__section-title">
              Security
            </h2>
          </div>

          <div className="cit-settings__info-rows">
            <div className="cit-settings__info-row">
              <span className="cit-settings__info-label">Password</span>
              <span className="cit-settings__info-value">
                <span className="cit-settings__info-dots">••••••••</span>
              </span>
            </div>
            <div className="cit-settings__info-row">
              <span className="cit-settings__info-label">Session</span>
              <span className="cit-settings__info-value">Active</span>
            </div>
          </div>

          <p className="cit-settings__setting-desc">
            Password management and session settings are managed through the login system. In a production system, these would allow changing your password and viewing active sessions.
          </p>
        </section>

        {/* App Preferences */}
        <section className="cit-settings__section" aria-labelledby="settings-app">
          <div className="cit-settings__section-header">
            <h2 id="settings-app" className="cit-settings__section-title">
              App Preferences
            </h2>
          </div>

          <div className="cit-settings__info-rows">
            <div className="cit-settings__info-row">
              <span className="cit-settings__info-label">Image Quality</span>
              <span className="cit-settings__info-value">High</span>
            </div>
            <div className="cit-settings__info-row">
              <span className="cit-settings__info-label">Auto-upload</span>
              <span className="cit-settings__info-value">Enabled</span>
            </div>
            <div className="cit-settings__info-row">
              <span className="cit-settings__info-label">Version</span>
              <span className="cit-settings__info-value">1.0.0 (Demo)</span>
            </div>
          </div>
        </section>

        <div className="cit-settings__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenSettingsStyles />
    </div>
  );
};

const CitizenSettingsStyles: React.FC = () => (
  <style>{`
    .cit-settings {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-settings__container {
      max-width: 720px;
      margin: 0 auto;
    }

    .cit-settings__header {
      margin-bottom: var(--space-6);
    }

    .cit-settings__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-settings__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-settings__section {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .cit-settings__section-header {
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .cit-settings__section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0;
    }

    .cit-settings__setting-desc {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0 0 var(--space-4) 0;
      line-height: 1.6;
    }

    .cit-settings__setting-group {
      margin-bottom: var(--space-4);
    }

    .cit-settings__group-label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-700);
      margin-bottom: var(--space-2);
    }

    .cit-settings__radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .cit-settings__radio-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      cursor: pointer;
    }

    .cit-settings__radio {
      accent-color: var(--color-navy-500);
      width: 16px;
      height: 16px;
    }

    .cit-settings__toggles {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .cit-settings__toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      background: var(--color-gray-50);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background var(--transition-fast);
      gap: var(--space-4);
    }

    .cit-settings__toggle-row:hover {
      background: var(--color-gray-100);
    }

    .cit-settings__toggle-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cit-settings__toggle-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
    }

    .cit-settings__toggle-desc {
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
    }

    .cit-settings__toggle-btn {
      position: relative;
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: var(--color-gray-300);
      border: none;
      cursor: pointer;
      transition: background var(--transition-base);
      flex-shrink: 0;
      padding: 0;
    }

    .cit-settings__toggle-btn--on {
      background: var(--color-navy-500);
    }

    .cit-settings__toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-white);
      transition: transform var(--transition-base);
      box-shadow: var(--shadow-sm);
    }

    .cit-settings__toggle-btn--on .cit-settings__toggle-thumb {
      transform: translateX(20px);
    }

    .cit-settings__actions {
      display: flex;
      gap: var(--space-3);
    }

    /* Language */
    .cit-settings__language-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
    }

    .cit-settings__language-option {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--color-gray-50);
      border: 2px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .cit-settings__language-option:hover {
      border-color: var(--color-navy-300);
      background: var(--color-gray-100);
    }

    .cit-settings__language-option--selected {
      border-color: var(--color-navy-500);
      background: var(--color-navy-50);
    }

    .cit-settings__language-label {
      font-size: var(--font-size-sm);
      color: var(--color-navy-900);
      font-weight: var(--font-weight-medium);
    }

    /* Info rows */
    .cit-settings__info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .cit-settings__info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      background: var(--color-gray-50);
      border-radius: var(--radius-md);
    }

    .cit-settings__info-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-700);
    }

    .cit-settings__info-value {
      font-size: var(--font-size-sm);
      color: var(--color-navy-700);
      font-weight: var(--font-weight-medium);
    }

    .cit-settings__info-dots {
      font-family: var(--font-family-mono);
      letter-spacing: 2px;
    }

    .cit-settings__back-row {
      text-align: center;
      margin-top: var(--space-4);
    }

    @media (max-width: 768px) {
      .cit-settings {
        padding: var(--space-4);
      }

      .cit-settings__language-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .cit-settings__toggle-row {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }
    }
  `}</style>
);

export default CitizenSettings;
