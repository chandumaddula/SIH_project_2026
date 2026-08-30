import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useUserStore } from '../../store';
import { Employee } from '../../types/user';
import {
  employeeDashboardService,
  DashboardStats,
  ComplianceOverview,
  RecentInspection,
  RecentComplaint,
  ActionItem,
  DashboardUpdate,
  ComplianceStatus,
  ActionPriority,
  AnnouncementCategory,
} from '../../services/employeeDashboard.service';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

/* ==========================================================================
   Helpers
   ========================================================================== */

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getStatusLabel = (s: ComplianceStatus): string => {
  switch (s) {
    case 'pass': return 'PASS';
    case 'review_required': return 'REVIEW REQUIRED';
    case 'potential_issue': return 'POTENTIAL ISSUE';
  }
};

const getStatusVariant = (s: ComplianceStatus): 'success' | 'warning' | 'error' => {
  switch (s) {
    case 'pass': return 'success';
    case 'review_required': return 'warning';
    case 'potential_issue': return 'error';
  }
};

const getPriorityVariant = (p: ActionPriority): 'error' | 'warning' | 'info' => {
  switch (p) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'normal': return 'info';
  }
};

const getCategoryLabel = (c: AnnouncementCategory): string => {
  switch (c) {
    case 'announcement': return 'Department Announcement';
    case 'campaign': return 'Inspection Campaign';
    case 'update': return 'Compliance Update';
    case 'system': return 'System Announcement';
    case 'notification': return 'Legal Metrology Notification';
  }
};

const getCategoryVariant = (c: AnnouncementCategory): 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'neutral' => {
  switch (c) {
    case 'announcement': return 'primary';
    case 'campaign': return 'accent';
    case 'update': return 'info';
    case 'system': return 'warning';
    case 'notification': return 'success';
  }
};

const COMPLIANCE_COLORS: Record<ComplianceStatus, string> = {
  pass: '#43a047',
  review_required: '#fb8c00',
  potential_issue: '#e53935',
};

const COMPLIANCE_DOT: Record<ComplianceStatus, string> = {
  pass: '🟢',
  review_required: '🟡',
  potential_issue: '🔴',
};

const COMPLIANCE_FILTERS: Array<{ key: 'today' | '7days' | '30days' | 'all'; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: '7 Days' },
  { key: '30days', label: '30 Days' },
  { key: 'all', label: 'All' },
];

/* ==========================================================================
   Stat Card
   ========================================================================== */

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
}> = ({ icon, label, value, tone }) => (
  <Card className={`emp-home__stat emp-home__stat--${tone}`} padding="md">
    <CardBody>
      <div className="emp-home__stat-inner">
        <div className={`emp-home__stat-icon emp-home__stat-icon--${tone}`}>{icon}</div>
        <div className="emp-home__stat-body">
          <div className="emp-home__stat-value">{value.toLocaleString()}</div>
          <div className="emp-home__stat-label">{label}</div>
        </div>
      </div>
    </CardBody>
  </Card>
);

/* ==========================================================================
   Inspection Card (mobile)
   ========================================================================== */

const InspectionCard: React.FC<{ inspection: RecentInspection; onView: () => void }> = ({ inspection, onView }) => (
  <div className="emp-home__inspection-card">
    <div className="emp-home__inspection-card-top">
      <div>
        <div className="emp-home__inspection-id">{inspection.id}</div>
        <div className="emp-home__inspection-product">{inspection.product}</div>
      </div>
      <Badge variant={getStatusVariant(inspection.status)}>
        {COMPLIANCE_DOT[inspection.status]} {getStatusLabel(inspection.status)}
      </Badge>
    </div>
    <div className="emp-home__inspection-meta">
      <div>📍 {inspection.location}</div>
      <div>📅 {inspection.date} · {inspection.time}</div>
      <div>👤 {inspection.officer}</div>
    </div>
    <div className="emp-home__inspection-actions">
      <Button variant="ghost" size="sm" onClick={onView}>View</Button>
      <Button variant="ghost" size="sm" onClick={onView}>Continue</Button>
      <Button variant="primary" size="sm" onClick={onView}>Report</Button>
    </div>
  </div>
);

/* ==========================================================================
   Complaint Card (mobile)
   ========================================================================== */

const ComplaintCard: React.FC<{ complaint: RecentComplaint; onView: () => void; onCreate: () => void }> = ({ complaint, onView, onCreate }) => (
  <div className="emp-home__complaint-card">
    <div className="emp-home__complaint-card-top">
      <div>
        <div className="emp-home__complaint-id">{complaint.id}</div>
        <div className="emp-home__complaint-product">{complaint.product}</div>
      </div>
      <Badge variant={complaint.priority === 'high' ? 'error' : complaint.priority === 'medium' ? 'warning' : 'info'} size="sm">
        {complaint.priority.toUpperCase()}
      </Badge>
    </div>
    <p className="emp-home__complaint-issue">{complaint.issue}</p>
    <div className="emp-home__complaint-meta">
      <div>📍 {complaint.location}</div>
      <div>🕒 {complaint.submittedAt}</div>
      <div>📎 {complaint.evidenceCount} Evidence {complaint.evidenceCount === 1 ? 'Image' : 'Images'}</div>
    </div>
    <div className="emp-home__complaint-badges">
      <Badge variant={complaint.status === 'new' ? 'error' : complaint.status === 'under_review' ? 'warning' : 'success'} size="sm">
        {complaint.status === 'new' ? 'New' : complaint.status === 'under_review' ? 'Under Review' : 'Resolved'}
      </Badge>
    </div>
    <div className="emp-home__complaint-actions">
      <Button variant="ghost" size="sm" onClick={onView}>View Complaint</Button>
      <Button variant="primary" size="sm" onClick={onCreate}>Create Inspection</Button>
    </div>
  </div>
);

/* ==========================================================================
   Action Item Card
   ========================================================================== */

const ActionItemRow: React.FC<{ item: ActionItem; onOpen: () => void }> = ({ item, onOpen }) => (
  <div className={`emp-home__action-item emp-home__action-item--${item.priority}`}>
    <div className="emp-home__action-item-bullet" aria-hidden="true" />
    <div className="emp-home__action-item-body">
      <div className="emp-home__action-item-top">
        <Badge variant={getPriorityVariant(item.priority)} size="sm">
          {item.priority.toUpperCase()}
        </Badge>
        <span className="emp-home__action-item-ref">{item.referenceId}</span>
        {item.dueDate && (
          <span className="emp-home__action-item-due">Due: {item.dueDate}</span>
        )}
      </div>
      <h4 className="emp-home__action-item-title">{item.title}</h4>
      <p className="emp-home__action-item-desc">{item.description}</p>
    </div>
    <Button variant="ghost" size="sm" onClick={onOpen}>Open</Button>
  </div>
);

/* ==========================================================================
   Main component
   ========================================================================== */

export const EmployeeHome: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [compliance, setCompliance] = useState<ComplianceOverview | null>(null);
  const [complianceFilter, setComplianceFilter] = useState<'today' | '7days' | '30days' | 'all'>('30days');
  const [inspections, setInspections] = useState<RecentInspection[]>([]);
  const [complaints, setComplaints] = useState<RecentComplaint[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setStats(employeeDashboardService.getStats());
      setCompliance(employeeDashboardService.getComplianceOverview('30days'));
      setInspections(employeeDashboardService.getRecentInspections());
      setComplaints(employeeDashboardService.getRecentComplaints());
      setActions(employeeDashboardService.getActionItems());
      setUpdates(employeeDashboardService.getUpdates());
      setLoading(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (showCustomRange) return;
    setCompliance(employeeDashboardService.getComplianceOverview(complianceFilter));
  }, [complianceFilter, showCustomRange]);

  // Build chart data
  const chartData = useMemo(() => {
    if (!compliance) return [];
    return [
      { key: 'pass' as ComplianceStatus, name: 'PASS', value: compliance.pass, color: COMPLIANCE_COLORS.pass },
      { key: 'review_required' as ComplianceStatus, name: 'REVIEW REQUIRED', value: compliance.reviewRequired, color: COMPLIANCE_COLORS.review_required },
      { key: 'potential_issue' as ComplianceStatus, name: 'POTENTIAL ISSUE', value: compliance.potentialIssue, color: COMPLIANCE_COLORS.potential_issue },
    ];
  }, [compliance]);

  const handleNewInspection = () => {
    navigate('/employee/inspection/new');
  };

  const handleViewInspection = (_id: string) => {
    navigate(`/employee/inspection`);
  };

  const handleViewComplaint = () => {
    navigate('/employee/complaints');
  };

  const handleCreateFromComplaint = () => {
    navigate('/employee/scan');
  };

  const handleActionOpen = (item: ActionItem) => {
    if (item.type === 'complaint') navigate('/employee/complaints');
    else if (item.type === 'report') navigate('/employee/reports');
    else if (item.type === 'inspection' || item.type === 'issue' || item.type === 'follow_up') navigate('/employee/inspection');
  };

  const handleComplianceSegmentClick = (_status: ComplianceStatus) => {
    navigate('/employee/inspection');
  };

  const handleApplyCustomRange = () => {
    // In a real app, this would call the service with custom dates
    // For now, we keep the current view and close the date picker
    setShowCustomRange(false);
  };

  if (loading || !stats || !compliance) {
    return (
      <div className="page">
        <div className="emp-home__loading">
          <div className="emp-home__loading-spinner" />
          <span className="emp-home__loading-text">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const employee = user?.role === 'employee' ? (user as Employee) : null;
  const firstName = user?.name?.split(' ')[0] ?? 'Officer';
  const department = employee?.department ?? 'Legal Metrology';
  const office = employee?.office ?? 'Regional Office';

  return (
    <div className="page emp-home">
      {/* === Greeting === */}
      <section className="emp-home__greeting">
        <div className="emp-home__greeting-text">
          <h1 className="emp-home__greeting-title">
            {getGreeting()}, Officer {firstName} 👋
          </h1>
          <p className="emp-home__greeting-meta">
            {user?.name} · {department} · {office}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNewInspection}
          className="emp-home__quick-action"
        >
          <span className="emp-home__quick-action-icon" aria-hidden="true">+</span>
          New Inspection
        </Button>
      </section>

      {/* === Stats === */}
      <section className="emp-home__stats">
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
          label="Total Inspections"
          value={stats.totalInspections}
          tone="primary"
        />
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
          label="Products Scanned"
          value={stats.productsScanned}
          tone="info"
        />
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          label="Pending Reviews"
          value={stats.pendingReviews}
          tone="warning"
        />
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          label="Open Complaints"
          value={stats.openComplaints}
          tone="error"
        />
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Potential Issues"
          value={stats.potentialIssues}
          tone="error"
        />
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 14 11 16 15 12"/></svg>}
          label="Completed Reports"
          value={stats.completedReports}
          tone="success"
        />
      </section>

      {/* === Compliance Overview === */}
      <section className="emp-home__section">
        <Card className="emp-home__compliance-card">
          <CardHeader>
            <div className="emp-home__section-header">
              <CardTitle>Compliance Overview</CardTitle>
              <div className="emp-home__compliance-filters" role="tablist" aria-label="Date filter">
                {COMPLIANCE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={complianceFilter === f.key && !showCustomRange}
                    className={`emp-home__filter-btn ${complianceFilter === f.key && !showCustomRange ? 'emp-home__filter-btn--active' : ''}`}
                    onClick={() => {
                      setShowCustomRange(false);
                      setComplianceFilter(f.key);
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`emp-home__filter-btn ${showCustomRange ? 'emp-home__filter-btn--active' : ''}`}
                  onClick={() => setShowCustomRange(prev => !prev)}
                >
                  Custom Range
                </button>
              </div>
            </div>
            {showCustomRange && (
              <div className="emp-home__custom-range">
                <label className="emp-home__custom-range-field">
                  <span>From</span>
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                </label>
                <label className="emp-home__custom-range-field">
                  <span>To</span>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                </label>
                <Button variant="primary" size="sm" onClick={handleApplyCustomRange}>Apply</Button>
              </div>
            )}
          </CardHeader>
          <CardBody>
            <div className="emp-home__compliance-body">
              <div className="emp-home__compliance-chart">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(_, idx) => {
                        const seg = chartData[idx];
                        if (seg) handleComplianceSegmentClick(seg.key);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} inspections`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="emp-home__compliance-legend">
                {chartData.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    className="emp-home__compliance-legend-item"
                    onClick={() => handleComplianceSegmentClick(entry.key)}
                  >
                    <span
                      className="emp-home__compliance-legend-dot"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="emp-home__compliance-legend-label">
                      {COMPLIANCE_DOT[entry.key]} {entry.name}
                    </span>
                    <span className="emp-home__compliance-legend-value">{entry.value}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="emp-home__compliance-disclaimer">
              <em>Demo data only. These figures reflect automated screening; final verification is performed by the authorized officer.</em>
            </p>
          </CardBody>
        </Card>
      </section>

      {/* === Recent Inspections === */}
      <section className="emp-home__section">
        <Card className="emp-home__inspections-card">
          <CardHeader>
            <div className="emp-home__section-header">
              <CardTitle>Recent Inspections</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/employee/inspection')}>View All</Button>
            </div>
          </CardHeader>
          <CardBody className="emp-home__inspections-body">
            {inspections.length === 0 ? (
              <EmptyState
                title="No inspections found"
                description="Your recent inspections will appear here"
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="emp-home__table-wrapper">
                  <table className="emp-home__table">
                    <thead>
                      <tr>
                        <th>Inspection ID</th>
                        <th>Product</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Officer</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.map((insp) => (
                        <tr key={insp.id}>
                          <td className="emp-home__td-id">{insp.id}</td>
                          <td>{insp.product}</td>
                          <td>{insp.location}</td>
                          <td>{insp.date}</td>
                          <td>{insp.time}</td>
                          <td>
                            <Badge variant={getStatusVariant(insp.status)}>
                              {getStatusLabel(insp.status)}
                            </Badge>
                          </td>
                          <td>{insp.officer}</td>
                          <td>
                            <div className="emp-home__row-actions">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInspection(insp.id)}>View</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleViewInspection(insp.id)}>Continue</Button>
                              <Button variant="primary" size="sm" onClick={() => handleViewInspection(insp.id)}>Report</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="emp-home__card-list">
                  {inspections.map((insp) => (
                    <InspectionCard
                      key={insp.id}
                      inspection={insp}
                      onView={() => handleViewInspection(insp.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </section>

      {/* === Recent Citizen Complaints === */}
      <section className="emp-home__section">
        <Card className="emp-home__complaints-card">
          <CardHeader>
            <div className="emp-home__section-header">
              <CardTitle>Recent Citizen Complaints</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/employee/complaints')}>View All</Button>
            </div>
          </CardHeader>
          <CardBody className="emp-home__complaints-body">
            {complaints.length === 0 ? (
              <EmptyState
                title="No complaints assigned"
                description="Citizen complaints will appear here"
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="emp-home__table-wrapper">
                  <table className="emp-home__table">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Product</th>
                        <th>Issue</th>
                        <th>Location</th>
                        <th>Submitted</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Evidence</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c.id}>
                          <td className="emp-home__td-id">{c.id}</td>
                          <td>{c.product}</td>
                          <td className="emp-home__td-issue">{c.issue}</td>
                          <td>{c.location}</td>
                          <td>{c.submittedAt}</td>
                          <td>
                            <Badge
                              variant={c.priority === 'high' ? 'error' : c.priority === 'medium' ? 'warning' : 'info'}
                              size="sm"
                            >
                              {c.priority.toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              variant={c.status === 'new' ? 'error' : c.status === 'under_review' ? 'warning' : 'success'}
                              size="sm"
                            >
                              {c.status === 'new' ? 'New' : c.status === 'under_review' ? 'Under Review' : 'Resolved'}
                            </Badge>
                          </td>
                          <td>{c.evidenceCount} {c.evidenceCount === 1 ? 'Image' : 'Images'}</td>
                          <td>
                            <div className="emp-home__row-actions">
                              <Button variant="ghost" size="sm" onClick={handleViewComplaint}>View</Button>
                              <Button variant="primary" size="sm" onClick={handleCreateFromComplaint}>Create Inspection</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="emp-home__card-list">
                  {complaints.map((c) => (
                    <ComplaintCard
                      key={c.id}
                      complaint={c}
                      onView={handleViewComplaint}
                      onCreate={handleCreateFromComplaint}
                    />
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </section>

      {/* === Action Required === */}
      <section className="emp-home__section">
        <Card className="emp-home__actions-card">
          <CardHeader>
            <div className="emp-home__section-header">
              <CardTitle>Action Required</CardTitle>
              <Badge variant="error">{actions.filter(a => a.priority === 'high').length} High Priority</Badge>
            </div>
          </CardHeader>
          <CardBody>
            {actions.length === 0 ? (
              <EmptyState
                title="All caught up"
                description="No actions require your attention right now"
              />
            ) : (
              <div className="emp-home__action-list">
                {actions.map((item) => (
                  <ActionItemRow
                    key={item.id}
                    item={item}
                    onOpen={() => handleActionOpen(item)}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* === Government / Department Updates === */}
      <section className="emp-home__section">
        <Card className="emp-home__updates-card">
          <CardHeader>
            <div className="emp-home__section-header">
              <CardTitle>Government / Department Updates</CardTitle>
              <Badge variant="primary">{updates.length} Updates</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="emp-home__updates-list">
              {updates.map((u) => (
                <div key={u.id} className="emp-home__update">
                  <div className="emp-home__update-top">
                    <Badge variant={getCategoryVariant(u.category)} size="sm">
                      {getCategoryLabel(u.category)}
                    </Badge>
                    <span className="emp-home__update-date">📅 {u.date}</span>
                    <span className="emp-home__update-office">🏢 {u.office}</span>
                  </div>
                  <h4 className="emp-home__update-title">{u.title}</h4>
                  <p className="emp-home__update-body">{u.body}</p>
                  <div className="emp-home__update-actions">
                    <Button variant="ghost" size="sm">Read More</Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="emp-home__updates-disclaimer">
              <em>Demo / illustrative content. Department updates shown here are sample data and do not represent official Government of India notifications or amendments to any legal rules.</em>
            </p>
          </CardBody>
        </Card>
      </section>

      <style>{`
        .emp-home {
          padding: var(--space-6);
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Loading */
        .emp-home__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          gap: var(--space-4);
        }
        .emp-home__loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-gray-200);
          border-top-color: var(--color-navy-500);
          border-radius: 50%;
          animation: emp-home-spin 0.8s linear infinite;
        }
        .emp-home__loading-text { color: var(--color-gray-600); }
        @keyframes emp-home-spin { to { transform: rotate(360deg); } }

        /* Greeting */
        .emp-home__greeting {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-5);
          flex-wrap: wrap;
          margin-bottom: var(--space-6);
        }
        .emp-home__greeting-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-1);
        }
        .emp-home__greeting-meta {
          font-size: var(--font-size-base);
          color: var(--color-gray-600);
          margin: 0;
        }
        .emp-home__quick-action {
          white-space: nowrap;
        }
        .emp-home__quick-action-icon {
          font-size: 1.4rem;
          font-weight: var(--font-weight-bold);
          line-height: 1;
          margin-right: 4px;
        }

        /* Stats */
        .emp-home__stats {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .emp-home__stat-inner {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .emp-home__stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .emp-home__stat-icon--primary { background: var(--color-navy-100); color: var(--color-navy-700); }
        .emp-home__stat-icon--info { background: var(--color-info-100); color: var(--color-info-600); }
        .emp-home__stat-icon--warning { background: var(--color-warning-100); color: var(--color-warning-600); }
        .emp-home__stat-icon--error { background: var(--color-error-100); color: var(--color-error-600); }
        .emp-home__stat-icon--success { background: var(--color-success-100); color: var(--color-success-600); }
        .emp-home__stat-icon--neutral { background: var(--color-gray-100); color: var(--color-gray-700); }

        .emp-home__stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          line-height: 1.1;
        }
        .emp-home__stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-top: 2px;
        }

        @media (max-width: 1199px) {
          .emp-home__stats { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .emp-home__stats { grid-template-columns: repeat(2, 1fr); }
        }

        /* Section */
        .emp-home__section { margin-bottom: var(--space-6); }
        .emp-home__section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        /* Compliance */
        .emp-home__compliance-filters {
          display: flex;
          gap: var(--space-1);
          background: var(--color-gray-100);
          border-radius: var(--radius-md);
          padding: 3px;
        }
        .emp-home__filter-btn {
          background: transparent;
          border: none;
          padding: 6px 12px;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          color: var(--color-gray-700);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }
        .emp-home__filter-btn:hover {
          color: var(--color-navy-900);
        }
        .emp-home__filter-btn--active {
          background: var(--color-white);
          color: var(--color-navy-900);
          font-weight: var(--font-weight-semibold);
          box-shadow: var(--shadow-sm);
        }

        .emp-home__custom-range {
          display: flex;
          align-items: flex-end;
          gap: var(--space-3);
          padding: var(--space-3) 0 0;
          margin-top: var(--space-3);
          border-top: 1px solid var(--color-gray-200);
          flex-wrap: wrap;
        }
        .emp-home__custom-range-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }
        .emp-home__custom-range-field input {
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          background: var(--color-white);
        }

        .emp-home__compliance-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          align-items: center;
        }
        .emp-home__compliance-chart {
          min-height: 260px;
        }
        .emp-home__compliance-legend {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .emp-home__compliance-legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-gray-100);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background-color var(--transition-fast);
        }
        .emp-home__compliance-legend-item:hover {
          background: var(--color-navy-50);
        }
        .emp-home__compliance-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .emp-home__compliance-legend-label {
          flex: 1;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-navy-900);
        }
        .emp-home__compliance-legend-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
        }
        .emp-home__compliance-disclaimer {
          margin: var(--space-4) 0 0;
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
          text-align: center;
        }

        @media (max-width: 768px) {
          .emp-home__compliance-body { grid-template-columns: 1fr; }
        }

        /* Inspections & Complaints tables */
        .emp-home__inspections-body,
        .emp-home__complaints-body {
          padding: 0 !important;
        }
        .emp-home__table-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        .emp-home__table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }
        .emp-home__table th {
          text-align: left;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: var(--space-3) var(--space-4);
          background: var(--color-navy-50);
          border-bottom: 1px solid var(--color-gray-200);
          white-space: nowrap;
        }
        .emp-home__table td {
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
          border-bottom: 1px solid var(--color-gray-200);
          vertical-align: middle;
        }
        .emp-home__table tr:last-child td { border-bottom: none; }
        .emp-home__table tr:hover td { background: var(--color-navy-50); }
        .emp-home__td-id {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs);
          color: var(--color-navy-700);
          font-weight: var(--font-weight-semibold);
        }
        .emp-home__td-issue {
          max-width: 280px;
          white-space: normal;
        }
        .emp-home__row-actions {
          display: flex;
          gap: var(--space-1);
          flex-wrap: nowrap;
        }

        /* Mobile card list */
        .emp-home__card-list { display: none; flex-direction: column; gap: var(--space-3); padding: var(--space-4); }
        .emp-home__inspection-card,
        .emp-home__complaint-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .emp-home__inspection-card-top,
        .emp-home__complaint-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-3);
        }
        .emp-home__inspection-id,
        .emp-home__complaint-id {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-700);
        }
        .emp-home__inspection-product,
        .emp-home__complaint-product {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin-top: 2px;
        }
        .emp-home__complaint-issue {
          font-size: var(--font-size-sm);
          color: var(--color-gray-700);
          margin: 0;
        }
        .emp-home__inspection-meta,
        .emp-home__complaint-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }
        .emp-home__complaint-badges {
          display: flex;
          gap: var(--space-2);
        }
        .emp-home__inspection-actions,
        .emp-home__complaint-actions {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-top: var(--space-2);
        }

        /* Switch to mobile cards on small screens */
        @media (max-width: 768px) {
          .emp-home__table-wrapper { display: none; }
          .emp-home__card-list { display: flex; }
        }

        /* Action items */
        .emp-home__action-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .emp-home__action-item {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-left: 4px solid var(--color-gray-300);
          border-radius: var(--radius-md);
        }
        .emp-home__action-item--high { border-left-color: var(--color-error-600); background: #fff7f6; }
        .emp-home__action-item--medium { border-left-color: var(--color-warning-600); background: #fff9f0; }
        .emp-home__action-item--normal { border-left-color: var(--color-info-600); background: #f5fafe; }
        .emp-home__action-item-body { flex: 1; }
        .emp-home__action-item-top {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
          flex-wrap: wrap;
        }
        .emp-home__action-item-ref {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs);
          color: var(--color-navy-700);
        }
        .emp-home__action-item-due {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }
        .emp-home__action-item-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-1);
        }
        .emp-home__action-item-desc {
          font-size: var(--font-size-sm);
          color: var(--color-gray-700);
          margin: 0;
        }
        .emp-home__action-item-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-gray-400);
          margin-top: 10px;
          flex-shrink: 0;
        }

        /* Updates */
        .emp-home__updates-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .emp-home__update {
          padding: var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
        }
        .emp-home__update-top {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
          margin-bottom: var(--space-2);
        }
        .emp-home__update-date,
        .emp-home__update-office {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }
        .emp-home__update-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-2);
        }
        .emp-home__update-body {
          font-size: var(--font-size-sm);
          color: var(--color-gray-700);
          line-height: var(--line-height-relaxed);
          margin: 0 0 var(--space-3);
        }
        .emp-home__update-actions {
          display: flex;
          gap: var(--space-2);
        }
        .emp-home__updates-disclaimer {
          margin: var(--space-4) 0 0;
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
          background: var(--color-warning-100);
          border-left: 3px solid var(--color-warning-600);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
        }

        /* Mobile greeting */
        @media (max-width: 640px) {
          .emp-home__greeting-title { font-size: var(--font-size-2xl); }
          .emp-home__greeting { flex-direction: column; align-items: flex-start; }
          .emp-home__quick-action { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeHome;
