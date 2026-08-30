import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Inspection } from '../../types/inspection';
import { mockInspections } from '../../services/mockData';

type SortField = 'date' | 'time' | 'product' | 'location' | 'status' | 'compliance';
type SortDirection = 'asc' | 'desc';

export const History: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    setTimeout(() => {
      setInspections(mockInspections);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAndSorted = inspections
    .filter((inspection) => {
      if (statusFilter !== 'all' && inspection.status !== statusFilter) return false;
      if (complianceFilter !== 'all' && inspection.compliance !== complianceFilter) return false;
      if (search && !inspection.product?.toLowerCase().includes(search.toLowerCase()) && !inspection.location.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">View your past inspections and activities</p>
      </div>

      <Card className="history__filters-card">
        <CardBody>
          <div className="history__filters">
            <div className="history__search">
              <Input
                placeholder="Search by product or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </div>
            <div className="history__filter-group">
              <label htmlFor="statusFilter" className="history__filter-label">Status</label>
              <select
                id="statusFilter"
                className="history__filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div className="history__filter-group">
              <label htmlFor="complianceFilter" className="history__filter-label">Compliance</label>
              <select
                id="complianceFilter"
                className="history__filter-select"
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="compliant">Compliant</option>
                <option value="non_compliant">Non-Compliant</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading history...</span>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <EmptyState
          title="No inspections found"
          description="Your inspection history will appear here"
        />
      ) : (
        <div className="history__table-wrapper">
          <table className="history__table">
            <thead>
              <tr>
                <th onClick={() => handleSort('product')} className="history__th--sortable">
                  Product {getSortIcon('product')}
                </th>
                <th onClick={() => handleSort('location')} className="history__th--sortable">
                  Location {getSortIcon('location')}
                </th>
                <th onClick={() => handleSort('date')} className="history__th--sortable">
                  Date {getSortIcon('date')}
                </th>
                <th onClick={() => handleSort('time')} className="history__th--sortable">
                  Time {getSortIcon('time')}
                </th>
                <th onClick={() => handleSort('status')} className="history__th--sortable">
                  Status {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('compliance')} className="history__th--sortable">
                  Compliance {getSortIcon('compliance')}
                </th>
                <th>Complaint</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((inspection) => (
                <tr key={inspection.id}>
                  <td>{inspection.product || 'Unnamed'}</td>
                  <td>{inspection.location}</td>
                  <td>{new Date(inspection.date).toLocaleDateString()}</td>
                  <td>{inspection.time}</td>
                  <td>
                    <Badge
                      variant={
                        inspection.status === 'completed' ? 'success' :
                        inspection.status === 'flagged' ? 'error' :
                        inspection.status === 'in_progress' ? 'info' : 'warning'
                      }
                    >
                      {inspection.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>
                    {inspection.compliance ? (
                      <Badge variant={inspection.compliance === 'compliant' ? 'success' : 'error'}>
                        {inspection.compliance.replace('_', '-')}
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Pending</Badge>
                    )}
                  </td>
                  <td>
                    {inspection.complaintRaised ? (
                      <Badge variant="warning" size="sm">Raised</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">None</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;