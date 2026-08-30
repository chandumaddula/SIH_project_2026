import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useInspectionStore } from '../../store';
import {
  runComplianceChecks,
  ComplianceCheck,
  ComplianceResult,
  ComplianceStatus,
  RuleTrace,
} from '../../services/compliance.service';

/* ==========================================================================
   Helpers
   ========================================================================== */

type FilterStatus = 'all' | ComplianceStatus;

const STATUS_CONFIG: Record<ComplianceStatus, { label: string; badge: 'success' | 'warning' | 'error' | 'neutral'; icon: string; color: string }> = {
  pass: { label: 'PASS', badge: 'success', icon: '🟢', color: '#2e7d32' },
  review_required: { label: 'REVIEW REQUIRED', badge: 'warning', icon: '🟡', color: '#f57c00' },
  potential_issue: { label: 'POTENTIAL ISSUE', badge: 'error', icon: '🔴', color: '#d32f2f' },
  not_applicable: { label: 'NOT APPLICABLE', badge: 'neutral', icon: '○', color: '#757575' },
};

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pass', label: 'Pass' },
  { value: 'review_required', label: 'Review Required' },
  { value: 'potential_issue', label: 'Potential Issue' },
  { value: 'not_applicable', label: 'Not Applicable' },
];

const getCurrentDate = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ==========================================================================
   Compliance Check Row (desktop table / mobile card)
   ========================================================================== */

interface CheckRowProps {
  check: ComplianceCheck;
  onView: (c: ComplianceCheck) => void;
}

const CheckRow: React.FC<CheckRowProps> = ({ check, onView }) => {
  const config = STATUS_CONFIG[check.status];
  const confColor = check.confidenceLevel === 'high' ? '#2e7d32' : check.confidenceLevel === 'medium' ? '#f57c00' : '#d32f2f';

  return (
    <div className={`cs-check-row cs-check-row--${check.status}`}>
      <div className="cs-check-row__status">
        <span className="cs-status-icon" style={{ color: config.color }}>{config.icon}</span>
        <Badge variant={config.badge} size="sm">{config.label}</Badge>
      </div>
      <div className="cs-check-row__content">
        <span className="cs-check-row__name">{check.requirementName}</span>
        <span className="cs-check-row__value">
          {check.extractedValue || '(not detected)'}
        </span>
      </div>
      <div className="cs-check-row__meta">
        <span className="cs-check-row__confidence" style={{ color: confColor }}>
          {check.status === 'not_applicable' ? '—' : `${check.confidence}%`}
        </span>
        <code className="cs-check-row__rule">{check.ruleReference}</code>
        <span className="cs-check-row__evidence">{check.evidence.sourceImageType}</span>
      </div>
      <div className="cs-check-row__actions">
        <Button variant="ghost" size="sm" onClick={() => onView(check)}>
          {check.status === 'not_applicable' ? 'View' : 'Details'}
        </Button>
      </div>
    </div>
  );
};

/* ==========================================================================
   Rule Trace Component
   ========================================================================== */

const RuleTraceView: React.FC<{ trace: RuleTrace }> = ({ trace }) => (
  <div className="cs-trace">
    {trace.steps.map((step, i) => (
      <div key={i} className={`cs-trace__step cs-trace__step--${step.status}`}>
        <div className="cs-trace__step-marker">
          {step.status === 'pass' ? (
            <span className="cs-trace__dot cs-trace__dot--pass" />
          ) : step.status === 'fail' ? (
            <span className="cs-trace__dot cs-trace__dot--fail" />
          ) : (
            <span className="cs-trace__dot cs-trace__dot--pending" />
          )}
          {i < trace.steps.length - 1 && <div className="cs-trace__line" />}
        </div>
        <div className="cs-trace__step-content">
          <span className="cs-trace__step-label">{step.step}</span>
          <span className="cs-trace__step-value">{step.value}</span>
        </div>
      </div>
    ))}
  </div>
);

/* ==========================================================================
   Check Detail Modal
   ========================================================================== */

interface CheckDetailModalProps {
  check: ComplianceCheck | null;
  onClose: () => void;
  onEditExtracted: () => void;
}

const CheckDetailModal: React.FC<CheckDetailModalProps> = ({ check, onClose, onEditExtracted }) => {
  if (!check) return null;
  const config = STATUS_CONFIG[check.status];

  return (
    <Modal
      isOpen={!!check}
      onClose={onClose}
      title="Compliance Check Details"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onEditExtracted}>Edit Extracted Information</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="cs-detail">
        {/* Status */}
        <div className="cs-detail__status">
          <span className="cs-detail__status-icon" style={{ fontSize: '2rem' }}>{config.icon}</span>
          <div>
            <h3 className="cs-detail__status-label" style={{ color: config.color, margin: 0 }}>{config.label}</h3>
            <p className="cs-detail__status-reason">{check.explanation}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="cs-detail__fields">
          <div className="cs-detail__row">
            <span className="cs-detail__label">Requirement</span>
            <span className="cs-detail__value">{check.requirementName}</span>
          </div>
          <div className="cs-detail__row">
            <span className="cs-detail__label">Extracted Value</span>
            <span className="cs-detail__value cs-detail__value--mono">{check.extractedValue || '(not detected)'}</span>
          </div>
          <div className="cs-detail__row">
            <span className="cs-detail__label">Expected / Configured</span>
            <span className="cs-detail__value">{check.expectedCondition}</span>
          </div>
          <div className="cs-detail__row">
            <span className="cs-detail__label">Demo Confidence</span>
            <span className={`cs-detail__value cs-detail__confidence--${check.confidenceLevel}`}>
              {check.status === 'not_applicable' ? '—' : `${check.confidence}%`}
              <span className="cs-detail__confidence-level">
                ({check.confidenceLevel === 'high' ? 'High' : check.confidenceLevel === 'medium' ? 'Medium' : 'Low'})
              </span>
            </span>
          </div>
          <div className="cs-detail__row">
            <span className="cs-detail__label">Rule Reference</span>
            <code className="cs-detail__code">{check.ruleReference}</code>
          </div>
          <div className="cs-detail__row">
            <span className="cs-detail__label">Evidence Source</span>
            <span className="cs-detail__value">{check.evidence.sourceImageType}</span>
          </div>
        </div>

        {/* Why flagged */}
        {(check.status === 'review_required' || check.status === 'potential_issue') && (
          <div className="cs-detail__why">
            <h4>Why was this flagged?</h4>
            <p>{check.explanation}</p>
            <p className="cs-detail__why-action">
              <strong>Recommended Action:</strong> {check.recommendedAction}
            </p>
          </div>
        )}

        {/* Rule Trace */}
        <div className="cs-detail__trace-section">
          <h4>Rule Trace</h4>
          <RuleTraceView trace={check.ruleTrace} />
        </div>

        <p className="cs-detail__disclaimer">
          <em>Demo compliance check — not a final legal determination. Officer verification is required.</em>
        </p>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Main component
   ========================================================================== */

export const ComplianceScreening: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, extractedInfo, applicabilityResult, setComplianceResult } = useInspectionStore();

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isRerunning, setIsRerunning] = useState(false);

  // Run compliance on mount
  useEffect(() => {
    if (!extractedInfo || !applicabilityResult) {
      setPhase('error');
      setResult({
        success: false,
        errorMessage: 'No inspection data is available. Please complete the image analysis, extraction, and applicability steps first.',
        overallStatus: 'review_required',
        overallLabel: 'REVIEW REQUIRED',
        overallMessage: 'Data is missing.',
        checks: [],
        summary: { totalChecks: 0, passCount: 0, reviewRequiredCount: 0, potentialIssueCount: 0, notApplicableCount: 0 },
        inspectionId: inspectionId || 'N/A',
      });
      return;
    }

    // Simulate evaluation delay
    const timer = setTimeout(() => {
      try {
        const complianceResult = runComplianceChecks(extractedInfo, applicabilityResult);
        setResult(complianceResult);
        setComplianceResult(complianceResult);
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Handlers ---- */

  const handleBack = () => navigate('/employee/inspection/requirements');

  const handleEditExtracted = () => {
    setSelectedCheck(null);
    navigate('/employee/inspection/extracted');
  };

  const handleRerun = () => {
    if (!extractedInfo || !applicabilityResult) return;
    setIsRerunning(true);
    setTimeout(() => {
      const newResult = runComplianceChecks(extractedInfo, applicabilityResult);
      setResult(newResult);
      setIsRerunning(false);
    }, 1500);
  };

  const handleViewCheck = (check: ComplianceCheck) => setSelectedCheck(check);
  const handleCloseModal = () => setSelectedCheck(null);

  /* ---- Filtered checks ---- */

  const filteredChecks = result?.checks.filter(
    c => filter === 'all' || c.status === filter
  ) ?? [];

  /* ---- Render ---- */

  const currentDate = getCurrentDate();

  // Loading
  if (phase === 'loading') {
    return (
      <div className="page cs-page">
        <div className="cs-header">
          <div className="cs-header__left">
            <h1 className="page-title">Compliance Screening</h1>
            <p className="page-subtitle">Running compliance checks...</p>
          </div>
        </div>
        <div className="cs-loading">
          <div className="cs-loading__spinner" />
          <div className="cs-loading__steps">
            <div className="cs-loading__step cs-loading__step--done">
              <span>✓</span> Requirements loaded
            </div>
            <div className="cs-loading__step cs-loading__step--done">
              <span>✓</span> Product information loaded
            </div>
            <div className="cs-loading__step cs-loading__step--active">
              <span>●</span> Evaluating configured checks
            </div>
            <div className="cs-loading__step cs-loading__step--pending">
              <span>○</span> Preparing results
            </div>
          </div>
          <p className="cs-loading__note">This is a demo evaluation — no real rules engine is running.</p>
        </div>
        <style>{csStyles}</style>
      </div>
    );
  }

  // Error
  if (phase === 'error' || !result) {
    return (
      <div className="page cs-page">
        <div className="cs-header">
          <div className="cs-header__left">
            <h1 className="page-title">Compliance Screening</h1>
            <p className="page-subtitle">Unable to complete compliance screening.</p>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="cs-error">
              <h3>Evaluation Failed</h3>
              <p>{result?.errorMessage ?? 'An error occurred while running compliance checks.'}</p>
              <div className="cs-error__actions">
                <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
                <Button variant="secondary" onClick={() => navigate('/employee/inspection/requirements')}>Review Requirements</Button>
                <Button variant="ghost" onClick={handleBack}>← Back</Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <style>{csStyles}</style>
      </div>
    );
  }

  const { overallStatus, overallLabel, overallMessage, summary, checks } = result;
  const overallConfig = STATUS_CONFIG[overallStatus];

  return (
    <div className="page cs-page">
      {/* Header */}
      <div className="cs-header">
        <div className="cs-header__left">
          <h1 className="page-title">Compliance Screening</h1>
          <p className="page-subtitle">
            Review configured compliance checks against the information extracted from the package.
          </p>
        </div>
        <div className="cs-header__meta">
          <div className="cs-meta-item">
            <span className="cs-meta-label">Inspection ID</span>
            <span className="cs-meta-value cs-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="cs-meta-item">
            <span className="cs-meta-label">Officer</span>
            <span className="cs-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="cs-meta-item">
            <span className="cs-meta-label">Date</span>
            <span className="cs-meta-value">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Demo banner */}
      <div className="cs-demo-banner" role="status">
        <span className="cs-demo-banner__icon">ℹ️</span>
        <span>
          <strong>Demo / Mock Compliance Screening</strong> — Results are from configured demo checks.
          This is <strong>not</strong> a legal determination. <strong>AI-assisted screening does not replace authorized officer verification.</strong>
        </span>
      </div>

      <div className="cs-body">
        <div className="cs-main">

          {/* Overall result card */}
          <Card className="cs-card cs-card--result">
            <CardBody>
              <div className="cs-overall">
                <div className="cs-overall__icon" style={{ fontSize: '3rem' }}>
                  {overallConfig.icon}
                </div>
                <div className="cs-overall__text">
                  <h2 className="cs-overall__label" style={{ color: overallConfig.color }}>
                    {overallLabel}
                  </h2>
                  <p className="cs-overall__message">{overallMessage}</p>
                </div>
              </div>
              {/* Summary bar */}
              <div className="cs-summary-bar">
                <div className="cs-summary-bar__item cs-summary-bar__item--pass">
                  <span className="cs-summary-bar__num">{summary.passCount}</span>
                  <span className="cs-summary-bar__label">PASS</span>
                </div>
                <div className="cs-summary-bar__item cs-summary-bar__item--review">
                  <span className="cs-summary-bar__num">{summary.reviewRequiredCount}</span>
                  <span className="cs-summary-bar__label">Review Required</span>
                </div>
                <div className="cs-summary-bar__item cs-summary-bar__item--issue">
                  <span className="cs-summary-bar__num">{summary.potentialIssueCount}</span>
                  <span className="cs-summary-bar__label">Potential Issue</span>
                </div>
                <div className="cs-summary-bar__item cs-summary-bar__item--na">
                  <span className="cs-summary-bar__num">{summary.notApplicableCount}</span>
                  <span className="cs-summary-bar__label">Not Applicable</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Filters + table */}
          <Card className="cs-card">
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <div className="cs-filters">
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`cs-filter-btn ${filter === opt.value ? 'cs-filter-btn--active' : ''}`}
                    onClick={() => setFilter(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              {filteredChecks.length === 0 ? (
                <div className="cs-empty">
                  <p>No checks match the selected filter.</p>
                </div>
              ) : (
                <div className="cs-check-list">
                  {filteredChecks.map(check => (
                    <CheckRow
                      key={check.id}
                      check={check}
                      onView={handleViewCheck}
                    />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Rule Trace section — show first potential-issue or review-required check */}
          {(summary.potentialIssueCount > 0 || summary.reviewRequiredCount > 0) && (
            (() => {
              const firstFlagged = checks.find(
                c => c.status === 'potential_issue' || c.status === 'review_required'
              );
              if (!firstFlagged) return null;
              return (
                <Card className="cs-card cs-card--trace">
                  <CardHeader>
                    <CardTitle>Rule Trace — {firstFlagged.requirementName}</CardTitle>
                    <Badge variant={STATUS_CONFIG[firstFlagged.status].badge} size="sm">
                      {STATUS_CONFIG[firstFlagged.status].label}
                    </Badge>
                  </CardHeader>
                  <CardBody>
                    <RuleTraceView trace={firstFlagged.ruleTrace} />
                    <div className="cs-trace__explanation">
                      <p>{firstFlagged.explanation}</p>
                      <p><strong>Recommended Action:</strong> {firstFlagged.recommendedAction}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })()
          )}
        </div>

        {/* Sticky sidebar */}
        <div className="cs-sidebar">
          <Card className="cs-card">
            <CardHeader>
              <CardTitle>Screening Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="cs-side-summary">
                <div className="cs-side-summary__row">
                  <span>Total Checks</span>
                  <strong>{summary.totalChecks}</strong>
                </div>
                <div className="cs-side-summary__row cs-side-summary__row--pass">
                  <span>Pass</span>
                  <strong>{summary.passCount}</strong>
                </div>
                <div className="cs-side-summary__row cs-side-summary__row--review">
                  <span>Review Required</span>
                  <strong>{summary.reviewRequiredCount}</strong>
                </div>
                <div className="cs-side-summary__row cs-side-summary__row--issue">
                  <span>Potential Issue</span>
                  <strong>{summary.potentialIssueCount}</strong>
                </div>
                <div className="cs-side-summary__row">
                  <span>Not Applicable</span>
                  <strong>{summary.notApplicableCount}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="cs-actions">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => navigate('/employee/inspection/evidence')}
            >
              Continue to Evidence →
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={handleRerun}
              loading={isRerunning}
            >
              {isRerunning ? 'Re-evaluating...' : 'Re-run Screening'}
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleEditExtracted}>
              Edit Extracted Information
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleBack}>
              ← Back
            </Button>
          </div>

          <div className="cs-sidebar__note">
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              AI-assisted screening does not replace authorized officer verification.
            </p>
          </div>
        </div>
      </div>

      {/* Check detail modal */}
      <CheckDetailModal
        check={selectedCheck}
        onClose={handleCloseModal}
        onEditExtracted={handleEditExtracted}
      />

      <style>{csStyles}</style>
    </div>
  );
};

export default ComplianceScreening;

/* ==========================================================================
   Styles
   ========================================================================== */

const csStyles = `
  .cs-page { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .cs-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }
  .cs-header__left { flex: 1; }
  .cs-header__meta { display: flex; gap: var(--space-4); flex-wrap: wrap; }
  .cs-meta-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .cs-meta-label {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .cs-meta-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }
  .cs-meta-value--id {
    font-family: var(--font-family-mono);
    color: var(--color-navy-700);
    font-size: var(--font-size-xs);
  }

  /* Demo banner */
  .cs-demo-banner {
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
  .cs-demo-banner__icon { font-size: 1.2rem; flex-shrink: 0; }

  /* Body */
  .cs-body {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: var(--space-5);
    align-items: flex-start;
  }
  .cs-main { display: flex; flex-direction: column; gap: var(--space-4); }

  @media (max-width: 900px) {
    .cs-body { grid-template-columns: 1fr; }
    .cs-sidebar { position: static; order: -1; }
  }
  @media (max-width: 768px) {
    .cs-header { flex-direction: column; }
    .cs-header__meta { justify-content: flex-start; }
    .cs-meta-item { align-items: flex-start; }
  }

  /* Card */
  .cs-card { margin-bottom: 0; }
  .cs-card .card-body { padding: var(--space-4) var(--space-5); }
  .cs-card--result {
    background: linear-gradient(135deg, var(--color-navy-50), var(--color-white));
    border: 2px solid var(--color-navy-200);
  }
  .cs-card--trace { border: 2px solid var(--color-warning-200, #fcd9a8); }

  /* Overall result */
  .cs-overall {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-gray-200);
  }
  .cs-overall__icon { flex-shrink: 0; }
  .cs-overall__text { flex: 1; }
  .cs-overall__label {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--space-1);
    letter-spacing: 1px;
  }
  .cs-overall__message {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    margin: 0;
  }

  /* Summary bar */
  .cs-summary-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
  }
  .cs-summary-bar__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    text-align: center;
  }
  .cs-summary-bar__item--pass { background: var(--color-success-50, #e8f5e9); }
  .cs-summary-bar__item--review { background: var(--color-warning-50, #fff3e0); }
  .cs-summary-bar__item--issue { background: var(--color-error-50, #ffebee); }
  .cs-summary-bar__item--na { background: var(--color-gray-100); }
  .cs-summary-bar__num {
    font-size: 1.6rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    line-height: 1;
  }
  .cs-summary-bar__item--review .cs-summary-bar__num { color: var(--color-warning-600, #f57c00); }
  .cs-summary-bar__item--issue .cs-summary-bar__num { color: var(--color-error-600, #d32f2f); }
  .cs-summary-bar__label {
    font-size: 10px;
    color: var(--color-gray-700);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Filters */
  .cs-filters {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }
  .cs-filter-btn {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: 20px;
    background: var(--color-white);
    font-size: var(--font-size-xs);
    color: var(--color-gray-700);
    cursor: pointer;
    font-family: inherit;
    transition: all var(--transition-fast);
  }
  .cs-filter-btn:hover { border-color: var(--color-navy-400); color: var(--color-navy-700); }
  .cs-filter-btn--active {
    background: var(--color-navy-700);
    border-color: var(--color-navy-700);
    color: white;
  }

  /* Check list */
  .cs-check-list { display: flex; flex-direction: column; gap: var(--space-2); }
  .cs-check-row {
    display: grid;
    grid-template-columns: 160px 1fr 160px 80px;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    background: var(--color-white);
    border-left: 4px solid var(--color-gray-300);
    transition: box-shadow 0.2s;
  }
  .cs-check-row:hover { box-shadow: var(--shadow-md); }
  .cs-check-row--pass { border-left-color: var(--color-success-600, #2e7d32); }
  .cs-check-row--review_required { border-left-color: var(--color-warning-600, #f57c00); }
  .cs-check-row--potential_issue { border-left-color: var(--color-error-600, #d32f2f); }
  .cs-check-row--not_applicable { opacity: 0.6; }
  .cs-check-row__status { display: flex; align-items: center; gap: var(--space-2); }
  .cs-status-icon { font-size: 1rem; }
  .cs-check-row__content { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .cs-check-row__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .cs-check-row__value { font-size: 12px; color: var(--color-gray-600); font-family: var(--font-family-mono); }
  .cs-check-row__meta { display: flex; flex-direction: column; gap: 2px; }
  .cs-check-row__confidence { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); }
  .cs-check-row__rule {
    font-size: 10px;
    color: var(--color-navy-700);
    background: var(--color-navy-50);
    padding: 1px 6px;
    border-radius: 3px;
    font-family: var(--font-family-mono);
  }
  .cs-check-row__evidence { font-size: 10px; color: var(--color-gray-500); }
  .cs-check-row__actions { display: flex; justify-content: flex-end; }

  @media (max-width: 768px) {
    .cs-check-row {
      grid-template-columns: auto 1fr auto;
      grid-template-rows: auto auto;
    }
    .cs-check-row__status { grid-column: 1; grid-row: 1; }
    .cs-check-row__content { grid-column: 2; grid-row: 1; }
    .cs-check-row__meta { display: none; }
    .cs-check-row__actions { grid-column: 3; grid-row: 1; }
    .cs-summary-bar { grid-template-columns: repeat(2, 1fr); }
  }

  /* Rule trace */
  .cs-trace { display: flex; flex-direction: column; gap: 0; }
  .cs-trace__step {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }
  .cs-trace__step-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }
  .cs-trace__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .cs-trace__dot--pass { background: var(--color-success-600, #2e7d32); }
  .cs-trace__dot--fail { background: var(--color-error-600, #d32f2f); }
  .cs-trace__dot--pending { background: var(--color-warning-600, #f57c00); }
  .cs-trace__line {
    width: 2px;
    flex: 1;
    min-height: 20px;
    background: var(--color-gray-300);
    margin: 4px 0;
  }
  .cs-trace__step-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: var(--space-3);
  }
  .cs-trace__step-label {
    font-size: 11px;
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .cs-trace__step-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }
  .cs-trace__explanation {
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-gray-200);
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
  }
  .cs-trace__explanation p { margin: 0 0 var(--space-1); }

  /* Sidebar */
  .cs-sidebar {
    position: sticky;
    top: calc(var(--header-height) + var(--space-6));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Side summary */
  .cs-side-summary { display: flex; flex-direction: column; gap: var(--space-2); }
  .cs-side-summary__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    padding: var(--space-2) var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
  }
  .cs-side-summary__row--pass { background: var(--color-success-50, #e8f5e9); color: var(--color-success-700, #2e7d32); }
  .cs-side-summary__row--review { background: var(--color-warning-50, #fff3e0); color: var(--color-warning-700, #e65100); }
  .cs-side-summary__row--issue { background: var(--color-error-50, #ffebee); color: var(--color-error-700, #b71c1c); }

  /* Actions */
  .cs-actions { display: flex; flex-direction: column; gap: var(--space-2); }
  .cs-sidebar__note {
    font-size: 11px;
    color: var(--color-gray-600);
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
    padding: 0 var(--space-1);
  }
  .cs-sidebar__note p { margin: 0; display: flex; align-items: flex-start; gap: var(--space-1); }

  /* Loading */
  .cs-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-12) 0;
  }
  .cs-loading__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-gray-200);
    border-top-color: var(--color-navy-500);
    border-radius: 50%;
    animation: cs-spin 0.8s linear infinite;
  }
  .cs-loading__steps { display: flex; flex-direction: column; gap: var(--space-2); }
  .cs-loading__step {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    background: var(--color-gray-100);
    color: var(--color-gray-600);
  }
  .cs-loading__step--done { background: var(--color-success-50, #e8f5e9); color: var(--color-success-700, #2e7d32); }
  .cs-loading__step--active { background: var(--color-navy-50); color: var(--color-navy-700); font-weight: var(--font-weight-semibold); }
  .cs-loading__note { font-size: 12px; color: var(--color-gray-500); font-style: italic; }
  @keyframes cs-spin { to { transform: rotate(360deg); } }

  /* Error */
  .cs-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-4);
    padding: var(--space-6) 0;
  }
  .cs-error h3 { margin: 0; color: var(--color-navy-900); }
  .cs-error p { color: var(--color-gray-600); margin: 0; max-width: 400px; }
  .cs-error__actions { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }

  /* Empty */
  .cs-empty {
    text-align: center;
    padding: var(--space-6) 0;
    color: var(--color-gray-600);
    font-size: var(--font-size-sm);
  }

  /* Check detail modal */
  .cs-detail { display: flex; flex-direction: column; gap: var(--space-4); }
  .cs-detail__status {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-gray-50);
  }
  .cs-detail__status-reason { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: var(--space-1) 0 0; }
  .cs-detail__fields { display: flex; flex-direction: column; gap: var(--space-2); }
  .cs-detail__row {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: var(--space-3);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-gray-100);
  }
  .cs-detail__label {
    font-size: 11px;
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: var(--font-weight-bold);
    align-self: baseline;
  }
  .cs-detail__value {
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
  }
  .cs-detail__value--mono { font-family: var(--font-family-mono); }
  .cs-detail__confidence--high { color: var(--color-success-600, #2e7d32); }
  .cs-detail__confidence--medium { color: var(--color-warning-600, #f57c00); }
  .cs-detail__confidence--low { color: var(--color-error-600, #d32f2f); }
  .cs-detail__confidence-level { font-size: 11px; font-weight: normal; margin-left: var(--space-1); }
  .cs-detail__code {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    color: var(--color-navy-700);
    background: var(--color-navy-50);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
  }
  .cs-detail__why {
    background: var(--color-warning-50, #fff3e0);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-warning-600, #f57c00);
  }
  .cs-detail__why h4 { font-size: var(--font-size-sm); margin: 0 0 var(--space-2); color: var(--color-warning-700, #e65100); }
  .cs-detail__why p { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0 0 var(--space-2); }
  .cs-detail__why-action { font-size: var(--font-size-sm); }
  .cs-detail__trace-section h4 { font-size: var(--font-size-sm); margin: 0 0 var(--space-3); color: var(--color-navy-900); }
  .cs-detail__disclaimer {
    font-size: 11px;
    color: var(--color-gray-500);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-gray-200);
  }
`;
