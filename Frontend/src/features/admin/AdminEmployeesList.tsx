import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEmployeesService, AdminEmployee, EmployeeFilter } from '../../services/admin/adminEmployees.service';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export const AdminEmployeesList: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filter: EmployeeFilter = { search, department, region, status };
      const [employees, depts, regs] = await Promise.all([
        adminEmployeesService.getEmployees(filter),
        adminEmployeesService.getDepartments(),
        adminEmployeesService.getRegions(),
      ]);
      setList(employees);
      setDepartments(depts);
      setRegions(regs);
    } finally {
      setLoading(false);
    }
  }, [search, department, region, status]);

  useEffect(() => { load(); }, [load]);

  const handleOpen = useCallback((id: string) => {
    navigate(`/admin/employees/${id}`);
  }, [navigate]);

  const handleBack = useCallback(() => navigate('/admin/overview'), [navigate]);

  return (
    <div className="adm-emp">
      <header className="adm-emp__header">
        <div>
          <h1 className="adm-emp__title">Employees</h1>
          <p className="adm-emp__subtitle">Manage employee accounts, regions, and assignments.</p>
        </div>
      </header>

      <section className="adm-emp__filters" aria-label="Employee filters">
        <input
          type="search"
          className="adm-emp__search"
          placeholder="Search by name, employee ID, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="adm-emp__select" value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="adm-emp__select" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
          <option value="all">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="adm-emp__select" value={status} onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')} aria-label="Status">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </section>

      {loading ? (
        <Loading text="Loading employees..." fullPage />
      ) : list.length === 0 ? (
        <div className="adm-emp__empty">
          <p className="adm-emp__empty-icon">👥</p>
          <h2>No employees match your filters</h2>
          <p>Try adjusting your search or filter criteria.</p>
          <Button variant="outline" onClick={() => { setSearch(''); setDepartment('all'); setRegion('all'); setStatus('all'); }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="adm-emp__table-wrap">
          <table className="adm-emp__table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Region</th>
                <th>Inspections</th>
                <th>Pending</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(emp => (
                <tr key={emp.id} onClick={() => handleOpen(emp.id)}>
                  <td>
                    <div className="adm-emp__name-cell">
                      <span className="adm-emp__avatar">{emp.name.charAt(0)}</span>
                      <div>
                        <div className="adm-emp__name">{emp.name}</div>
                        <div className="adm-emp__email">{emp.contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>{emp.employeeId}</code></td>
                  <td>{emp.department}</td>
                  <td>{emp.region}</td>
                  <td className="adm-emp__num">{emp.inspectionCount}</td>
                  <td className="adm-emp__num">
                    {emp.pendingCases > 0 ? (
                      <span className="adm-emp__pending">{emp.pendingCases}</span>
                    ) : <span className="adm-emp__zero">0</span>}
                  </td>
                  <td>
                    <span className={`adm-emp__status adm-emp__status--${emp.status}`}>
                      {emp.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpen(emp.id); }}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-emp__back">
        <Button variant="ghost" onClick={handleBack}>← Back to Overview</Button>
      </div>

      <style>{`
        .adm-emp { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
        .adm-emp__title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: #0f172a; margin: 0 0 var(--space-1) 0; }
        .adm-emp__subtitle { font-size: var(--font-size-sm); color: #475569; margin: 0; }

        .adm-emp__filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-2);
          background: white;
          padding: var(--space-3);
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
        }

        .adm-emp__search, .adm-emp__select {
          padding: var(--space-2) var(--space-3);
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          background: white;
          color: #0f172a;
          font-family: inherit;
        }

        .adm-emp__search:focus, .adm-emp__select:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 1px;
        }

        .adm-emp__table-wrap {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          overflow-x: auto;
        }

        .adm-emp__table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--font-size-sm);
        }

        .adm-emp__table th {
          text-align: left;
          padding: var(--space-3);
          background: #f8fafc;
          color: #475569;
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-xs);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }

        .adm-emp__table td {
          padding: var(--space-3);
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .adm-emp__table tr {
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .adm-emp__table tr:hover {
          background: #f8fafc;
        }

        .adm-emp__name-cell {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .adm-emp__avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-sm);
          flex-shrink: 0;
        }

        .adm-emp__name { font-weight: var(--font-weight-semibold); color: #0f172a; }
        .adm-emp__email { font-size: 11px; color: #94a3b8; }

        .adm-emp__num { text-align: center; font-weight: var(--font-weight-semibold); }
        .adm-emp__pending {
          background: #fef3c7;
          color: #713f12;
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
        }
        .adm-emp__zero { color: #cbd5e1; }

        .adm-emp__status {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
        }
        .adm-emp__status--active { background: #dcfce7; color: #14532d; }
        .adm-emp__status--inactive { background: #f1f5f9; color: #64748b; }

        .adm-emp__empty {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          padding: var(--space-12);
          text-align: center;
          color: #475569;
        }
        .adm-emp__empty-icon { font-size: 3rem; margin: 0 0 var(--space-3) 0; }
        .adm-emp__empty h2 { font-size: var(--font-size-lg); margin: 0 0 var(--space-2) 0; color: #0f172a; }
        .adm-emp__empty p { margin: 0 0 var(--space-4) 0; }

        .adm-emp__back { text-align: center; margin-top: var(--space-4); }

        @media (max-width: 768px) {
          .adm-emp { padding: var(--space-4); }
          .adm-emp__filters {
            grid-template-columns: 1fr;
          }
          .adm-emp__table th:nth-child(2),
          .adm-emp__table td:nth-child(2),
          .adm-emp__table th:nth-child(4),
          .adm-emp__table td:nth-child(4) { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminEmployeesList;
