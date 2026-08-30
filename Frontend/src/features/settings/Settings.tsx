import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    autoSave: true,
    compactView: false,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    setSaved(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, language: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Phase 1: Mock save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your application preferences</p>
      </div>

      {saved && (
        <div className="settings__saved">
          ✓ Settings saved successfully
        </div>
      )}

      <div className="settings__grid">
        <Card className="settings__card">
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="settings__item">
              <div className="settings__item-info">
                <h4>Notifications</h4>
                <p>Receive notifications for new complaints and updates</p>
              </div>
              <label className="settings__toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
                <span className="settings__toggle-slider"></span>
              </label>
            </div>

            <div className="settings__item">
              <div className="settings__item-info">
                <h4>Auto-Save</h4>
                <p>Automatically save your work as you go</p>
              </div>
              <label className="settings__toggle">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
                <span className="settings__toggle-slider"></span>
              </label>
            </div>

            <div className="settings__item">
              <div className="settings__item-info">
                <h4>Compact View</h4>
                <p>Use a more condensed layout for lists and tables</p>
              </div>
              <label className="settings__toggle">
                <input
                  type="checkbox"
                  checked={settings.compactView}
                  onChange={() => handleToggle('compactView')}
                />
                <span className="settings__toggle-slider"></span>
              </label>
            </div>
          </CardBody>
        </Card>

        <Card className="settings__card">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="settings__item">
              <div className="settings__item-info">
                <h4>Dark Mode</h4>
                <p>Use a dark color scheme (Phase 2)</p>
              </div>
              <label className="settings__toggle">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                  disabled
                />
                <span className="settings__toggle-slider settings__toggle-slider--disabled"></span>
              </label>
            </div>
            <p className="settings__note">
              Dark mode will be available in a future update.
            </p>
          </CardBody>
        </Card>

        <Card className="settings__card">
          <CardHeader>
            <CardTitle>Language</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="settings__item settings__item--column">
              <div className="settings__item-info">
                <h4>Interface Language</h4>
                <p>Select your preferred language for the interface</p>
              </div>
              <select
                className="settings__select"
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="fr" disabled>Français (Coming Soon)</option>
                <option value="es" disabled>Español (Coming Soon)</option>
              </select>
            </div>
          </CardBody>
        </Card>

        <Card className="settings__card">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="settings__about">
              <div className="settings__about-row">
                <span className="settings__about-label">Version</span>
                <span className="settings__about-value">1.0.0</span>
              </div>
              <div className="settings__about-row">
                <span className="settings__about-label">Phase</span>
                <span className="settings__about-value">Phase 1 - Prototype</span>
              </div>
              <div className="settings__about-row">
                <span className="settings__about-label">Build</span>
                <span className="settings__about-value">Mock Data</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="settings__actions">
        <Button variant="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;