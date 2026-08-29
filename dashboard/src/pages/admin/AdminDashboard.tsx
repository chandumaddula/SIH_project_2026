import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Users, Shield, Server, Activity, Plus, Key, Settings } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const usersList = [
    { id: 'USR-901', name: 'Rajesh Kumar', email: 'officer.rajesh@metrology.gov.in', role: 'Enforcement Officer', status: 'compliant' as const },
    { id: 'USR-902', name: 'Priya Sharma', email: 'priya.s@consumer.org', role: 'Citizen / Consumer', status: 'compliant' as const },
    { id: 'USR-903', name: 'Hindustan Commodities Ltd', email: 'compliance@hcl.co.in', role: 'Organisation', status: 'compliant' as const },
    { id: 'USR-904', name: 'Admin Master', email: 'admin@metrology.gov.in', role: 'System Admin', status: 'compliant' as const },
  ];

  return (
    <PageContainer
      title="System Administrator Console"
      subtitle="Manage system roles, configure Legal Metrology OCR engine parameters, and inspect security audit logs."
      action={
        <Button leftIcon={<Plus size={18} />}>
          Add User / Officer
        </Button>
      }
    >
      {/* System Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Active Users</span>
            <Users size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>1,482</div>
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>+84 new registrations</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Active Rules Configured</span>
            <Shield size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>34</div>
          <span style={{ fontSize: '0.8rem', color: '#6366f1' }}>PCR 2011 & Amendments</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>OCR AI Pipeline Latency</span>
            <Activity size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>240 ms</div>
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>99.9% uptime</span>
        </div>
      </div>

      {/* Quick Config Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Server size={20} color="#6366f1" />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>FastAPI Backend Health</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
            Database connection pool: Healthy (5/20 connections active). Redis Queue: Operational.
          </p>
          <Button variant="secondary" size="sm" leftIcon={<Settings size={14} />}>
            Configure Gateway
          </Button>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Key size={20} color="#10b981" />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>JWT Auth Security Policy</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
            Token expiry: 30 minutes. Password hashing: bcrypt with 12 rounds.
          </p>
          <Button variant="secondary" size="sm" leftIcon={<Key size={14} />}>
            Rotate Secret Keys
          </Button>
        </div>
      </div>

      {/* User Management Table */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Registered System Users</h3>
          <Button variant="ghost" size="sm">Manage Roles</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '14px 24px' }}>User ID</th>
                <th style={{ padding: '14px 24px' }}>Full Name</th>
                <th style={{ padding: '14px 24px' }}>Email Address</th>
                <th style={{ padding: '14px 24px' }}>Role</th>
                <th style={{ padding: '14px 24px' }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#6366f1' }}>{u.id}</td>
                  <td style={{ padding: '16px 24px', color: '#f8fafc', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{u.email}</td>
                  <td style={{ padding: '16px 24px', color: '#cbd5e1', fontWeight: 500 }}>{u.role}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <StatusBadge status={u.status} label="Active" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};
