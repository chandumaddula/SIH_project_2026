/* ==========================================================================
   Complaint Details Page
   Task L — Citizen Complaint Management

   Detailed view of a single citizen complaint with:
   - Citizen information
   - Complaint description
   - Evidence
   - Timeline
   - Officer notes
   - Related inspection
   - Assign / Update status / Resolve / Close actions
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  CitizenComplaint,
  ComplaintStatus,
  ComplaintOfficerNote,
} from '../../types/complaint';
import {
  getComplaintById,
  getAvailableOfficers,
  assignComplaint,
  updateComplaintStatus,
  addOfficerNote,
  resolveComplaint,
  closeComplaint,
  getAvailableTransitions,
  canTransition,
  COMPLAINT_STATUS_CONFIG,
  COMPLAINT_PRIORITY_CONFIG,
} from '../../services/complaint.service';
import { generateInspectionId } from '../../services/inspection.service';
import { useInspectionStore } from '../../store/inspectionStore';

type ModalMode = 'assign' | 'status' | 'resolve' | 'close' | 'note' | 'inspection' | null;

export const ComplaintDetails: React.FC = () => {
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();
  const { setInspectionData } = useInspectionStore();

  /* ---- State ---- */

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [complaint, setComplaint] = useState<CitizenComplaint | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // assign
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignNote, setAssignNote] = useState('');

  // status
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('ASSIGNED');
  const [statusNote, setStatusNote] = useState('');

  // resolve
  const [resolveSummary, setResolveSummary] = useState('');
  const [resolveObservation, setResolveObservation] = useState('');

  // close
  const [closeNote, setCloseNote] = useState('');

  // note
  const [noteText, setNoteText] = useState('');

  const officers = getAvailableOfficers();
  const currentOfficer = officers[0]; // mock current logged-in officer

  /* ---- Load ---- */

  const loadComplaint = useCallback(() => {
    if (!complaintId) return;
    setPhase('loading');
    setTimeout(() => {
      const c = getComplaintById(complaintId);
      if (c) {
        setComplaint(c);
        setPhase('done');
      } else {
        setPhase('error');
      }
    }, 300);
  }, [complaintId]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  /* ---- Helpers ---- */

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setActionError(null);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setActionMessage(null);
    setTimeout(() => setActionError(null), 4000);
  };

  const openModal = (mode: ModalMode) => {
    setActionMessage(null);
    setActionError(null);
    if (mode === 'assign') {
      setSelectedOfficer(officers[0]?.id ?? '');
      setAssignNote('');
    }
    if (mode === 'status') {
      const next = getAvailableTransitions(complaint?.status ?? 'NEW')[0] ?? 'ASSIGNED';
      setTargetStatus(next);
      setStatusNote('');
    }
    if (mode === 'resolve') {
      setResolveSummary('');
      setResolveObservation('');
    }
    if (mode === 'close') {
      setCloseNote('');
    }
    if (mode === 'note') {
      setNoteText('');
    }
    setModal(mode);
  };

  const closeModal = () => setModal(null);

  /* ---- Submit handlers ---- */

  const handleAssign = () => {
    if (!complaint || !selectedOfficer) return;
    const result = assignComplaint(complaint.id, selectedOfficer, assignNote || undefined);
    if (result) {
      setComplaint(result);
      closeModal();
      showMessage('Complaint assigned successfully.');
    } else {
      showError('Unable to assign complaint.');
    }
  };

  const handleUpdateStatus = () => {
    if (!complaint) return;
    if (!canTransition(complaint.status, targetStatus)) {
      showError('Invalid status transition.');
      return;
    }
    const result = updateComplaintStatus(
      complaint.id,
      targetStatus,
      statusNote || undefined,
      currentOfficer?.name
    );
    if (result) {
      setComplaint(result);
      closeModal();
      showMessage('Status updated.');
    } else {
      showError('Unable to update complaint.');
    }
  };

  const handleResolve = () => {
    if (!complaint) return;
    if (!resolveSummary.trim() || !resolveObservation.trim()) {
      showError('Please provide both resolution summary and officer observation.');
      return;
    }
    const result = resolveComplaint(
      complaint.id,
      currentOfficer?.name ?? 'Officer',
      resolveSummary,
      resolveObservation
    );
    if (result) {
      setComplaint(result);
      closeModal();
      showMessage('Complaint resolved.');
    } else {
      showError('Unable to resolve complaint.');
    }
  };

  const handleClose = () => {
    if (!complaint) return;
    const result = closeComplaint(complaint.id, currentOfficer?.name ?? 'Officer', closeNote || undefined);
    if (result) {
      setComplaint(result);
      closeModal();
      showMessage('Complaint closed.');
    } else {
      showError('Unable to close complaint.');
    }
  };

  const handleAddNote = () => {
    if (!complaint) return;
    if (!noteText.trim()) {
      showError('Please enter a note.');
      return;
    }
    const result = addOfficerNote(
      complaint.id,
      currentOfficer?.id ?? 'emp-001',
      currentOfficer?.name ?? 'Officer',
      noteText
    );
    if (result) {
      setComplaint(result);
      closeModal();
      showMessage('Note added.');
    } else {
      showError('Unable to add note.');
    }
  };

  const handleCreateInspection = () => {
    if (!complaint) return;
    const inspectionId = generateInspectionId();
    setInspectionData({
      inspectionId,
      officerId: currentOfficer?.id ?? 'emp-001',
      officerName: currentOfficer?.name ?? 'Officer',
      office: currentOfficer?.office ?? 'Regional Metrology Office',
      images: [],
      form: {
        productName: complaint.product,
        productCategory: complaint.productCategory ?? '',
        manufacturer: complaint.manufacturer ?? '',
        retailer: '',
        location: complaint.location,
        packageType: '',
        barcode: '',
        complaintId: complaint.id,
        complaintIssue: complaint.issue,
      },
    });
    navigate('/employee/inspection/new');
  };

  /* ---- Render ---- */

  if (phase === 'loading') {
    return (
      <div className="page cd-page">
        <h1 className="page-title">Complaint Details</h1>
        <p className="page-subtitle">Loading complaint details...</p>
        <div className="cd-loading">
          <div className="cd-spinner" />
          <p>Loading complaint details...</p>
        </div>
        <style>{cdStyles}</style>
      </div>
    );
  }

  if (phase === 'error' || !complaint) {
    return (
      <div className="page cd-page">
        <h1 className="page-title">Complaint Details</h1>
        <p className="page-subtitle">Unable to load complaint.</p>
        <Card>
          <CardBody>
            <div className="cd-error">
              <p>Unable to load complaint details.</p>
              <div className="cd-error__actions">
                <Button variant="primary" onClick={loadComplaint}>Try Again</Button>
                <Button variant="ghost" onClick={() => navigate('/employee/complaints')}>Back to list</Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <style>{cdStyles}</style>
      </div>
    );
  }

  const statusCfg = COMPLAINT_STATUS_CONFIG[complaint.status];
  const priorityCfg = COMPLAINT_PRIORITY_CONFIG[complaint.priority];
  const availableTransitions = getAvailableTransitions(complaint.status);

  return (
    <div className="page cd-page">
      {/* Header */}
      <div className="cd-header">
        <div>
          <button className="cd-back" onClick={() => navigate('/employee/complaints')}>
            ← Back to complaints
          </button>
          <h1 className="page-title">
            Complaint <code className="cd-id-inline">{complaint.id}</code>
          </h1>
          <p className="page-subtitle">{complaint.product} — {complaint.issue}</p>
        </div>
        <div className="cd-header__actions">
          <Badge variant={priorityCfg.badge as any} size="md">{priorityCfg.label}</Badge>
          <Badge variant={statusCfg.badge as any} size="md">{statusCfg.label}</Badge>
        </div>
      </div>

      {/* Inline status messages */}
      {actionMessage && (
        <div className="cd-banner cd-banner--success">{actionMessage}</div>
      )}
      {actionError && (
        <div className="cd-banner cd-banner--error">{actionError}</div>
      )}

      <div className="cd-grid">
        {/* Main column */}
        <div className="cd-main">
          {/* Description */}
          <Card>
            <CardHeader><CardTitle>Complaint Description</CardTitle></CardHeader>
            <CardBody>
              <p className="cd-description">{complaint.description ?? complaint.issue}</p>
              <p className="cd-description-note">
                <strong>Note:</strong> This is a citizen-submitted report / allegation. Final findings
                require authorized officer verification.
              </p>
            </CardBody>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Evidence</CardTitle>
              <Badge variant="info" size="sm">{complaint.evidence.length} item(s)</Badge>
            </CardHeader>
            <CardBody>
              {complaint.evidence.length === 0 ? (
                <p className="cd-empty-inline">No evidence was submitted with this complaint.</p>
              ) : (
                <div className="cd-evidence-grid">
                  {complaint.evidence.map(ev => (
                    <div key={ev.id} className="cd-evidence-item">
                      <div className="cd-evidence-thumb">
                        {ev.type === 'image' ? '🖼️' : ev.type === 'receipt' ? '🧾' : '📄'}
                      </div>
                      <div className="cd-evidence-body">
                        <div className="cd-evidence-type">{ev.type}</div>
                        <div className="cd-evidence-desc">{ev.description}</div>
                        <div className="cd-evidence-meta">
                          <span>{ev.fileName ?? '—'}</span>
                          <span>
                            {new Date(ev.submittedAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Complaint Timeline</CardTitle></CardHeader>
            <CardBody>
              {complaint.timeline.length === 0 ? (
                <p className="cd-empty-inline">No timeline events yet.</p>
              ) : (
                <ol className="cd-timeline">
                  {complaint.timeline.map(ev => {
                    const cfg = COMPLAINT_STATUS_CONFIG[ev.status];
                    return (
                      <li key={ev.id} className="cd-timeline__item">
                        <div className="cd-timeline__dot" style={{ background: cfg.color }} />
                        <div className="cd-timeline__body">
                          <div className="cd-timeline__head">
                            <span className="cd-timeline__date">
                              {new Date(ev.timestamp).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            <Badge variant={cfg.badge as any} size="sm">{cfg.label}</Badge>
                          </div>
                          {ev.note && <p className="cd-timeline__note">{ev.note}</p>}
                          {ev.updatedBy && (
                            <span className="cd-timeline__by">by {ev.updatedBy}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardBody>
          </Card>

          {/* Officer Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Officer Notes</CardTitle>
              <Button variant="outline" size="sm" onClick={() => openModal('note')}>+ Add Note</Button>
            </CardHeader>
            <CardBody>
              {complaint.notes.length === 0 ? (
                <p className="cd-empty-inline">No officer notes yet. Add a note to track observations.</p>
              ) : (
                <ul className="cd-notes">
                  {complaint.notes.map((n: ComplaintOfficerNote) => (
                    <li key={n.id} className="cd-note">
                      <div className="cd-note__head">
                        <strong>{n.officerName}</strong>
                        <span>
                          {new Date(n.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="cd-note__body">{n.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Resolution */}
          {complaint.resolution && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
                <Badge variant="success" size="sm">RESOLVED</Badge>
              </CardHeader>
              <CardBody>
                <div className="cd-resolution">
                  <div className="cd-resolution__row">
                    <span>Resolved By</span>
                    <strong>{complaint.resolution.resolvedBy}</strong>
                  </div>
                  <div className="cd-resolution__row">
                    <span>Resolved At</span>
                    <span>{new Date(complaint.resolution.resolvedAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cd-resolution__row cd-resolution__row--block">
                    <span>Summary</span>
                    <p>{complaint.resolution.summary}</p>
                  </div>
                  <div className="cd-resolution__row cd-resolution__row--block">
                    <span>Officer Observation</span>
                    <p>{complaint.resolution.officerObservation}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Related Inspection */}
          <Card>
            <CardHeader>
              <CardTitle>Related Inspection</CardTitle>
            </CardHeader>
            <CardBody>
              {complaint.relatedInspection ? (
                <div className="cd-related">
                  <div className="cd-related__row">
                    <span>Inspection ID</span>
                    <code className="cd-id-inline">{complaint.relatedInspection.inspectionId}</code>
                  </div>
                  <div className="cd-related__row">
                    <span>Product</span>
                    <span>{complaint.relatedInspection.product}</span>
                  </div>
                  <div className="cd-related__row">
                    <span>Location</span>
                    <span>{complaint.relatedInspection.location}</span>
                  </div>
                  <div className="cd-related__row">
                    <span>Date</span>
                    <span>{complaint.relatedInspection.date}</span>
                  </div>
                  <div className="cd-related__row">
                    <span>Status</span>
                    <Badge variant="neutral" size="sm">{complaint.relatedInspection.status}</Badge>
                  </div>
                  <div className="cd-related__row">
                    <span>Verification</span>
                    <Badge variant="neutral" size="sm">{complaint.relatedInspection.verification}</Badge>
                  </div>
                  <div className="cd-related__actions">
                    <Button variant="primary" size="sm" onClick={() => navigate(`/employee/inspections/${complaint.relatedInspection!.inspectionId}`)}>
                      View Inspection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="cd-related-empty">
                  <p>No inspection has been created for this complaint.</p>
                  <Button variant="primary" size="sm" onClick={handleCreateInspection}>
                    Create Inspection
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="cd-sidebar">
          {/* Citizen info */}
          <Card>
            <CardHeader><CardTitle>Citizen Information</CardTitle></CardHeader>
            <CardBody>
              <div className="cd-info">
                <div className="cd-info__row">
                  <span>Submitted By</span>
                  <strong>{complaint.reporterName}</strong>
                </div>
                {complaint.contactEmail && (
                  <div className="cd-info__row">
                    <span>Email</span>
                    <span>{complaint.contactEmail}</span>
                  </div>
                )}
                {complaint.contactPhone && (
                  <div className="cd-info__row">
                    <span>Phone</span>
                    <span>{complaint.contactPhone}</span>
                  </div>
                )}
                <div className="cd-info__row">
                  <span>Submitted</span>
                  <span>{new Date(complaint.submittedAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="cd-info__row">
                  <span>Location</span>
                  <span>{complaint.location}</span>
                </div>
                <p className="cd-demo-note">Demo Data — fields shown for development only.</p>
              </div>
            </CardBody>
          </Card>

          {/* Product info */}
          <Card>
            <CardHeader><CardTitle>Product</CardTitle></CardHeader>
            <CardBody>
              <div className="cd-info">
                <div className="cd-info__row">
                  <span>Name</span>
                  <strong>{complaint.product}</strong>
                </div>
                {complaint.productCategory && (
                  <div className="cd-info__row">
                    <span>Category</span>
                    <span>{complaint.productCategory}</span>
                  </div>
                )}
                {complaint.manufacturer && (
                  <div className="cd-info__row">
                    <span>Manufacturer</span>
                    <span>{complaint.manufacturer}</span>
                  </div>
                )}
                {complaint.packageLabel && (
                  <div className="cd-info__row">
                    <span>Package</span>
                    <code className="cd-id-inline">{complaint.packageLabel}</code>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/employee/products')}
                  fullWidth
                >
                  Open Product Repository (placeholder)
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Assignment */}
          {complaint.assignment && (
            <Card>
              <CardHeader><CardTitle>Assignment</CardTitle></CardHeader>
              <CardBody>
                <div className="cd-info">
                  <div className="cd-info__row">
                    <span>Officer</span>
                    <strong>{complaint.assignment.officerName}</strong>
                  </div>
                  <div className="cd-info__row">
                    <span>Assigned</span>
                    <span>{new Date(complaint.assignment.assignedAt).toLocaleString('en-IN')}</span>
                  </div>
                  {complaint.assignment.assignmentNote && (
                    <div className="cd-info__row cd-info__row--block">
                      <span>Note</span>
                      <p>{complaint.assignment.assignmentNote}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardBody>
              <div className="cd-side-actions">
                {complaint.status === 'NEW' && (
                  <Button variant="accent" size="sm" onClick={() => openModal('assign')} fullWidth>
                    Assign Complaint
                  </Button>
                )}
                {availableTransitions.length > 0 && (
                  <Button variant="primary" size="sm" onClick={() => openModal('status')} fullWidth>
                    Update Status
                  </Button>
                )}
                {!complaint.relatedInspection && (
                  <Button variant="outline" size="sm" onClick={handleCreateInspection} fullWidth>
                    Create Inspection
                  </Button>
                )}
                {(complaint.status === 'ASSIGNED' || complaint.status === 'UNDER_INSPECTION') && (
                  <Button variant="success" size="sm" onClick={() => openModal('resolve')} fullWidth>
                    Resolve Complaint
                  </Button>
                )}
                {complaint.status === 'RESOLVED' && (
                  <Button variant="ghost" size="sm" onClick={() => openModal('close')} fullWidth>
                    Close Complaint
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate('/employee/complaints')} fullWidth>
                  Back to List
                </Button>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>

      {/* ============================
         Modals
         ============================ */}

      {/* Assign */}
      <Modal
        isOpen={modal === 'assign'}
        onClose={closeModal}
        title="Assign Complaint"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleAssign}>Assign</Button>
          </>
        }
      >
        <div className="cd-form">
          <label className="cd-form__label">Officer</label>
          <select
            className="cd-form__select"
            value={selectedOfficer}
            onChange={e => setSelectedOfficer(e.target.value)}
          >
            {officers.map(o => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.department}
              </option>
            ))}
          </select>
          <label className="cd-form__label">Assignment Note (optional)</label>
          <textarea
            className="cd-form__textarea"
            rows={4}
            value={assignNote}
            onChange={e => setAssignNote(e.target.value)}
            placeholder="Add a note about the assignment..."
          />
        </div>
      </Modal>

      {/* Status update */}
      <Modal
        isOpen={modal === 'status'}
        onClose={closeModal}
        title="Update Complaint Status"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateStatus}>Update Status</Button>
          </>
        }
      >
        <div className="cd-form">
          <label className="cd-form__label">New Status</label>
          <select
            className="cd-form__select"
            value={targetStatus}
            onChange={e => setTargetStatus(e.target.value as ComplaintStatus)}
          >
            {availableTransitions.map(s => (
              <option key={s} value={s}>
                {COMPLAINT_STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <label className="cd-form__label">Note (optional)</label>
          <textarea
            className="cd-form__textarea"
            rows={3}
            value={statusNote}
            onChange={e => setStatusNote(e.target.value)}
            placeholder="Reason or note for this status change..."
          />
        </div>
      </Modal>

      {/* Resolve */}
      <Modal
        isOpen={modal === 'resolve'}
        onClose={closeModal}
        title="Resolve Complaint"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="success" onClick={handleResolve}>Resolve Complaint</Button>
          </>
        }
      >
        <div className="cd-form">
          <p className="cd-modal-note">
            Provide a neutral summary of the officer's review. Resolution does not automatically
            confirm a legal violation.
          </p>
          <label className="cd-form__label">Resolution Summary *</label>
          <textarea
            className="cd-form__textarea"
            rows={3}
            value={resolveSummary}
            onChange={e => setResolveSummary(e.target.value)}
            placeholder="e.g. Complaint resolved after officer review and follow-up with the retailer."
          />
          <label className="cd-form__label">Officer Observation *</label>
          <textarea
            className="cd-form__textarea"
            rows={4}
            value={resolveObservation}
            onChange={e => setResolveObservation(e.target.value)}
            placeholder="Document findings, evidence reviewed, and actions taken..."
          />
        </div>
      </Modal>

      {/* Close */}
      <Modal
        isOpen={modal === 'close'}
        onClose={closeModal}
        title="Close Complaint"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleClose}>Close Complaint</Button>
          </>
        }
      >
        <div className="cd-form">
          <p>Close this complaint?</p>
          {complaint.resolution && (
            <div className="cd-close-summary">
              <strong>Current resolution:</strong> {complaint.resolution.summary}
            </div>
          )}
          <label className="cd-form__label">Closing Note (optional)</label>
          <textarea
            className="cd-form__textarea"
            rows={3}
            value={closeNote}
            onChange={e => setCloseNote(e.target.value)}
            placeholder="Optional closing note..."
          />
        </div>
      </Modal>

      {/* Officer Note */}
      <Modal
        isOpen={modal === 'note'}
        onClose={closeModal}
        title="Add Officer Note"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleAddNote}>Save Note</Button>
          </>
        }
      >
        <div className="cd-form">
          <label className="cd-form__label">Note *</label>
          <textarea
            className="cd-form__textarea"
            rows={5}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="e.g. Inspection scheduled for follow-up verification."
          />
        </div>
      </Modal>

      <style>{cdStyles}</style>
    </div>
  );
};

export default ComplaintDetails;

/* ==========================================================================
   Styles
   ========================================================================== */

const cdStyles = `
  .cd-page { max-width: 1280px; margin: 0 auto; }
  .cd-back { background: none; border: none; color: var(--color-navy-500); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); cursor: pointer; padding: 0; margin-bottom: var(--space-2); }
  .cd-back:hover { color: var(--color-navy-700); text-decoration: underline; }
  .cd-id-inline { font-family: var(--font-family-mono); font-size: var(--font-size-base); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 8px; border-radius: 3px; margin-left: var(--space-2); }
  .cd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3); flex-wrap: wrap; }
  .cd-header__actions { display: flex; gap: var(--space-2); align-items: center; }

  /* Banner */
  .cd-banner { padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--font-size-sm); }
  .cd-banner--success { background: var(--color-success-100); color: var(--color-success-600); border: 1px solid var(--color-success-600); }
  .cd-banner--error { background: var(--color-error-100); color: var(--color-error-600); border: 1px solid var(--color-error-600); }

  /* Grid */
  .cd-grid { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-4); align-items: flex-start; }
  .cd-main { display: flex; flex-direction: column; gap: var(--space-3); }
  .cd-sidebar { display: flex; flex-direction: column; gap: var(--space-3); }
  @media (max-width: 900px) { .cd-grid { grid-template-columns: 1fr; } }

  /* Description */
  .cd-description { color: var(--color-gray-800); line-height: 1.6; margin: 0 0 var(--space-2); font-size: var(--font-size-sm); }
  .cd-description-note { background: var(--color-info-100); color: var(--color-info-600); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: 12px; margin: 0; }

  /* Evidence */
  .cd-evidence-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-3); }
  .cd-evidence-item { display: flex; gap: var(--space-2); padding: var(--space-2); border: 1px solid var(--color-gray-200); border-radius: var(--radius-sm); align-items: flex-start; }
  .cd-evidence-thumb { width: 48px; height: 48px; border-radius: var(--radius-sm); background: var(--color-gray-100); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
  .cd-evidence-body { flex: 1; min-width: 0; }
  .cd-evidence-type { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; font-weight: var(--font-weight-semibold); }
  .cd-evidence-desc { font-size: var(--font-size-sm); color: var(--color-navy-900); margin: 2px 0; }
  .cd-evidence-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--color-gray-500); }

  /* Timeline */
  .cd-timeline { list-style: none; padding: 0; margin: 0; }
  .cd-timeline__item { display: flex; gap: var(--space-3); padding-bottom: var(--space-3); position: relative; }
  .cd-timeline__item:not(:last-child)::before { content: ''; position: absolute; left: 7px; top: 16px; bottom: 0; width: 2px; background: var(--color-gray-200); }
  .cd-timeline__dot { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; border: 2px solid var(--color-white); box-shadow: 0 0 0 1px var(--color-gray-300); }
  .cd-timeline__body { flex: 1; }
  .cd-timeline__head { display: flex; gap: var(--space-2); align-items: center; margin-bottom: 2px; }
  .cd-timeline__date { font-size: 12px; color: var(--color-gray-500); }
  .cd-timeline__note { margin: 4px 0 2px; font-size: var(--font-size-sm); color: var(--color-gray-800); }
  .cd-timeline__by { font-size: 11px; color: var(--color-gray-500); }

  /* Notes */
  .cd-notes { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
  .cd-note { padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-left: 3px solid var(--color-navy-500); border-radius: var(--radius-sm); }
  .cd-note__head { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: var(--font-size-sm); }
  .cd-note__head span { color: var(--color-gray-500); font-size: 12px; }
  .cd-note__body { margin: 0; color: var(--color-gray-800); font-size: var(--font-size-sm); }

  /* Resolution */
  .cd-resolution { display: flex; flex-direction: column; gap: var(--space-2); }
  .cd-resolution__row { display: flex; justify-content: space-between; align-items: flex-start; font-size: var(--font-size-sm); padding: var(--space-1) 0; }
  .cd-resolution__row span:first-child { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .cd-resolution__row--block { flex-direction: column; align-items: stretch; gap: var(--space-1); }
  .cd-resolution__row--block p { margin: 0; color: var(--color-gray-800); line-height: 1.5; }

  /* Related inspection */
  .cd-related { display: flex; flex-direction: column; gap: var(--space-2); }
  .cd-related__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); padding: var(--space-1) 0; }
  .cd-related__row span:first-child { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .cd-related__actions { margin-top: var(--space-2); }
  .cd-related-empty { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2); }
  .cd-related-empty p { margin: 0; color: var(--color-gray-600); font-size: var(--font-size-sm); }

  /* Sidebar info */
  .cd-info { display: flex; flex-direction: column; gap: var(--space-2); }
  .cd-info__row { display: flex; justify-content: space-between; align-items: flex-start; font-size: var(--font-size-sm); padding: var(--space-1) 0; }
  .cd-info__row span:first-child { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; flex-shrink: 0; margin-right: var(--space-2); }
  .cd-info__row--block { flex-direction: column; align-items: stretch; gap: var(--space-1); }
  .cd-info__row--block p { margin: 0; color: var(--color-gray-800); line-height: 1.5; }
  .cd-demo-note { font-size: 10px; color: var(--color-gray-500); font-style: italic; margin: var(--space-2) 0 0; padding-top: var(--space-2); border-top: 1px solid var(--color-gray-200); }

  /* Side actions */
  .cd-side-actions { display: flex; flex-direction: column; gap: var(--space-2); }

  /* Form */
  .cd-form { display: flex; flex-direction: column; gap: var(--space-2); }
  .cd-form__label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .cd-form__select, .cd-form__textarea {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit; font-size: var(--font-size-sm);
    color: var(--color-navy-900); background: var(--color-white);
    resize: vertical;
  }
  .cd-form__select:focus, .cd-form__textarea:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .cd-modal-note { background: var(--color-info-100); color: var(--color-info-600); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: 12px; margin: 0; }
  .cd-close-summary { background: var(--color-gray-50); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--font-size-sm); margin: 0; }

  .cd-empty-inline { color: var(--color-gray-500); font-size: var(--font-size-sm); margin: 0; text-align: center; padding: var(--space-3) 0; }

  /* Loading / error */
  .cd-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .cd-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: cd-spin 0.8s linear infinite; }
  @keyframes cd-spin { to { transform: rotate(360deg); } }
  .cd-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .cd-error p { color: var(--color-gray-600); margin: 0; }
  .cd-error__actions { display: flex; gap: var(--space-2); }
`;
