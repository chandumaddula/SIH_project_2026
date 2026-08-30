/* ==========================================================================
   Evidence Management Page
   Task J — Evidence Management

   Officers can review, add, edit, and delete evidence items associated
   with the current inspection.

   Evidence types: Package Images, Label Images, Additional Evidence,
   Measurement Evidence, Officer Observations.

   Demo: No real document management backend.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useInspectionStore } from '../../store';
import {
  EvidenceItem,
  EvidenceType,
  EvidenceSummary,
  EVIDENCE_TYPE_LABELS,
  AddEvidenceInput,
  buildEvidenceFromImages,
  getInspectionEvidence,
  addEvidence,
  updateEvidence,
  deleteEvidence,
  getEvidenceSummary,
} from '../../services/evidence.service';

/* ==========================================================================
   Helpers
   ========================================================================== */

const getCurrentDate = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const TYPE_BADGE: Record<EvidenceType, 'primary' | 'accent' | 'warning' | 'info' | 'neutral'> = {
  package_image: 'primary',
  label_image: 'accent',
  additional: 'info',
  measurement: 'warning',
  observation: 'neutral',
};

/* ==========================================================================
   Evidence Card
   ========================================================================== */

interface EvidenceCardProps {
  item: EvidenceItem;
  onView: (item: EvidenceItem) => void;
  onEdit: (item: EvidenceItem) => void;
  onDelete: (item: EvidenceItem) => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({ item, onView, onEdit, onDelete }) => (
  <div className="ev-card">
    <div className="ev-card__preview">
      {item.imageData ? (
        <img src={item.imageData} alt={item.typeLabel} className="ev-card__img" />
      ) : (
        <div className="ev-card__no-img">
          <span>{item.type === 'observation' ? '📝' : '📄'}</span>
        </div>
      )}
    </div>
    <div className="ev-card__body">
      <div className="ev-card__header">
        <code className="ev-card__id">{item.id}</code>
        <Badge variant={TYPE_BADGE[item.type]} size="sm">{item.typeLabel}</Badge>
      </div>
      {item.description && (
        <p className="ev-card__description">{item.description}</p>
      )}
      <div className="ev-card__meta">
        <span className="ev-card__meta-item">
          <span className="ev-card__meta-label">Captured</span>
          <span className="ev-card__meta-value">{formatTimestamp(item.timestamp)}</span>
        </span>
        {item.location && (
          <span className="ev-card__meta-item">
            <span className="ev-card__meta-label">Location</span>
            <span className="ev-card__meta-value">{item.location}</span>
          </span>
        )}
        <span className="ev-card__meta-item">
          <span className="ev-card__meta-label">Source</span>
          <span className="ev-card__meta-value">{item.source}</span>
        </span>
        {item.attachedFinding && (
          <span className="ev-card__meta-item ev-card__meta-item--finding">
            <span className="ev-card__meta-label">Finding</span>
            <span className="ev-card__meta-value ev-card__finding-label">
              {item.attachedFinding.label}
            </span>
          </span>
        )}
      </div>
    </div>
    <div className="ev-card__actions">
      <Button variant="ghost" size="sm" onClick={() => onView(item)}>[View]</Button>
      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>[Edit]</Button>
      <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>[Delete]</Button>
    </div>
  </div>
);

/* ==========================================================================
   View Evidence Modal
   ========================================================================== */

interface ViewModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

const ViewEvidenceModal: React.FC<ViewModalProps> = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title="Evidence Detail"
      size="lg"
      footer={<Button variant="ghost" onClick={onClose}>Close</Button>}
    >
      <div className="ev-view">
        {item.imageData && (
          <div className="ev-view__image-wrap">
            <img src={item.imageData} alt={item.typeLabel} className="ev-view__image" />
          </div>
        )}
        <div className="ev-view__fields">
          <div className="ev-view__row">
            <span className="ev-view__label">Evidence ID</span>
            <code className="ev-view__code">{item.id}</code>
          </div>
          <div className="ev-view__row">
            <span className="ev-view__label">Type</span>
            <Badge variant={TYPE_BADGE[item.type]} size="sm">{item.typeLabel}</Badge>
          </div>
          <div className="ev-view__row">
            <span className="ev-view__label">Captured</span>
            <span className="ev-view__value">{formatTimestamp(item.timestamp)}</span>
          </div>
          <div className="ev-view__row">
            <span className="ev-view__label">Source</span>
            <span className="ev-view__value">{item.source}</span>
          </div>
          {item.location && (
            <div className="ev-view__row">
              <span className="ev-view__label">Location</span>
              <span className="ev-view__value">{item.location}</span>
            </div>
          )}
          <div className="ev-view__row">
            <span className="ev-view__label">Captured By</span>
            <span className="ev-view__value">{item.capturedBy}</span>
          </div>
          {item.description && (
            <div className="ev-view__row ev-view__row--full">
              <span className="ev-view__label">Description</span>
              <span className="ev-view__value">{item.description}</span>
            </div>
          )}
          {item.attachedFinding && (
            <div className="ev-view__row ev-view__row--full ev-view__finding">
              <span className="ev-view__label">Attached Finding</span>
              <div className="ev-view__finding-content">
                <span className="ev-view__finding-name">{item.attachedFinding.label}</span>
                <Badge variant="info" size="sm">{item.attachedFinding.type.replace('_', ' ')}</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Add / Edit Evidence Modal
   ========================================================================== */

interface EvidenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AddEvidenceInput) => void;
  editItem: EvidenceItem | null;
}

const EvidenceFormModal: React.FC<EvidenceFormModalProps> = ({ isOpen, onClose, onSave, editItem }) => {
  const [type, setType] = useState<EvidenceType>('additional');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('Manual Entry');

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setDescription(editItem.description);
      setLocation(editItem.location);
      setSource(editItem.source);
    } else {
      setType('additional');
      setDescription('');
      setLocation('');
      setSource('Manual Entry');
    }
  }, [editItem, isOpen]);

  const handleSave = () => {
    onSave({ type, description, imageData: null, location, source, attachedFinding: null });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Evidence' : 'Add Evidence'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {editItem ? 'Save Changes' : 'Add Evidence'}
          </Button>
        </>
      }
    >
      <div className="ev-form">
        <div className="ev-form__group">
          <label className="ev-form__label">Evidence Type</label>
          <div className="ev-form__type-grid">
            {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map(t => (
              <button
                key={t}
                type="button"
                className={`ev-form__type-btn ${type === t ? 'ev-form__type-btn--active' : ''}`}
                onClick={() => setType(t)}
              >
                {EVIDENCE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="ev-form__group">
          <label className="ev-form__label">Description</label>
          <textarea
            className="ev-form__textarea"
            placeholder="Describe this evidence item..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="ev-form__group">
          <label className="ev-form__label">Location</label>
          <input
            type="text"
            className="ev-form__input"
            placeholder="e.g., Front label, Side panel, Warehouse B"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div className="ev-form__group">
          <label className="ev-form__label">Source</label>
          <select
            className="ev-form__select"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            <option>Manual Entry</option>
            <option>Employee Camera</option>
            <option>Uploaded File</option>
            <option>Measurement Instrument</option>
            <option>System Generated</option>
          </select>
        </div>

        <p className="ev-form__hint">
          To attach an image, use the camera or upload from the image capture step.
          Evidence items can be linked to specific findings in the Verification step.
        </p>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Delete Confirmation Modal
   ========================================================================== */

interface DeleteModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteEvidenceModal: React.FC<DeleteModalProps> = ({ item, onClose, onConfirm }) => {
  if (!item) return null;
  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title="Delete Evidence"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="error" onClick={onConfirm}>Delete</Button>
        </>
      }
    >
      <div className="ev-delete">
        <p className="ev-delete__message">
          <strong>Delete this evidence?</strong>
        </p>
        <p className="ev-delete__detail">
          Evidence ID: <code>{item.id}</code>
        </p>
        <p className="ev-delete__warn">
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Main Component
   ========================================================================== */

export const EvidenceManagement: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, images, measurements } = useInspectionStore();

  /* ---- State ---- */

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [summary, setSummary] = useState<EvidenceSummary | null>(null);

  /* Modals */
  const [viewItem, setViewItem] = useState<EvidenceItem | null>(null);
  const [editItem, setEditItem] = useState<EvidenceItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<EvidenceItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  /* ---- Load evidence on mount ---- */

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const id = inspectionId || 'N/A';
        const existing = getInspectionEvidence(id);

        // Seed from captured images if first load
        if (existing.length === 0 && images.length > 0) {
          const seeded = buildEvidenceFromImages(id, images, officerName || 'Officer');
          seeded.forEach(img => addEvidence(id, {
            type: img.type,
            description: img.description,
            imageData: img.imageData,
            location: img.location,
            source: img.source,
            attachedFinding: null,
          }, officerName || 'Officer'));
          setEvidence(getInspectionEvidence(id));
        } else {
          setEvidence(existing);
        }

        setSummary(getEvidenceSummary(id));
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Handlers ---- */

  const handleAdd = (input: AddEvidenceInput) => {
    const id = inspectionId || 'N/A';
    addEvidence(id, input, officerName || 'Officer');
    const updated = getInspectionEvidence(id);
    setEvidence(updated);
    setSummary(getEvidenceSummary(id));
  };

  const handleEditSave = (input: AddEvidenceInput) => {
    if (!editItem) return;
    const id = inspectionId || 'N/A';
    updateEvidence(id, editItem.id, { description: input.description, location: input.location, attachedFinding: null });
    const updated = getInspectionEvidence(id);
    setEvidence(updated);
    setEditItem(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteItem) return;
    const id = inspectionId || 'N/A';
    deleteEvidence(id, deleteItem.id);
    const updated = getInspectionEvidence(id);
    setEvidence(updated);
    setSummary(getEvidenceSummary(id));
    setDeleteItem(null);
  };

  /* ---- Navigation ---- */

  const handleBackToReadability = () => navigate('/employee/inspection/readability');
  const handleBackToCompliance = () => navigate('/employee/inspection/compliance');
  const handleContinue = () => navigate('/employee/inspection/verification');

  /* ---- Render ---- */

  const currentDate = getCurrentDate();

  // Loading
  if (phase === 'loading') {
    return (
      <div className="page ev-page">
        <div className="ev-header">
          <div className="ev-header__left">
            <h1 className="page-title">Evidence Management</h1>
            <p className="page-subtitle">Loading evidence...</p>
          </div>
        </div>
        <div className="ev-loading">
          <div className="ev-loading__spinner" />
          <p>Loading evidence...</p>
        </div>
        <style>{evStyles}</style>
      </div>
    );
  }

  // Error
  if (phase === 'error') {
    return (
      <div className="page ev-page">
        <div className="ev-header">
          <div className="ev-header__left">
            <h1 className="page-title">Evidence Management</h1>
            <p className="page-subtitle">Unable to load evidence.</p>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="ev-error">
              <p>Unable to load evidence. Please try again.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
        <style>{evStyles}</style>
      </div>
    );
  }

  return (
    <div className="page ev-page">
      {/* Header */}
      <div className="ev-header">
        <div className="ev-header__left">
          <h1 className="page-title">Evidence Management</h1>
          <p className="page-subtitle">
            Review and manage evidence associated with this inspection.
          </p>
        </div>
        <div className="ev-header__meta">
          <div className="ev-meta-item">
            <span className="ev-meta-label">Inspection ID</span>
            <span className="ev-meta-value ev-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="ev-meta-item">
            <span className="ev-meta-label">Officer</span>
            <span className="ev-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="ev-meta-item">
            <span className="ev-meta-label">Date</span>
            <span className="ev-meta-value">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="ev-demo-banner">
        <span>ℹ️</span>
        <span>
          Evidence items are managed by the authorized officer. Attach evidence to specific findings
          during the Officer Verification step.
        </span>
      </div>

      <div className="ev-body">
        {/* Evidence list */}
        <div className="ev-main">
          <div className="ev-list-header">
            <span className="ev-list-title">
              Evidence Items
              <span className="ev-list-count">{evidence.length}</span>
            </span>
            <Button variant="accent" size="sm" onClick={() => setShowAddModal(true)}>
              + Add Evidence
            </Button>
          </div>

          {evidence.length === 0 ? (
            <Card>
              <CardBody>
                <div className="ev-empty">
                  <span className="ev-empty__icon">📁</span>
                  <p>No evidence has been added to this inspection.</p>
                  <Button variant="accent" size="sm" onClick={() => setShowAddModal(true)}>
                    + Add Evidence
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="ev-card-grid">
              {evidence.map(item => (
                <EvidenceCard
                  key={item.id}
                  item={item}
                  onView={setViewItem}
                  onEdit={setEditItem}
                  onDelete={setDeleteItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="ev-sidebar">
          {/* Summary */}
          {summary && (
            <Card className="ev-card">
              <CardHeader>
                <CardTitle>Evidence Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="ev-summary">
                  <div className="ev-summary__row ev-summary__row--total">
                    <span>Total Evidence</span>
                    <strong>{summary.total}</strong>
                  </div>
                  {(Object.entries(EVIDENCE_TYPE_LABELS) as [EvidenceType, string][]).map(([type, label]) => (
                    <div key={type} className="ev-summary__row">
                      <span>{label}</span>
                      <strong>{summary.byType[type]}</strong>
                    </div>
                  ))}
                  <div className="ev-summary__row ev-summary__row--highlight">
                    <span>Findings Supported</span>
                    <strong>{summary.findingsSupported}</strong>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Measurement evidence */}
          {measurements.length > 0 && (
            <Card className="ev-card">
              <CardHeader>
                <CardTitle>Measurement Evidence</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="ev-meas-list">
                  {measurements.map(m => (
                    <div key={m.id} className="ev-meas-item">
                      <div className="ev-meas-item__type">{m.measurementTypeLabel}</div>
                      <div className="ev-meas-item__value">
                        {m.value !== null ? `${m.value} ${m.unit}` : '(not recorded)'}
                      </div>
                      {m.location && (
                        <div className="ev-meas-item__location">{m.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Actions */}
          <div className="ev-actions">
            <Button variant="secondary" size="sm" fullWidth onClick={handleBackToReadability}>
              ← Back to Readability
            </Button>
            <Button variant="primary" size="sm" fullWidth onClick={handleContinue}>
              Continue to Officer Verification →
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleBackToCompliance}>
              ← Back to Compliance
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewEvidenceModal item={viewItem} onClose={() => setViewItem(null)} />
      <EvidenceFormModal
        isOpen={showAddModal || !!editItem}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
        onSave={editItem ? handleEditSave : handleAdd}
        editItem={editItem}
      />
      <DeleteEvidenceModal
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
      />

      <style>{evStyles}</style>
    </div>
  );
};

export default EvidenceManagement;

/* ==========================================================================
   Styles
   ========================================================================== */

const evStyles = `
  .ev-page { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .ev-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }
  .ev-header__left { flex: 1; }
  .ev-header__meta { display: flex; gap: var(--space-4); flex-wrap: wrap; }
  .ev-meta-item { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .ev-meta-label { font-size: var(--font-size-xs); color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.4px; }
  .ev-meta-value { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ev-meta-value--id { font-family: var(--font-family-mono); color: var(--color-navy-700); font-size: var(--font-size-xs); }

  /* Demo banner */
  .ev-demo-banner {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-navy-50);
    border-left: 4px solid var(--color-navy-500);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
  }

  /* Body */
  .ev-body {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: var(--space-5);
    align-items: flex-start;
    margin-bottom: var(--space-5);
  }
  .ev-main { display: flex; flex-direction: column; gap: var(--space-3); }

  @media (max-width: 900px) { .ev-body { grid-template-columns: 1fr; } }
  @media (max-width: 768px) {
    .ev-header { flex-direction: column; }
    .ev-header__meta { justify-content: flex-start; }
    .ev-meta-item { align-items: flex-start; }
  }

  /* List header */
  .ev-list-header { display: flex; justify-content: space-between; align-items: center; }
  .ev-list-title { font-size: var(--font-size-base); font-weight: var(--font-weight-bold); color: var(--color-navy-900); display: flex; align-items: center; gap: var(--space-2); }
  .ev-list-count {
    background: var(--color-navy-100);
    color: var(--color-navy-700);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: var(--font-size-xs);
  }

  /* Card grid */
  .ev-card-grid { display: flex; flex-direction: column; gap: var(--space-3); }

  /* Evidence card */
  .ev-card {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }
  .ev-card:hover { box-shadow: var(--shadow-md); }
  .ev-card__preview {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--color-gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ev-card__img { width: 100%; height: 100%; object-fit: cover; }
  .ev-card__no-img { font-size: 2rem; }
  .ev-card__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-1); }
  .ev-card__header { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
  .ev-card__id { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .ev-card__description { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .ev-card__meta { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .ev-card__meta-item { display: flex; flex-direction: column; gap: 1px; }
  .ev-card__meta-label { font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; }
  .ev-card__meta-value { font-size: var(--font-size-xs); color: var(--color-navy-900); }
  .ev-card__finding-label { color: var(--color-navy-700); font-weight: var(--font-weight-semibold); }
  .ev-card__actions { display: flex; flex-direction: column; gap: var(--space-1); flex-shrink: 0; }

  @media (max-width: 600px) {
    .ev-card { flex-direction: column; }
    .ev-card__preview { width: 100%; height: 120px; }
    .ev-card__actions { flex-direction: row; }
  }

  /* Sidebar */
  .ev-sidebar {
    position: sticky;
    top: calc(var(--header-height) + var(--space-6));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Summary */
  .ev-summary { display: flex; flex-direction: column; gap: var(--space-2); }
  .ev-summary__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    padding: var(--space-2) var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
  }
  .ev-summary__row--total { background: var(--color-navy-50); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ev-summary__row--highlight { background: var(--color-gold-50); }

  /* Measurement list */
  .ev-meas-list { display: flex; flex-direction: column; gap: var(--space-2); }
  .ev-meas-item {
    padding: var(--space-2) var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-gray-200);
  }
  .ev-meas-item__type { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ev-meas-item__value { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); font-family: var(--font-family-mono); color: var(--color-navy-900); }
  .ev-meas-item__location { font-size: 11px; color: var(--color-gray-600); }

  /* Actions */
  .ev-actions { display: flex; flex-direction: column; gap: var(--space-2); }

  /* Empty */
  .ev-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .ev-empty__icon { font-size: 3rem; }
  .ev-empty p { margin: 0; font-size: var(--font-size-sm); }

  /* Loading */
  .ev-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .ev-loading__spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: ev-spin 0.8s linear infinite; }
  @keyframes ev-spin { to { transform: rotate(360deg); } }

  /* Error */
  .ev-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); text-align: center; padding: var(--space-8) 0; }
  .ev-error p { color: var(--color-gray-600); margin: 0; }

  /* View modal */
  .ev-view { display: flex; flex-direction: column; gap: var(--space-4); }
  .ev-view__image-wrap { background: var(--color-gray-100); border-radius: var(--radius-md); overflow: hidden; max-height: 400px; }
  .ev-view__image { width: 100%; height: 100%; object-fit: contain; }
  .ev-view__fields { display: flex; flex-direction: column; gap: var(--space-2); }
  .ev-view__row { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); }
  .ev-view__row--full { grid-template-columns: 1fr; }
  .ev-view__label { font-size: 11px; font-weight: var(--font-weight-bold); color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.4px; align-self: baseline; }
  .ev-view__value { font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .ev-view__code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); }
  .ev-view__finding { background: var(--color-gold-50); border-radius: var(--radius-sm); padding: var(--space-2) var(--space-3); }
  .ev-view__finding-content { display: flex; align-items: center; gap: var(--space-2); }
  .ev-view__finding-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }

  /* Form modal */
  .ev-form { display: flex; flex-direction: column; gap: var(--space-4); }
  .ev-form__group { display: flex; flex-direction: column; gap: var(--space-2); }
  .ev-form__label { font-size: 11px; font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; letter-spacing: 0.4px; }
  .ev-form__type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
  .ev-form__type-btn { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); background: var(--color-white); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-gray-700); cursor: pointer; transition: all var(--transition-fast); text-align: left; }
  .ev-form__type-btn:hover { border-color: var(--color-navy-400); color: var(--color-navy-700); }
  .ev-form__type-btn--active { background: var(--color-navy-700); border-color: var(--color-navy-700); color: white; }
  .ev-form__input, .ev-form__select, .ev-form__textarea {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
    width: 100%;
  }
  .ev-form__textarea { resize: vertical; }
  .ev-form__input:focus, .ev-form__select:focus, .ev-form__textarea:focus {
    outline: none;
    border-color: var(--color-navy-500);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .ev-form__hint { font-size: 11px; color: var(--color-gray-500); background: var(--color-gray-50); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin: 0; }

  /* Delete modal */
  .ev-delete { display: flex; flex-direction: column; gap: var(--space-3); }
  .ev-delete__message { font-size: var(--font-size-base); color: var(--color-navy-900); margin: 0; }
  .ev-delete__detail { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0; }
  .ev-delete__detail code { font-family: var(--font-family-mono); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .ev-delete__warn { font-size: var(--font-size-sm); color: var(--color-error-600, #d32f2f); margin: 0; }
`;
