import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useUserStore } from '../../store';
import { CitizenComplaint } from '../../types/complaint';
import { GovtAnnouncement } from '../../types/announcement';
import { Inspection } from '../../types/inspection';
import { mockComplaints, mockAnnouncements, mockInspections } from '../../services/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const Home: React.FC = () => {
  const { user } = useUserStore();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [announcements, setAnnouncements] = useState<GovtAnnouncement[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock data
    setTimeout(() => {
      setComplaints(mockComplaints);
      setAnnouncements(mockAnnouncements);
      setInspections(mockInspections);
      setLoading(false);
    }, 500);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusBadge = (status: CitizenComplaint['status']) => {
    const variants: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
      NEW: 'warning',
      ASSIGNED: 'info',
      UNDER_INSPECTION: 'warning',
      RESOLVED: 'success',
      CLOSED: 'neutral',
    };
    return <Badge variant={variants[status] ?? 'neutral'}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: GovtAnnouncement['priority']) => {
    const variants: Record<string, 'error' | 'warning' | 'info'> = {
      high: 'error',
      medium: 'warning',
      low: 'info'
    };
    return <Badge variant={variants[priority]} size="sm">{priority}</Badge>;
  };

  // Chart data for inspection statistics
  const inspectionChartData = [
    { name: 'Completed', value: inspections.filter(i => i.status === 'completed').length, color: '#43a047' },
    { name: 'Scheduled', value: inspections.filter(i => i.status === 'scheduled').length, color: '#3f51b5' },
    { name: 'In Progress', value: inspections.filter(i => i.status === 'in_progress').length, color: '#fb8c00' },
    { name: 'Flagged', value: inspections.filter(i => i.status === 'flagged').length, color: '#e53935' }
  ].filter(d => d.value > 0);

  // Compliance chart data
  const complianceChartData = [
    { name: 'Compliant', value: inspections.filter(i => i.compliance === 'compliant').length, color: '#43a047' },
    { name: 'Non-Compliant', value: inspections.filter(i => i.compliance === 'non_compliant').length, color: '#e53935' },
    { name: 'Pending', value: inspections.filter(i => !i.compliance).length, color: '#9e9e9e' }
  ];

  const pendingComplaints = complaints.filter(c => c.status === 'NEW').length;
  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(i => i.status === 'completed').length;
  const flaggedInspections = inspections.filter(i => i.status === 'flagged').length;

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Greeting Section */}
      <section className="home__greeting">
        <h1 className="home__greeting-title">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Employee'}
        </h1>
        <p className="home__greeting-subtitle">
          Welcome to your Metrology Dashboard. Here's an overview of your recent activity.
        </p>
      </section>

      {/* Quick Stats */}
      <section className="home__stats">
        <div className="home__stat-card">
          <div className="home__stat-icon home__stat-icon--complaints">📋</div>
          <div className="home__stat-content">
            <span className="home__stat-value">{pendingComplaints}</span>
            <span className="home__stat-label">Pending Complaints</span>
          </div>
        </div>
        <div className="home__stat-card">
          <div className="home__stat-icon home__stat-icon--inspections">🔍</div>
          <div className="home__stat-content">
            <span className="home__stat-value">{completedInspections}/{totalInspections}</span>
            <span className="home__stat-label">Inspections Done</span>
          </div>
        </div>
        <div className="home__stat-card">
          <div className="home__stat-icon home__stat-icon--flagged">⚠️</div>
          <div className="home__stat-content">
            <span className="home__stat-value">{flaggedInspections}</span>
            <span className="home__stat-label">Flagged Items</span>
          </div>
        </div>
      </section>

      <div className="home__grid">
        {/* Complaints Section */}
        <Card className="home__complaints">
          <CardHeader>
            <CardTitle>Citizen Complaints</CardTitle>
            <Badge variant="warning">{pendingComplaints} Pending</Badge>
          </CardHeader>
          <CardBody>
            {complaints.slice(0, 4).map((complaint) => (
              <div key={complaint.id} className="home__complaint-item">
                <div className="home__complaint-info">
                  <h4 className="home__complaint-product">{complaint.product}</h4>
                  <p className="home__complaint-issue">{complaint.issue}</p>
                  <div className="home__complaint-meta">
                    {complaint.location && <span>📍 {complaint.location}</span>}
                    {complaint.reporterName && <span>👤 {complaint.reporterName}</span>}
                  </div>
                </div>
                <div className="home__complaint-status">
                  {getStatusBadge(complaint.status)}
                  <span className="home__complaint-date">
                    {new Date(complaint.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Inspection Chart */}
        <Card className="home__chart">
          <CardHeader>
            <CardTitle>Inspection History</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="home__chart-container">
              <h4>By Status</h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={inspectionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {inspectionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <h4>By Compliance</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={complianceChartData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {complianceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Government Updates */}
        <Card className="home__updates">
          <CardHeader>
            <CardTitle>Government Office Updates</CardTitle>
            <Badge variant="accent">{announcements.length} Announcements</Badge>
          </CardHeader>
          <CardBody>
            {announcements.slice(0, 4).map((announcement) => (
              <div key={announcement.id} className="home__announcement">
                <div className="home__announcement-header">
                  <h4 className="home__announcement-title">{announcement.title}</h4>
                  {getPriorityBadge(announcement.priority)}
                </div>
                <p className="home__announcement-body">{announcement.body}</p>
                <div className="home__announcement-meta">
                  <span>🏢 {announcement.office}</span>
                  <span>📅 {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <style>{`
        .home__greeting {
          margin-bottom: var(--space-8);
        }

        .home__greeting-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-2);
        }

        .home__greeting-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-gray-600);
          margin: 0;
        }

        .home__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-8);
        }

        .home__stat-card {
          background: linear-gradient(135deg, var(--color-navy-50) 0%, var(--color-white) 100%);
          border: 1px solid var(--color-navy-100);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .home__stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .home__stat-icon--complaints { background: var(--color-warning-100); }
        .home__stat-icon--inspections { background: var(--color-success-100); }
        .home__stat-icon--flagged { background: var(--color-error-100); }

        .home__stat-content {
          display: flex;
          flex-direction: column;
        }

        .home__stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
        }

        .home__stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        .home__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        @media (min-width: 1024px) {
          .home__grid {
            grid-template-columns: 2fr 1fr;
          }

          .home__updates {
            grid-column: span 2;
          }
        }

        .home__complaint-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .home__complaint-item:last-child {
          border-bottom: none;
        }

        .home__complaint-info {
          flex: 1;
        }

        .home__complaint-product {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-1);
        }

        .home__complaint-issue {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0 0 var(--space-2);
        }

        .home__complaint-meta {
          display: flex;
          gap: var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
        }

        .home__complaint-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--space-2);
        }

        .home__complaint-date {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
        }

        .home__chart-container h4 {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: var(--space-4) 0 var(--space-2);
        }

        .home__chart-container h4:first-child {
          margin-top: 0;
        }

        .home__announcement {
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .home__announcement:last-child {
          border-bottom: none;
        }

        .home__announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .home__announcement-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0;
        }

        .home__announcement-body {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0 0 var(--space-2);
          line-height: var(--line-height-relaxed);
        }

        .home__announcement-meta {
          display: flex;
          gap: var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-gray-200);
          border-top-color: var(--color-navy-500);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-text {
          margin-left: var(--space-4);
          color: var(--color-gray-600);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;