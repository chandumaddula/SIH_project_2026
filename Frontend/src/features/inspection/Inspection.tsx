import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Inspection as InspectionType, InspectionStatus } from '../../types/inspection';
import { mockInspections } from '../../services/mockData';

export const InspectionPage: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInspection, setNewInspection] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    product: '',
    result: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setInspections(mockInspections);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: InspectionStatus) => {
    const variants: Record<InspectionStatus, 'success' | 'info' | 'warning' | 'error'> = {
      completed: 'success',
      in_progress: 'info',
      scheduled: 'warning',
      flagged: 'error'
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getComplianceBadge = (compliance?: 'compliant' | 'non_compliant') => {
    if (!compliance) return <Badge variant="neutral">Pending</Badge>;
    return compliance === 'compliant'
      ? <Badge variant="success">Compliant</Badge>
      : <Badge variant="error">Non-Compliant</Badge>;
  };

  const handleCreateInspection = () => {
    const inspection: InspectionType = {
      id: 'insp-' + Date.now(),
      location: newInspection.location,
      date: newInspection.date,
      time: newInspection.time,
      status: 'scheduled',
      product: newInspection.product,
      result: newInspection.result,
      compliance: undefined,
      complaintRaised: false,
      inspectorId: 'emp-001'
    };

    setInspections(prev => [inspection, ...prev]);
    setShowCreateModal(false);
    setNewInspection({
      location: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      product: '',
      result: ''
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="inspection__header">
          <div>
            <h1 className="page-title">Inspections</h1>
            <p className="page-subtitle">Manage your inspection schedule and status</p>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
            + New Inspection
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading inspections...</span>
        </div>
      ) : inspections.length === 0 ? (
        <EmptyState
          title="No inspections yet"
          description="Create your first inspection to get started"
          action={<Button variant="primary" onClick={() => setShowCreateModal(true)}>+ New Inspection</Button>}
        />
      ) : (
        <div className="inspection__grid">
          {inspections.map((inspection) => (
            <Card key={inspection.id} className="inspection__card" hoverable>
              <CardHeader>
                <div className="inspection__card-header">
                  <div>
                    <h3 className="inspection__card-title">{inspection.product || 'Unnamed Product'}</h3>
                    <p className="inspection__card-location">📍 {inspection.location}</p>
                  </div>
                  {getStatusBadge(inspection.status)}
                </div>
              </CardHeader>
              <CardBody>
                <div className="inspection__card-details">
                  <div className="inspection__detail">
                    <span className="inspection__detail-label">📅 Date:</span>
                    <span className="inspection__detail-value">
                      {new Date(inspection.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="inspection__detail">
                    <span className="inspection__detail-label">🕐 Time:</span>
                    <span className="inspection__detail-value">{inspection.time}</span>
                  </div>
                  {inspection.result && (
                    <div className="inspection__detail">
                      <span className="inspection__detail-label">Result:</span>
                      <span className="inspection__detail-value">{inspection.result}</span>
                    </div>
                  )}
                  <div className="inspection__detail">
                    <span className="inspection__detail-label">Compliance:</span>
                    <span className="inspection__detail-value">
                      {getComplianceBadge(inspection.compliance)}
                    </span>
                  </div>
                  {inspection.complaintRaised && (
                    <div className="inspection__detail">
                      <span className="inspection__detail-label">📋 Complaint:</span>
                      <Badge variant="warning" size="sm">Raised</Badge>
                    </div>
                  )}
                </div>

                <div className="inspection__card-actions">
                  <Button variant="ghost" size="sm" fullWidth={true}>
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Inspection"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateInspection}>
              Create Inspection
            </Button>
          </>
        }
      >
        <div className="inspection__form">
          <Input
            label="Location"
            value={newInspection.location}
            onChange={(e) => setNewInspection(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., City Supermarket - Aisle 3"
            fullWidth
          />
          <Input
            label="Date"
            type="date"
            value={newInspection.date}
            onChange={(e) => setNewInspection(prev => ({ ...prev, date: e.target.value }))}
            fullWidth
          />
          <Input
            label="Time"
            type="time"
            value={newInspection.time}
            onChange={(e) => setNewInspection(prev => ({ ...prev, time: e.target.value }))}
            fullWidth
          />
          <Input
            label="Product"
            value={newInspection.product}
            onChange={(e) => setNewInspection(prev => ({ ...prev, product: e.target.value }))}
            placeholder="Product name"
            fullWidth
          />
          <Input
            label="Initial Notes"
            value={newInspection.result}
            onChange={(e) => setNewInspection(prev => ({ ...prev, result: e.target.value }))}
            placeholder="Optional initial notes"
            fullWidth
          />
        </div>
      </Modal>
    </div>
  );
};

export default InspectionPage;