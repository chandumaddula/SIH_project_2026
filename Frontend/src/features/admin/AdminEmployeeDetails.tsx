import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminEmployeesService, AdminEmployee } from '../../services/admin/adminEmployees.service';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export const AdminEmployeeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [emp, setEmp] = useState<AdminEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const data = await adminEmployeesService.getEmployee(employeeId);
      setEmp(data);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { load(); }, [load]);

  const handleBack = useCallback(() => navigate('/admin/employees'), [navigate]);

  const handleDeactivate = useCallback(async () => {
    if (!emp) return;
    if (!confirm(`Deactivate ${emp.name}?`)) return;
    const updated = await adminEmployeesService.deactivateEmployee(emp.id);
    if (updated) {
      setEmp(updated);
      setActionMsg(`${emp.name} has been deactivated.`);
      setTimeout(() => setActionMsg(null), 3000);
    }
  }, [emp]);

  const handleActivate = useCallback(async () => {
    if (!emp) return;
    const updated = await adminEmployeesService.activateEmployee(emp.id);
    if (updated) {
      setEmp(updated);
      setActionMsg(`${emp.name} has been activated.`);
      setTimeout(() => setActionMsg(null), 3000);
    }
  }, [emp]);

  const handleAssign = useCallback(() => {
    alert('Assignment workflow: opens a modal to assign cases. (Demo placeholder)');
  }, []);

  if (loading) return <Loading text="Loading employee..." fullPage />;
  if (!emp) {
    return (
      <div className="adm-emp-det__notfound">
        <p>Employee not found.</p>
        <Button variant="primary" onClick={handleBack}>← Back to Employees</Button>
      </div>
    );
  }

  return (
    <div className="adm-emp-det">
      <button className="adm-emp-det__back" onClick={handleBack}>← Back to Employees</button>

      {actionMsg && (
        <div className="adm-emp-det__toast" role="status">{actionMsg}</div>
      )}

      <header className="adm-emp-det__header">
        <div className="adm-emp-det__avatar-lg">{emp.name.charAt(0)}</div>
        <div className="adm-emp-det__title-block">
          <h1 className="adm-emp-det__name">{emp.name}</h1>
          <div className="adm-emp-det__meta">
            <code className="adm-emp-det__id">{emp.employeeId}</code>
            <span className={`adm-emp-det__status adm-emp-det__status--${emp.status}`}>
              {emp.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
            </span>
          </div>
          <p className="adm-emp-det__dept">{emp.department} · {emp.office} · {emp.region}</p>
        </div>
        <div className="adm-emp-det__actions">
          {emp.status === 'active' ? (
            <Button variant="outline" onClick={handleDeactivate}>Deactivate</Button>
          ) : (
            <Button variant="primary" onClick={handleActivate}>Activate</Button>
          )}
          <Button variant="primary" onClick={handleAssign}>Assign Case</Button>
        </div>
      </header>

      <div className="adm-emp-det__grid">
        <section className="adm-emp-det__section">
          <h2 className="adm-emp-det__section-title">Contact</h2>
          <DetailRow label="Email" value={emp.contact.email} />
          <DetailRow label="Phone" value={emp.contact.phone} />
          <DetailRow label="Office" value={emp.office} />
        </section>

        <section className="adm-emp-det__section">
          <h2 className="adm-emp-det__section-title">Activity</h2>
          <div className="adm-emp-det__stats">
            <Stat label="Inspections" value={emp.inspectionCount} color="#3b82f6" />
            <Stat label="Pending Cases" value={emp.pendingCases} color={emp.pendingCases > 0 ? '#f59e0b' : '#94a3b8'} />
            <Stat label="Region" value={emp.region} color="#1e40af" isText />
          </div>
          {emp.lastInspection && (
            <DetailRow label="Last Inspection" value={new Date(emp.lastInspection).toLocaleDateString()} />
          )}
          <DetailRow label="Joined" value={new Date(emp.joinedAt).toLocaleDateString()} />
        </section>
      </div>

      <style>{`
        .adm-emp-det { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
        .adm-emp-det__back {
          background: none; border: none; color: #3b82f6; font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium); cursor: pointer; padding: 0; text-align: left;
          font-family: inherit; align-self: flex-start;
        }
        .adm-emp-det__back:hover { text-decoration: underline; }

        .adm-emp-det__toast {
          background: #dcfce7; border: 1px solid #16a34a; color: #14532d;
          padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);
          font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
        }

        .adm-emp-det__header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: var(--space-5);
          align-items: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .adm-emp-det__avatar-lg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-emp-det__name {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: #0f172a;
          margin: 0 0 var(--space-1) 0;
        }

        .adm-emp-det__meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-1);
        }

        .adm-emp-det__id {
          font-family: var(--font-family-mono);
          font-size: 11px;
          background: #f1f5f9;
          color: #475569;
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
        }

        .adm-emp-det__status {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
        }
        .adm-emp-det__status--active { background: #dcfce7; color: #14532d; }
        .adm-emp-det__status--inactive { background: #f1f5f9; color: #64748b; }

        .adm-emp-det__dept {
          font-size: var(--font-size-sm);
          color: #475569;
          margin: 0;
        }

        .adm-emp-det__actions {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .adm-emp-det__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .adm-emp-det__section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .adm-emp-det__section-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: #0f172a;
          margin: 0 0 var(--space-3) 0;
          padding-bottom: var(--space-2);
          border-bottom: 1px solid #f1f5f9;
        }

        .adm-emp-det__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .adm-emp-det__notfound {
          padding: var(--space-6);
          text-align: center;
        }

        @media (max-width: 768px) {
          .adm-emp-det { padding: var(--space-4); }
          .adm-emp-det__header { grid-template-columns: 1fr; text-align: center; }
          .adm-emp-det__avatar-lg { margin: 0 auto; }
          .adm-emp-det__actions { justify-content: center; }
          .adm-emp-det__grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
    <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 500 }}>{value}</span>
  </div>
);

const Stat: React.FC<{ label: string; value: number | string; color: string; isText?: boolean }> = ({ label, value, color, isText }) => (
  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 8, textAlign: 'center' }}>
    <div style={{ fontSize: isText ? 14 : 24, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{label}</div>
  </div>
);

export default AdminEmployeeDetails;
