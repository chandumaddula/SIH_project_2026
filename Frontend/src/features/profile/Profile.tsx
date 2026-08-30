import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useUserStore } from '../../store';
import { Employee } from '../../types/user';

export const Profile: React.FC = () => {
  const { user } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Employee | null>(
    user?.role === 'employee' ? (user as Employee) : null
  );

  if (!user) {
    return (
      <div className="page">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Profile editing only available for employees
  if (user.role !== 'employee') {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Account information</p>
        </div>
        <Card>
          <CardBody>
            <div className="profile__details-grid">
              <div className="profile__field">
                <span className="profile__field-label">Name</span>
                <span className="profile__field-value">{user.name}</span>
              </div>
              <div className="profile__field">
                <span className="profile__field-label">Email</span>
                <span className="profile__field-value">{user.email}</span>
              </div>
              {user.role === 'citizen' && (user as any).phone && (
                <div className="profile__field">
                  <span className="profile__field-label">Phone</span>
                  <span className="profile__field-value">{(user as any).phone}</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const employee = user as Employee;

  const handleEdit = () => {
    setEditedUser(employee);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Phase 1: Mock save - just update local state
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(employee);
    setIsEditing(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your employee profile information</p>
      </div>

      <div className="profile__container">
        <Card className="profile__avatar-card">
          <CardBody>
            <div className="profile__avatar">
              <div className="profile__avatar-image">
                {employee.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
              </div>
              <div className="profile__avatar-info">
                <h2 className="profile__name">{employee.name}</h2>
                <p className="profile__role">{employee.department}</p>
                <p className="profile__employee-id">{employee.employeeId}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="profile__details-card">
          <CardHeader>
            <div className="profile__details-header">
              <CardTitle>Employee Information</CardTitle>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={handleEdit}>Edit</Button>
              ) : (
                <div className="profile__edit-actions">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="profile__details-grid">
              <div className="profile__field">
                <span className="profile__field-label">Full Name</span>
                {isEditing ? (
                  <Input
                    value={editedUser?.name || ''}
                    onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                    fullWidth
                  />
                ) : (
                  <span className="profile__field-value">{employee.name}</span>
                )}
              </div>

              <div className="profile__field">
                <span className="profile__field-label">Employee ID</span>
                <span className="profile__field-value profile__field-value--readonly">
                  {employee.employeeId}
                </span>
              </div>

              <div className="profile__field">
                <span className="profile__field-label">Department</span>
                {isEditing ? (
                  <Input
                    value={editedUser?.department || ''}
                    onChange={(e) => setEditedUser(prev => prev ? { ...prev, department: e.target.value } : null)}
                    fullWidth
                  />
                ) : (
                  <span className="profile__field-value">{employee.department}</span>
                )}
              </div>

              <div className="profile__field">
                <span className="profile__field-label">Office</span>
                {isEditing ? (
                  <Input
                    value={editedUser?.office || ''}
                    onChange={(e) => setEditedUser(prev => prev ? { ...prev, office: e.target.value } : null)}
                    fullWidth
                  />
                ) : (
                  <span className="profile__field-value">{employee.office}</span>
                )}
              </div>

              <div className="profile__field">
                <span className="profile__field-label">Phone</span>
                {isEditing ? (
                  <Input
                    value={editedUser?.contact.phone || ''}
                    onChange={(e) => setEditedUser(prev => prev ? { ...prev, contact: { ...prev.contact, phone: e.target.value } } : null)}
                    fullWidth
                  />
                ) : (
                  <span className="profile__field-value">{employee.contact.phone}</span>
                )}
              </div>

              <div className="profile__field">
                <span className="profile__field-label">Email</span>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedUser?.contact.email || ''}
                    onChange={(e) => setEditedUser(prev => prev ? { ...prev, contact: { ...prev.contact, email: e.target.value } } : null)}
                    fullWidth
                  />
                ) : (
                  <span className="profile__field-value">{employee.contact.email}</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Profile;