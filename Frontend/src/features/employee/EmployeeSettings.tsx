/* ==========================================================================
   Employee Settings Page
   Task N — Settings

   Organized settings: Notifications, Language, Security, Camera Preferences,
   Offline Mode, Privacy, Data Settings, Application Information.
   ========================================================================== */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';

export const EmployeeSettings: React.FC = () => {
  const { logout } = useUserStore();
  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  /* Notification toggles */
  const [notif, setNotif] = useState({
    complaints: true,
    inspections: true,
    verification: true,
    reports: true,
    departmentUpdates: false,
  });

  /* Language */
  const [language, setLanguage] = useState('en');

  /* Camera preferences */
  const [camera, setCamera] = useState({
    highQuality: true,
    imagePreview: true,
    autoQualityCheck: true,
  });

  /* Offline mode */
  const [offlineEnabled, setOfflineEnabled] = useState(false);

  const toggleNotif = (key: keyof typeof notif) => {
    setNotif(n => ({ ...n, [key]: !n[key] }));
  };

  const handleSave = () => {
    setSaveMsg('Settings saved successfully.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleClearData = () => {
    setShowClearDataModal(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 4000);
  };

  const handleSignOutConfirm = () => {
    setShowSignOutModal(false);
    logout();
    navigate('/');
  };

  return (
    <div className="page emp-settings-page">
      <div className="emp-settings-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your application preferences.</p>
        </div>
        {saveMsg && <span className="emp-settings-toast emp-settings-toast--success">{saveMsg}</span>}
      </div>

      {clearSuccess && (
        <div className="emp-settings-banner emp-settings-banner--success">
          Local demo data cleared.
        </div>
      )}

      <div className="emp-settings-grid">

        {/* Notifications */}
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Complaint Alerts</h4>
                <p>Receive alerts for new citizen complaints.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={notif.complaints} onChange={() => toggleNotif('complaints')} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Inspection Alerts</h4>
                <p>Receive alerts for inspection updates and assignments.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={notif.inspections} onChange={() => toggleNotif('inspections')} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Verification Alerts</h4>
                <p>Receive alerts for verification requests and updates.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={notif.verification} onChange={() => toggleNotif('verification')} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Report Alerts</h4>
                <p>Receive alerts when inspection reports are generated.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={notif.reports} onChange={() => toggleNotif('reports')} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Department Updates</h4>
                <p>Receive department-wide announcements and updates.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={notif.departmentUpdates} onChange={() => toggleNotif('departmentUpdates')} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader><CardTitle>Language</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-item emp-settings-item--column">
              <div className="emp-settings-item__info">
                <h4>Interface Language</h4>
                <p>Select your preferred language for the application interface.</p>
              </div>
              <select
                className="emp-settings-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
              </select>
            </div>
            <p className="emp-settings-note">
              Additional languages will be available in a future release.
            </p>
          </CardBody>
        </Card>

        {/* Camera Preferences */}
        <Card>
          <CardHeader><CardTitle>Camera Preferences</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>High Quality Images</h4>
                <p>Capture images at highest available resolution.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={camera.highQuality} onChange={() => setCamera(c => ({ ...c, highQuality: !c.highQuality }))} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Image Preview</h4>
                <p>Show preview after capturing an image.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={camera.imagePreview} onChange={() => setCamera(c => ({ ...c, imagePreview: !c.imagePreview }))} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Auto Quality Check</h4>
                <p>Automatically assess image quality after capture.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={camera.autoQualityCheck} onChange={() => setCamera(c => ({ ...c, autoQualityCheck: !c.autoQualityCheck }))} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Offline Mode */}
        <Card>
          <CardHeader><CardTitle>Offline Mode</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Offline Mode</h4>
                <p>Allows the application to retain selected inspection data locally when connectivity is unavailable.</p>
              </div>
              <label className="emp-settings-toggle">
                <input type="checkbox" checked={offlineEnabled} onChange={() => setOfflineEnabled(v => !v)} />
                <span className="emp-settings-toggle__slider" />
              </label>
            </div>
            <p className="emp-settings-note emp-settings-note--demo">
              Demo setting — real offline synchronization is not implemented.
            </p>
          </CardBody>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-privacy">
              <div className="emp-settings-privacy__item">
                <h4>Data Handling</h4>
                <p>Inspection data is stored locally and managed according to department data policies.</p>
              </div>
              <div className="emp-settings-privacy__item">
                <h4>Camera Access</h4>
                <p>Camera access is used only for capturing product label images during inspections.</p>
              </div>
              <div className="emp-settings-privacy__item">
                <h4>Location Access</h4>
                <p>Location data is used to tag inspection records with the inspection site.</p>
              </div>
              <div className="emp-settings-privacy__item">
                <h4>Stored Inspection Data</h4>
                <p>Inspection records and associated evidence are retained in the system for record-keeping purposes.</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-security">
              <div className="emp-settings-item emp-settings-item--inline">
                <div className="emp-settings-item__info">
                  <h4>Secure Session</h4>
                  <p>Your session is protected and access is restricted to authorized officers.</p>
                </div>
                <span className="emp-settings-security-badge emp-settings-security-badge--on">Active</span>
              </div>
              <div className="emp-settings-item emp-settings-item--inline">
                <div className="emp-settings-item__info">
                  <h4>Role-Based Access</h4>
                  <p>Access is restricted based on your officer role and designation.</p>
                </div>
                <span className="emp-settings-security-badge emp-settings-security-badge--on">Active</span>
              </div>
              <div className="emp-settings-item emp-settings-item--inline">
                <div className="emp-settings-item__info">
                  <h4>Session Timeout</h4>
                  <p>Sessions expire after a period of inactivity for security.</p>
                </div>
                <span className="emp-settings-security-badge emp-settings-security-badge--on">Active</span>
              </div>
            </div>
            <div className="emp-settings-security-actions">
              <Button variant="outline" size="sm" onClick={() => navigate('/employee/profile')}>Change Password</Button>
              <Button variant="error" size="sm" onClick={() => setShowSignOutModal(true)}>Sign Out</Button>
            </div>
          </CardBody>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader><CardTitle>Data Settings</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-item">
              <div className="emp-settings-item__info">
                <h4>Clear Local Demo Data</h4>
                <p>Remove locally stored demonstration data from this device.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowClearDataModal(true)}>
                Clear Data
              </Button>
            </div>
            <p className="emp-settings-note">
              This removes only local demo data. Source files and project data are not affected.
            </p>
          </CardBody>
        </Card>

        {/* Application Information */}
        <Card>
          <CardHeader><CardTitle>Application Information</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-settings-appinfo">
              <div className="emp-settings-appinfo__row">
                <span>Application</span>
                <strong>Legal Metrology Compliance System</strong>
              </div>
              <div className="emp-settings-appinfo__row">
                <span>Version</span>
                <strong>1.0.0</strong>
              </div>
              <div className="emp-settings-appinfo__row">
                <span>Environment</span>
                <strong>Demo / Frontend</strong>
              </div>
              <div className="emp-settings-appinfo__row">
                <span>Build</span>
                <strong>Mock Data</strong>
              </div>
            </div>
          </CardBody>
        </Card>

      </div>

      <div className="emp-settings-actions">
        <Button variant="primary" onClick={handleSave}>Save Settings</Button>
      </div>

      {/* Clear Data Confirmation */}
      <Modal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        title="Clear Local Demo Data"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowClearDataModal(false)}>Cancel</Button>
            <Button variant="error" onClick={handleClearData}>Clear Data</Button>
          </>
        }
      >
        <p>This will remove locally stored demonstration data. Continue?</p>
      </Modal>

      {/* Sign Out Confirmation */}
      <Modal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSignOutModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSignOutConfirm}>Sign Out</Button>
          </>
        }
      >
        <p>Are you sure you want to sign out? You will need to log in again to access the system.</p>
      </Modal>

      <style>{empSettingsStyles}</style>
    </div>
  );
};

export default EmployeeSettings;

const empSettingsStyles = `
  .emp-settings-page { max-width: 1000px; margin: 0 auto; }
  .emp-settings-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3); flex-wrap: wrap; }
  .emp-settings-toast { font-size: var(--font-size-sm); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); }
  .emp-settings-toast--success { background: var(--color-success-100); color: var(--color-success-600); }
  .emp-settings-banner { padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--font-size-sm); }
  .emp-settings-banner--success { background: var(--color-success-100); color: var(--color-success-600); border: 1px solid var(--color-success-600); }

  .emp-settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
  @media (max-width: 768px) { .emp-settings-grid { grid-template-columns: 1fr; } }

  .emp-settings-item { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); }
  .emp-settings-item:last-child { border-bottom: none; }
  .emp-settings-item--column { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
  .emp-settings-item--inline { padding-bottom: var(--space-3); }
  .emp-settings-item__info { flex: 1; }
  .emp-settings-item__info h4 { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); margin: 0 0 4px; }
  .emp-settings-item__info p { font-size: var(--font-size-xs); color: var(--color-gray-600); margin: 0; }

  .emp-settings-toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
  .emp-settings-toggle input { opacity: 0; width: 0; height: 0; }
  .emp-settings-toggle__slider { position: absolute; inset: 0; background-color: var(--color-gray-300); border-radius: 24px; cursor: pointer; transition: background-color 0.2s; }
  .emp-settings-toggle__slider::before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: transform 0.2s; }
  .emp-settings-toggle input:checked + .emp-settings-toggle__slider { background-color: var(--color-navy-700); }
  .emp-settings-toggle input:checked + .emp-settings-toggle__slider::before { transform: translateX(20px); }

  .emp-settings-select { width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .emp-settings-select:focus { outline: none; border-color: var(--color-navy-500); }

  .emp-settings-note { font-size: 11px; color: var(--color-gray-500); font-style: italic; margin-top: var(--space-2); }
  .emp-settings-note--demo { color: var(--color-warning-600); }

  .emp-settings-privacy { display: flex; flex-direction: column; gap: var(--space-3); }
  .emp-settings-privacy__item h4 { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); margin: 0 0 4px; }
  .emp-settings-privacy__item p { font-size: var(--font-size-xs); color: var(--color-gray-600); margin: 0; }

  .emp-settings-security { display: flex; flex-direction: column; gap: var(--space-3); }
  .emp-settings-security-badge { font-size: 11px; font-weight: var(--font-weight-bold); padding: 2px 8px; border-radius: var(--radius-full); }
  .emp-settings-security-badge--on { background: var(--color-success-100); color: var(--color-success-600); }
  .emp-settings-security-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; padding-top: var(--space-3); border-top: 1px solid var(--color-gray-200); margin-top: var(--space-3); }

  .emp-settings-appinfo { display: flex; flex-direction: column; gap: var(--space-2); }
  .emp-settings-appinfo__row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); font-size: var(--font-size-sm); }
  .emp-settings-appinfo__row:last-child { border-bottom: none; }
  .emp-settings-appinfo__row span { color: var(--color-gray-600); font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .emp-settings-appinfo__row strong { color: var(--color-navy-900); }

  .emp-settings-actions { margin-top: var(--space-5); display: flex; justify-content: flex-end; }
`;
