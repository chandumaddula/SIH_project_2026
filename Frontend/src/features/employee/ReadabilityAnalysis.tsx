/* ==========================================================================
   Readability Analysis + Physical Measurement Page
   Task I — Readability Analysis & Physical Measurement Recording

   Displays automated readability assessment from analyzeReadability().
   Allows officers to record physical measurements for regulatory verification.

   Demo: Uses mock data. No real computer vision or physical measurement tools.
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useInspectionStore } from '../../store';
import {
  analyzeReadability,
  ReadabilityAssessment,
  ReadabilityCheck,
  ReadabilityStatus,
  TextRegion,
  PhysicalMeasurement,
  PhysicalMeasurementInput,
  MEASUREMENT_TYPE_LABELS,
  MEASUREMENT_UNITS,
  MeasurementType,
  savePhysicalMeasurement,
  deleteMeasurement,
} from '../../services/readability.service';

/* ==========================================================================
   Helpers
   ========================================================================== */

const STATUS_CONFIG: Record<ReadabilityStatus, {
  label: string;
  badge: 'success' | 'warning' | 'error' | 'neutral';
  icon: string;
  color: string;
  bgColor: string;
}> = {
  good: { label: 'GOOD', badge: 'success', icon: '✓', color: '#2e7d32', bgColor: '#e8f5e9' },
  warning: { label: 'WARNING', badge: 'warning', icon: '⚠', color: '#f57c00', bgColor: '#fff3e0' },
  review_required: { label: 'REVIEW REQUIRED', badge: 'error', icon: '!', color: '#d32f2f', bgColor: '#ffebee' },
  not_determined: { label: 'NOT DETERMINED', badge: 'neutral', icon: '—', color: '#757575', bgColor: '#f5f5f5' },
};

const CHECK_SOURCE_LABELS: Record<string, string> = {
  automated: 'Automated',
  officer: 'Officer',
  physical: 'Physical',
};

const DETECTION_STATUS_LABELS: Record<string, { label: string; badge: 'success' | 'warning' | 'error' | 'neutral' }> = {
  detected: { label: 'Detected', badge: 'success' },
  review_required: { label: 'Review Required', badge: 'warning' },
  not_detected: { label: 'Not Detected', badge: 'error' },
};

/* ==========================================================================
   Readability Check Row
   ========================================================================== */

interface CheckRowProps {
  check: ReadabilityCheck;
}

const CheckRow: React.FC<CheckRowProps> = ({ check }) => {
  const config = STATUS_CONFIG[check.status];
  const sourceLabel = CHECK_SOURCE_LABELS[check.source] ?? check.source;

  return (
    <div className={`ra-check-row ra-check-row--${check.status}`}>
      <div className="ra-check-row__icon" style={{ color: config.color }}>
        {config.icon}
      </div>
      <div className="ra-check-row__body">
        <div className="ra-check-row__header">
          <span className="ra-check-row__name">{check.name}</span>
          <Badge variant={config.badge} size="sm">{config.label}</Badge>
          <Badge variant="neutral" size="sm">{sourceLabel}</Badge>
        </div>
        <p className="ra-check-row__description">{check.description}</p>
      </div>
    </div>
  );
};

/* ==========================================================================
   Text Region Row
   ========================================================================== */

interface RegionRowProps {
  region: TextRegion;
}

const RegionRow: React.FC<RegionRowProps> = ({ region }) => {
  const statusCfg = DETECTION_STATUS_LABELS[region.detectionStatus] ?? DETECTION_STATUS_LABELS.not_detected;
  const confColor = region.confidence >= 90 ? '#2e7d32' : region.confidence >= 70 ? '#f57c00' : '#d32f2f';

  return (
    <div className={`ra-region-row ra-region-row--${region.detectionStatus}`}>
      <div className="ra-region-row__name">{region.name}</div>
      <div className="ra-region-row__source">{region.source}</div>
      <div className="ra-region-row__confidence">
        <div className="ra-confidence-bar">
          <div
            className="ra-confidence-bar__fill"
            style={{
              width: `${region.confidence}%`,
              backgroundColor: confColor,
            }}
          />
        </div>
        <span className="ra-confidence-label" style={{ color: confColor }}>
          {region.confidence > 0 ? `${region.confidence}%` : '—'}
        </span>
      </div>
      <Badge variant={statusCfg.badge} size="sm">{statusCfg.label}</Badge>
    </div>
  );
};

/* ==========================================================================
   Measurement Row
   ========================================================================== */

interface MeasurementRowProps {
  measurement: PhysicalMeasurement;
  onDelete: (id: string) => void;
}

const MeasurementRow: React.FC<MeasurementRowProps> = ({ measurement, onDelete }) => (
  <div className="ra-meas-row">
    <div className="ra-meas-row__header">
      <span className="ra-meas-row__type">{measurement.measurementTypeLabel}</span>
      <Badge variant="neutral" size="sm">{measurement.location}</Badge>
    </div>
    <div className="ra-meas-row__body">
      <span className="ra-meas-row__value">
        {measurement.value !== null ? `${measurement.value} ${measurement.unit}` : '(not recorded)'}
      </span>
      {measurement.observation && (
        <span className="ra-meas-row__observation">{measurement.observation}</span>
      )}
    </div>
    <div className="ra-meas-row__footer">
      <span className="ra-meas-row__meta">
        Recorded by {measurement.recordedBy} &bull; {new Date(measurement.recordedAt).toLocaleString('en-IN')}
      </span>
      <Button variant="ghost" size="sm" onClick={() => onDelete(measurement.id)}>Delete</Button>
    </div>
  </div>
);

/* ==========================================================================
   Add Measurement Modal
   ========================================================================== */

interface AddMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: PhysicalMeasurementInput) => void;
}

const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({ isOpen, onClose, onSave }) => {
  const [measurementType, setMeasurementType] = useState<MeasurementType>('character_height');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mm');
  const [location, setLocation] = useState('');
  const [observation, setObservation] = useState('');

  const units = MEASUREMENT_UNITS[measurementType];

  const handleTypeChange = (type: MeasurementType) => {
    setMeasurementType(type);
    setUnit(MEASUREMENT_UNITS[type][0]);
    setValue('');
  };

  const handleSave = () => {
    onSave({
      measurementType,
      value: value ? parseFloat(value) : null,
      unit,
      location,
      observation,
      evidenceImageData: null,
    });
    // Reset
    setValue('');
    setLocation('');
    setObservation('');
    setMeasurementType('character_height');
    setUnit('mm');
    onClose();
  };

  const handleClose = () => {
    setValue('');
    setLocation('');
    setObservation('');
    setMeasurementType('character_height');
    setUnit('mm');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Physical Measurement"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            Save Measurement
          </Button>
        </>
      }
    >
      <div className="ra-meas-form">
        {/* Measurement type */}
        <div className="ra-meas-form__group">
          <label className="ra-meas-form__label">Measurement Type</label>
          <div className="ra-meas-form__type-grid">
            {(Object.keys(MEASUREMENT_TYPE_LABELS) as MeasurementType[]).map(type => (
              <button
                key={type}
                type="button"
                className={`ra-meas-type-btn ${measurementType === type ? 'ra-meas-type-btn--active' : ''}`}
                onClick={() => handleTypeChange(type)}
              >
                {MEASUREMENT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Value + unit */}
        <div className="ra-meas-form__group">
          <label className="ra-meas-form__label">Measured Value</label>
          <div className="ra-meas-form__value-row">
            <input
              type="number"
              className="ra-meas-form__input ra-meas-form__input--value"
              placeholder="—"
              value={value}
              onChange={e => setValue(e.target.value)}
              step="0.1"
              min="0"
            />
            <select
              className="ra-meas-form__select"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <span className="ra-meas-form__hint">
            Leave blank if measurement not recorded. Use approved measurement tools.
          </span>
        </div>

        {/* Location */}
        <div className="ra-meas-form__group">
          <label className="ra-meas-form__label">Location on Package</label>
          <input
            type="text"
            className="ra-meas-form__input"
            placeholder="e.g., Front label, Back panel, Side seam"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        {/* Observation */}
        <div className="ra-meas-form__group">
          <label className="ra-meas-form__label">Officer Observation</label>
          <textarea
            className="ra-meas-form__textarea"
            placeholder="Optional notes about the measurement..."
            value={observation}
            onChange={e => setObservation(e.target.value)}
            rows={3}
          />
        </div>

        <p className="ra-meas-form__disclaimer">
          <em>Physical measurements must be taken using approved instruments by the authorized officer.</em>
        </p>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Main Component
   ========================================================================== */

export const ReadabilityAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const {
    inspectionId,
    officerName,
    office,
    images,
    extractedInfo,
    measurements,
    addMeasurement,
    removeMeasurement,
  } = useInspectionStore();

  /* ---- Assessment state ---- */

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [assessment, setAssessment] = useState<ReadabilityAssessment | null>(null);

  /* ---- Measurement modal ---- */

  const [showAddMeasModal, setShowAddMeasModal] = useState(false);

  /* ---- Run analysis on mount ---- */

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const result = analyzeReadability(
          extractedInfo,
          inspectionId || 'N/A',
          images.length > 0
        );
        setAssessment(result);
        setPhase(result.success ? 'done' : 'error');
      } catch {
        setPhase('error');
      }
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Handlers ---- */

  const handleBack = () => navigate('/employee/inspection/extracted');

  const handleContinue = () => navigate('/employee/inspection/requirements');

  const handleAddMeasurement = useCallback((input: PhysicalMeasurementInput) => {
    const saved = savePhysicalMeasurement(
      inspectionId || 'N/A',
      input,
      officerName || 'Officer'
    );
    addMeasurement(saved);
  }, [inspectionId, officerName, addMeasurement]);

  const handleDeleteMeasurement = useCallback((id: string) => {
    deleteMeasurement(inspectionId || 'N/A', id);
    removeMeasurement(id);
  }, [inspectionId, removeMeasurement]);

  /* ---- Render ---- */

  // Loading
  if (phase === 'loading') {
    return (
      <div className="page ra-page">
        <div className="ra-header">
          <div className="ra-header__left">
            <h1 className="page-title">Readability &amp; Physical Measurement</h1>
            <p className="page-subtitle">Analyzing label readability...</p>
          </div>
        </div>
        <div className="ra-loading">
          <div className="ra-loading__spinner" />
          <div className="ra-loading__steps">
            <div className="ra-loading__step ra-loading__step--done">
              <span>✓</span> Images loaded
            </div>
            <div className="ra-loading__step ra-loading__step--done">
              <span>✓</span> Text regions detected
            </div>
            <div className="ra-loading__step ra-loading__step--active">
              <span>●</span> Running readability checks
            </div>
            <div className="ra-loading__step ra-loading__step--pending">
              <span>○</span> Preparing results
            </div>
          </div>
          <p className="ra-loading__note">This is a demo evaluation — no real computer-vision analysis is performed.</p>
        </div>
        <style>{raStyles}</style>
      </div>
    );
  }

  // Error
  if (phase === 'error' || !assessment) {
    return (
      <div className="page ra-page">
        <div className="ra-header">
          <div className="ra-header__left">
            <h1 className="page-title">Readability &amp; Physical Measurement</h1>
            <p className="page-subtitle">Unable to complete readability analysis.</p>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="ra-error">
              <h3>Analysis Failed</h3>
              <p>{assessment?.errorMessage ?? 'An error occurred during readability analysis.'}</p>
              <div className="ra-error__actions">
                <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
                <Button variant="ghost" onClick={handleBack}>← Back to Extracted Information</Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <style>{raStyles}</style>
      </div>
    );
  }

  /* ---- Done: render full assessment ---- */

  const overallConfig = STATUS_CONFIG[assessment.overall];
  const automatedChecks = assessment.checks.filter(c => c.source === 'automated');
  const physicalChecks = assessment.checks.filter(c => c.source === 'physical');
  const automatedCount = automatedChecks.filter(c => c.status === 'good').length;
  const automatedTotal = automatedChecks.length;

  return (
    <div className="page ra-page">
      {/* Header */}
      <div className="ra-header">
        <div className="ra-header__left">
          <h1 className="page-title">Readability &amp; Physical Measurement</h1>
          <p className="page-subtitle">
            Review automated readability assessment and record physical measurements.
          </p>
        </div>
        <div className="ra-header__meta">
          <div className="ra-meta-item">
            <span className="ra-meta-label">Inspection ID</span>
            <span className="ra-meta-value ra-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="ra-meta-item">
            <span className="ra-meta-label">Officer</span>
            <span className="ra-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="ra-meta-item">
            <span className="ra-meta-label">Office</span>
            <span className="ra-meta-value">{office || 'Regional Metrology Office'}</span>
          </div>
        </div>
      </div>

      {/* Demo banners */}
      <div className="ra-demo-banner" role="status">
        <span className="ra-demo-banner__icon">ℹ️</span>
        <span>
          <strong>Demo / Mock Readability Assessment</strong> — Automated checks are simulated.
          No real computer-vision analysis is performed. Physical measurements must be taken by the authorized officer using approved instruments.
        </span>
      </div>

      {assessment.physicalScaleAvailable === false && (
        <div className="ra-physical-note">
          <span className="ra-physical-note__icon">📏</span>
          <span>
            <strong>Physical Scale Note:</strong> Photographic images cannot provide a reliable physical scale.
            Use approved physical measurement methods for regulatory verification.
          </span>
        </div>
      )}

      <div className="ra-body">
        {/* Left column: Readability */}
        <div className="ra-main">
          {/* Overall status card */}
          <Card className="ra-card ra-card--overall">
            <CardBody>
              <div className="ra-overall">
                <div className="ra-overall__icon-wrap" style={{ backgroundColor: overallConfig.bgColor }}>
                  <span className="ra-overall__icon" style={{ color: overallConfig.color }}>
                    {overallConfig.icon}
                  </span>
                </div>
                <div className="ra-overall__text">
                  <h2 className="ra-overall__label" style={{ color: overallConfig.color }}>
                    {assessment.overallLabel}
                  </h2>
                  <p className="ra-overall__message">{assessment.overallMessage}</p>
                </div>
              </div>
              {/* Automated checks summary */}
              <div className="ra-overall__summary">
                <div className="ra-overall__summary-item ra-overall__summary-item--good">
                  <span className="ra-overall__summary-num">{automatedCount}</span>
                  <span className="ra-overall__summary-label">Checks Passed</span>
                </div>
                <div className="ra-overall__summary-item">
                  <span className="ra-overall__summary-num">{automatedTotal}</span>
                  <span className="ra-overall__summary-label">Automated Checks</span>
                </div>
                <div className="ra-overall__summary-item">
                  <span className="ra-overall__summary-num">{assessment.textRegions.length}</span>
                  <span className="ra-overall__summary-label">Text Regions</span>
                </div>
                <div className="ra-overall__summary-item">
                  <span className="ra-overall__summary-num">{measurements.length}</span>
                  <span className="ra-overall__summary-label">Measurements</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Automated checks */}
          <Card className="ra-card">
            <CardHeader>
              <CardTitle>Automated Readability Checks</CardTitle>
              <Badge variant="info" size="sm">Automated</Badge>
            </CardHeader>
            <CardBody>
              <div className="ra-check-list">
                {automatedChecks.map(check => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Physical scale check */}
          <Card className="ra-card">
            <CardHeader>
              <CardTitle>Physical Measurement Assessment</CardTitle>
              <Badge variant="neutral" size="sm">Physical</Badge>
            </CardHeader>
            <CardBody>
              {physicalChecks.map(check => (
                <CheckRow key={check.id} check={check} />
              ))}
              <p className="ra-physical-note-text">
                {assessment.physicalScaleNote}
              </p>
            </CardBody>
          </Card>

          {/* Text regions */}
          <Card className="ra-card">
            <CardHeader>
              <CardTitle>Detected Text Regions</CardTitle>
              <span className="ra-section-count">{assessment.textRegions.length} regions</span>
            </CardHeader>
            <CardBody>
              {assessment.textRegions.length === 0 ? (
                <div className="ra-empty">
                  <p>No text regions detected.</p>
                </div>
              ) : (
                <div className="ra-region-list">
                  {assessment.textRegions.map(region => (
                    <RegionRow key={region.id} region={region} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column: Physical measurements */}
        <div className="ra-sidebar">
          <Card className="ra-card">
            <CardHeader>
              <CardTitle>Physical Measurements</CardTitle>
              <Button variant="accent" size="sm" onClick={() => setShowAddMeasModal(true)}>
                + Record Measurement
              </Button>
            </CardHeader>
            <CardBody>
              {measurements.length === 0 ? (
                <div className="ra-meas-empty">
                  <span className="ra-meas-empty__icon">📐</span>
                  <p>No measurements recorded yet.</p>
                  <p className="ra-meas-empty__sub">
                    Record physical measurements using approved instruments.
                  </p>
                </div>
              ) : (
                <div className="ra-meas-list">
                  {measurements.map(m => (
                    <MeasurementRow
                      key={m.id}
                      measurement={m}
                      onDelete={handleDeleteMeasurement}
                    />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Officer notes */}
          <Card className="ra-card">
            <CardHeader>
              <CardTitle>Officer Notes</CardTitle>
            </CardHeader>
            <CardBody>
              <textarea
                className="ra-notes-textarea"
                placeholder="Add notes about readability assessment or physical measurements..."
                rows={4}
              />
            </CardBody>
          </Card>

          {/* Disclaimer */}
          <div className="ra-sidebar__disclaimer">
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              Physical measurements must be taken with approved instruments by the authorized officer.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="ra-bottom-actions">
        <Button variant="ghost" onClick={handleBack}>
          ← Back to Extracted Information
        </Button>
        <div className="ra-bottom-actions__right">
          <Button variant="primary" onClick={handleContinue}>
            Continue to Applicable Requirements →
          </Button>
        </div>
      </div>

      {/* Add measurement modal */}
      <AddMeasurementModal
        isOpen={showAddMeasModal}
        onClose={() => setShowAddMeasModal(false)}
        onSave={handleAddMeasurement}
      />

      <style>{raStyles}</style>
    </div>
  );
};

export default ReadabilityAnalysis;

/* ==========================================================================
   Styles
   ========================================================================== */

const raStyles = `
  .ra-page { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .ra-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }
  .ra-header__left { flex: 1; }
  .ra-header__meta { display: flex; gap: var(--space-4); flex-wrap: wrap; }
  .ra-meta-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .ra-meta-label {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .ra-meta-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }
  .ra-meta-value--id {
    font-family: var(--font-family-mono);
    color: var(--color-navy-700);
    font-size: var(--font-size-xs);
  }

  /* Demo banner */
  .ra-demo-banner {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-navy-50);
    border-left: 4px solid var(--color-navy-500);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
  }
  .ra-demo-banner__icon { font-size: 1.2rem; flex-shrink: 0; }

  /* Physical note */
  .ra-physical-note {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-warning-100);
    border-left: 4px solid var(--color-warning-600);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--color-gray-800);
  }
  .ra-physical-note__icon { font-size: 1.2rem; flex-shrink: 0; }

  /* Body */
  .ra-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--space-5);
    align-items: flex-start;
    margin-bottom: var(--space-5);
  }
  .ra-main { display: flex; flex-direction: column; gap: var(--space-4); }

  @media (max-width: 900px) {
    .ra-body { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .ra-header { flex-direction: column; }
    .ra-header__meta { justify-content: flex-start; }
    .ra-meta-item { align-items: flex-start; }
  }

  /* Card */
  .ra-card { margin-bottom: 0; }
  .ra-card .card-body { padding: var(--space-4) var(--space-5); }
  .ra-card--overall {
    background: linear-gradient(135deg, var(--color-navy-50), var(--color-white));
    border: 2px solid var(--color-navy-200);
  }

  /* Overall */
  .ra-overall {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-gray-200);
  }
  .ra-overall__icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ra-overall__icon { font-size: 2rem; font-weight: 700; }
  .ra-overall__text { flex: 1; }
  .ra-overall__label {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--space-1);
    letter-spacing: 1px;
  }
  .ra-overall__message {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    margin: 0;
  }
  .ra-overall__summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
  }
  .ra-overall__summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    text-align: center;
    background: var(--color-navy-50);
  }
  .ra-overall__summary-item--good { background: var(--color-success-50, #e8f5e9); }
  .ra-overall__summary-num {
    font-size: 1.6rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    line-height: 1;
  }
  .ra-overall__summary-item--good .ra-overall__summary-num { color: var(--color-success-600, #2e7d32); }
  .ra-overall__summary-label {
    font-size: 10px;
    color: var(--color-gray-700);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Check list */
  .ra-check-list { display: flex; flex-direction: column; gap: var(--space-2); }
  .ra-check-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    background: var(--color-white);
    border-left: 4px solid var(--color-gray-300);
  }
  .ra-check-row--good { border-left-color: var(--color-success-600, #2e7d32); background: var(--color-success-50, #e8f5e9); }
  .ra-check-row--warning { border-left-color: var(--color-warning-600, #f57c00); background: var(--color-warning-50, #fff3e0); }
  .ra-check-row--review_required { border-left-color: var(--color-error-600, #d32f2f); background: var(--color-error-50, #ffebee); }
  .ra-check-row--not_determined { opacity: 0.7; }
  .ra-check-row__icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: currentColor;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    opacity: 0.9;
  }
  .ra-check-row__body { flex: 1; min-width: 0; }
  .ra-check-row__header { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-1); }
  .ra-check-row__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ra-check-row__description { font-size: 12px; color: var(--color-gray-700); margin: 0; }

  /* Physical note text */
  .ra-physical-note-text {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    margin: var(--space-3) 0 0;
    padding: var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-warning-600, #f57c00);
  }

  /* Section count */
  .ra-section-count {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
  }

  /* Region list */
  .ra-region-list { display: flex; flex-direction: column; gap: var(--space-2); }
  .ra-region-row {
    display: grid;
    grid-template-columns: 140px 1fr 120px 120px;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-sm);
    background: var(--color-white);
    border-left: 3px solid var(--color-gray-300);
  }
  .ra-region-row--detected { border-left-color: var(--color-success-600, #2e7d32); background: var(--color-success-50, #e8f5e9); }
  .ra-region-row--review_required { border-left-color: var(--color-warning-600, #f57c00); background: var(--color-warning-50, #fff3e0); }
  .ra-region-row--not_detected { opacity: 0.6; }
  .ra-region-row__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ra-region-row__source { font-size: 11px; color: var(--color-gray-600); }
  .ra-region-row__confidence { display: flex; align-items: center; gap: var(--space-2); }
  .ra-confidence-bar {
    flex: 1;
    height: 6px;
    background: var(--color-gray-200);
    border-radius: 3px;
    overflow: hidden;
  }
  .ra-confidence-bar__fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
  .ra-confidence-label { font-size: 11px; font-weight: var(--font-weight-semibold); min-width: 36px; }

  /* Sidebar */
  .ra-sidebar {
    position: sticky;
    top: calc(var(--header-height) + var(--space-6));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Measurement empty */
  .ra-meas-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-2);
    padding: var(--space-4) 0;
    color: var(--color-gray-600);
  }
  .ra-meas-empty__icon { font-size: 2rem; }
  .ra-meas-empty p { margin: 0; font-size: var(--font-size-sm); }
  .ra-meas-empty__sub { font-size: 11px; color: var(--color-gray-500); }

  /* Measurement list */
  .ra-meas-list { display: flex; flex-direction: column; gap: var(--space-3); }
  .ra-meas-row {
    padding: var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-gray-200);
  }
  .ra-meas-row__header { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
  .ra-meas-row__type { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ra-meas-row__body { display: flex; flex-direction: column; gap: 2px; margin-bottom: var(--space-2); }
  .ra-meas-row__value { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-navy-900); font-family: var(--font-family-mono); }
  .ra-meas-row__observation { font-size: 12px; color: var(--color-gray-700); }
  .ra-meas-row__footer { display: flex; justify-content: space-between; align-items: center; }
  .ra-meas-row__meta { font-size: 10px; color: var(--color-gray-500); }

  /* Notes textarea */
  .ra-notes-textarea {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    resize: vertical;
    background: var(--color-white);
  }
  .ra-notes-textarea:focus {
    outline: none;
    border-color: var(--color-navy-500);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .ra-notes-textarea::placeholder { color: var(--color-gray-400); }

  /* Sidebar disclaimer */
  .ra-sidebar__disclaimer {
    font-size: 11px;
    color: var(--color-gray-600);
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
    padding: 0 var(--space-1);
  }
  .ra-sidebar__disclaimer p { margin: 0; display: flex; align-items: flex-start; gap: var(--space-1); }

  /* Bottom actions */
  .ra-bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    background: var(--color-white);
    border: 2px solid var(--color-navy-100);
    border-radius: var(--radius-lg);
    position: sticky;
    bottom: var(--space-4);
    z-index: 10;
  }
  .ra-bottom-actions__right { display: flex; gap: var(--space-2); }

  /* Loading */
  .ra-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-12) 0;
  }
  .ra-loading__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-gray-200);
    border-top-color: var(--color-navy-500);
    border-radius: 50%;
    animation: ra-spin 0.8s linear infinite;
  }
  .ra-loading__steps { display: flex; flex-direction: column; gap: var(--space-2); }
  .ra-loading__step {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    background: var(--color-gray-100);
    color: var(--color-gray-600);
  }
  .ra-loading__step--done { background: var(--color-success-50, #e8f5e9); color: var(--color-success-700, #2e7d32); }
  .ra-loading__step--active { background: var(--color-navy-50); color: var(--color-navy-700); font-weight: var(--font-weight-semibold); }
  .ra-loading__note { font-size: 12px; color: var(--color-gray-500); font-style: italic; }
  @keyframes ra-spin { to { transform: rotate(360deg); } }

  /* Error */
  .ra-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-4);
    padding: var(--space-6) 0;
  }
  .ra-error h3 { margin: 0; color: var(--color-navy-900); }
  .ra-error p { color: var(--color-gray-600); margin: 0; max-width: 400px; }
  .ra-error__actions { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }

  /* Empty */
  .ra-empty {
    text-align: center;
    padding: var(--space-6) 0;
    color: var(--color-gray-600);
    font-size: var(--font-size-sm);
  }

  /* Measurement form */
  .ra-meas-form { display: flex; flex-direction: column; gap: var(--space-4); }
  .ra-meas-form__group { display: flex; flex-direction: column; gap: var(--space-2); }
  .ra-meas-form__label {
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .ra-meas-form__type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
  .ra-meas-type-btn {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    background: var(--color-white);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
  }
  .ra-meas-type-btn:hover { border-color: var(--color-navy-400); color: var(--color-navy-700); }
  .ra-meas-type-btn--active {
    background: var(--color-navy-700);
    border-color: var(--color-navy-700);
    color: white;
  }
  .ra-meas-form__value-row { display: flex; gap: var(--space-2); }
  .ra-meas-form__input {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
    width: 100%;
  }
  .ra-meas-form__input--value { max-width: 140px; }
  .ra-meas-form__select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
    cursor: pointer;
  }
  .ra-meas-form__input:focus, .ra-meas-form__select:focus, .ra-meas-form__textarea:focus {
    outline: none;
    border-color: var(--color-navy-500);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .ra-meas-form__hint { font-size: 11px; color: var(--color-gray-500); }
  .ra-meas-form__textarea {
    padding: var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    resize: vertical;
    background: var(--color-white);
  }
  .ra-meas-form__disclaimer {
    font-size: 11px;
    color: var(--color-gray-500);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-gray-200);
  }
  .ra-meas-form__disclaimer em { color: var(--color-warning-600, #f57c00); }
`;
