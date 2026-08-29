import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { ScanStatusBadge } from '../../components/scanner/ScanStatusBadge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImagePreview } from '../../components/scanner/ImagePreview';
import { scanService } from '../../services/scanService';
import { InspectionSession } from '../../types/scan';
import { Search, Eye, Filter, Calendar, FileText, Plus, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ScanHistory: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InspectionSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedSession, setSelectedSession] = useState<InspectionSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await scanService.getScanHistory();
        setSessions(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleOpenDetail = (session: InspectionSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.complianceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer
      title="Inspection Session History"
      subtitle="View, filter, and inspect past commodity label scanning records and OCR bounding box evidence."
      action={
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/dashboard/citizen/verify')}>
          New Label Scan
        </Button>
      }
    >
      {/* Search and Filters Bar */}
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <Input
            placeholder="Search by Session ID, Product Name, Category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={16} /> Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLIANT">COMPLIANT Only</option>
            <option value="NON_COMPLIANT">NON-COMPLIANT Only</option>
            <option value="WARNING">WARNING Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '14px 24px' }}>Session ID</th>
                <th style={{ padding: '14px 24px' }}>Commodity Item</th>
                <th style={{ padding: '14px 24px' }}>Category</th>
                <th style={{ padding: '14px 24px' }}>Scan Timestamp</th>
                <th style={{ padding: '14px 24px' }}>Verdict</th>
                <th style={{ padding: '14px 24px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading scan records...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    No inspection session records match your search filter.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#6366f1' }}>{session.id}</td>
                    <td style={{ padding: '16px 24px', color: '#f8fafc', fontWeight: 500 }}>{session.productName}</td>
                    <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{session.category}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#64748b" />
                        {new Date(session.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <ScanStatusBadge status={session.complianceStatus} size="sm" />
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />} onClick={() => handleOpenDetail(session)}>
                        Inspect Evidence
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Evidence Detail Modal */}
      {selectedSession && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Inspection Session Details: ${selectedSession.id}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close Audit Modal
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedSession.productName}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Category: {selectedSession.category}
                </span>
              </div>
              <ScanStatusBadge status={selectedSession.complianceStatus} size="md" />
            </div>

            {selectedSession.evidence?.[0] && (
              <ImagePreview
                imageUrl={selectedSession.evidence[0].imageUrl}
                boundingBoxes={selectedSession.evidence[0].boundingBoxJson}
                showBoundingBoxes={true}
              />
            )}

            {/* Rule Violations List */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} color="#6366f1" /> Legal Rule Evaluation Breakdown
              </h4>

              {!selectedSession.violations || selectedSession.violations.length === 0 ? (
                <div style={{ padding: '14px 18px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  <span>Fully compliant with Legal Metrology (Packaged Commodities) Rules, 2011.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedSession.violations.map((v) => (
                    <div key={v.id} style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f8fafc' }}>
                      <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertOctagon size={14} /> Violation {v.ruleId} ({v.severity})
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{v.description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                        Reference: {v.legalReference}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
