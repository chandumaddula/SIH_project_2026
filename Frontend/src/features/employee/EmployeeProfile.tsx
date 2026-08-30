/* ==========================================================================
   Employee Profile Page
   Task N — Profile

   Shows officer information across Personal / Employment / Contact sections.
   Allows editing of appropriate fields with validation.
   Includes Change Password modal.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { useUserStore } from '../../store';
import { Employee } from '../../types/user';

interface ValidationErrors {
  email?: string;
  phone?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const EmployeeProfile: React.FC = () => {
  const { user } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordForm>>({});
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const employee: Employee | null = user?.role === 'employee' ? (user as Employee) : null;
  const [draft, setDraft] = useState<Employee | null>(null);

  useEffect(() => {
    if (employee) setDraft({ ...employee });
  }, [employee]);

  if (!employee || !draft) {
    return (
      <div className="page emp-profile-page">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Loading profile...</p>
        <div className="emp-profile-loading"><div className="emp-profile-spinner" /><p>Loading profile...</p></div>
        <style>{empProfileStyles}</style>
      </div>
    );
  }

  /* ---- Edit handlers ---- */

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setDraft({ ...employee });
    setIsEditing(false);
    setErrors({});
  };

  const validate = (data: Employee): ValidationErrors => {
    const errs: ValidationErrors = {};
    if (!data.contact.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!data.contact.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[+\d\s()-]{7,20}$/.test(data.contact.phone)) {
      errs.phone = 'Please enter a valid phone number.';
    }
    return errs;
  };

  const handleSave = () => {
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setErrors({});
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveMsg(null), 3000);
    }, 600);
  };

  /* ---- Password handlers ---- */

  const validatePassword = (): boolean => {
    const errs: Partial<PasswordForm> = {};
    if (!passwordForm.currentPassword) errs.currentPassword = 'Current password is required.';
    if (!passwordForm.newPassword) errs.newPassword = 'New password is required.';
    else if (passwordForm.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
    if (!passwordForm.confirmPassword) errs.confirmPassword = 'Please confirm your new password.';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSave = () => {
    if (!validatePassword()) return;
    setPasswordSaving(true);
    setPasswordErrors({});
    setTimeout(() => {
      setPasswordSaving(false);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg('Password updated successfully.');
      setTimeout(() => setPasswordMsg(null), 3000);
    }, 800);
  };

  return (
    <div className="page emp-profile-page">
      <div className="emp-profile-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your employee profile information</p>
        </div>
        <div className="emp-profile-header__actions">
          {saveMsg && <span className="emp-profile-toast emp-profile-toast--success">{saveMsg}</span>}
          {passwordMsg && <span className="emp-profile-toast emp-profile-toast--success">{passwordMsg}</span>}
          {!isEditing ? (
            <Button variant="primary" size="sm" onClick={handleEdit}>Edit Profile</Button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar card */}
      <Card>
        <CardBody>
          <div className="emp-profile-avatar">
            <div className="emp-profile-avatar__circle">
              {draft.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
            </div>
            <div className="emp-profile-avatar__info">
              <h2 className="emp-profile-avatar__name">{draft.name}</h2>
              <p className="emp-profile-avatar__role">{draft.department}</p>
              <code className="emp-profile-avatar__id">{draft.employeeId}</code>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="emp-profile-grid">
        {/* Personal Information */}
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-profile-fields">
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Full Name</span>
                {isEditing ? (
                  <Input
                    value={draft.name}
                    onChange={e => setDraft(d => d ? { ...d, name: e.target.value } : null)}
                    fullWidth
                  />
                ) : (
                  <span className="emp-profile-field__value">{draft.name}</span>
                )}
              </div>
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Employee ID</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">{draft.employeeId}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader><CardTitle>Employment Information</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-profile-fields">
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Designation</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">{draft.department}</span>
              </div>
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Department</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">{draft.department}</span>
              </div>
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Office</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">{draft.office}</span>
              </div>
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Region</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">Regional</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-profile-fields">
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Email</span>
                {isEditing ? (
                  <>
                    <Input
                      type="email"
                      value={draft.contact.email}
                      onChange={e => setDraft(d => d ? { ...d, contact: { ...d.contact, email: e.target.value } } : null)}
                      fullWidth
                    />
                    {errors.email && <span className="emp-profile-field__error">{errors.email}</span>}
                  </>
                ) : (
                  <span className="emp-profile-field__value">{draft.contact.email}</span>
                )}
              </div>
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Phone</span>
                {isEditing ? (
                  <>
                    <Input
                      value={draft.contact.phone}
                      onChange={e => setDraft(d => d ? { ...d, contact: { ...d.contact, phone: e.target.value } } : null)}
                      fullWidth
                    />
                    {errors.phone && <span className="emp-profile-field__error">{errors.phone}</span>}
                  </>
                ) : (
                  <span className="emp-profile-field__value">{draft.contact.phone}</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader><CardTitle>Account Security</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-profile-fields">
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Employee ID</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">{draft.employeeId}</span>
              </div>
              <div className="emp-profile-field">
                <span className="emp-profile-field__label">Password</span>
                <span className="emp-profile-field__value emp-profile-field__value--readonly">••••••••</span>
              </div>
            </div>
            <div className="emp-profile-security-actions">
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePasswordSave} loading={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </>
        }
      >
        <div className="emp-pw-form">
          <div className="emp-pw-form__field">
            <label className="emp-pw-form__label">Current Password</label>
            <Input type="password" value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} fullWidth />
            {passwordErrors.currentPassword && <span className="emp-pw-form__error">{passwordErrors.currentPassword}</span>}
          </div>
          <div className="emp-pw-form__field">
            <label className="emp-pw-form__label">New Password</label>
            <Input type="password" value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} fullWidth />
            {passwordErrors.newPassword && <span className="emp-pw-form__error">{passwordErrors.newPassword}</span>}
          </div>
          <div className="emp-pw-form__field">
            <label className="emp-pw-form__label">Confirm New Password</label>
            <Input type="password" value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} fullWidth />
            {passwordErrors.confirmPassword && <span className="emp-pw-form__error">{passwordErrors.confirmPassword}</span>}
          </div>
          <p className="emp-pw-form__note">This is a mock implementation. No real password is stored.</p>
        </div>
      </Modal>

      <style>{empProfileStyles}</style>
    </div>
  );
};

export default EmployeeProfile;

const empProfileStyles = `
  .emp-profile-page { max-width: 1000px; margin: 0 auto; }
  .emp-profile-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3); flex-wrap: wrap; }
  .emp-profile-header__actions { display: flex; align-items: center; gap: var(--space-2); }
  .emp-profile-toast { font-size: var(--font-size-sm); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); }
  .emp-profile-toast--success { background: var(--color-success-100); color: var(--color-success-600); }

  .emp-profile-avatar { display: flex; align-items: center; gap: var(--space-4); }
  .emp-profile-avatar__circle { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--color-navy-700), var(--color-navy-900)); color: var(--color-white); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: var(--font-weight-bold); flex-shrink: 0; }
  .emp-profile-avatar__name { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-navy-900); margin: 0; }
  .emp-profile-avatar__role { font-size: var(--font-size-sm); color: var(--color-gray-600); margin: 4px 0 8px; }
  .emp-profile-avatar__id { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 8px; border-radius: 3px; }

  .emp-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-4); }
  .emp-profile-grid > *:first-child { grid-column: 1 / -1; }
  @media (max-width: 768px) { .emp-profile-grid { grid-template-columns: 1fr; } }

  .emp-profile-fields { display: flex; flex-direction: column; gap: var(--space-3); }
  .emp-profile-field { display: flex; flex-direction: column; gap: 4px; }
  .emp-profile-field__label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .emp-profile-field__value { font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .emp-profile-field__value--readonly { color: var(--color-gray-600); }
  .emp-profile-field__error { font-size: 12px; color: var(--color-error-600); margin-top: 2px; }
  .emp-profile-security-actions { margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--color-gray-200); }

  .emp-pw-form { display: flex; flex-direction: column; gap: var(--space-3); }
  .emp-pw-form__field { display: flex; flex-direction: column; gap: 4px; }
  .emp-pw-form__label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .emp-pw-form__error { font-size: 12px; color: var(--color-error-600); }
  .emp-pw-form__note { background: var(--color-info-100); color: var(--color-info-600); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: 12px; margin: 0; }
  .emp-pw-form__err { background: var(--color-error-100); color: var(--color-error-600); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--font-size-sm); margin-bottom: var(--space-2); }

  .emp-profile-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .emp-profile-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: emp-profile-spin 0.8s linear infinite; }
  @keyframes emp-profile-spin { to { transform: rotate(360deg); } }
`;
