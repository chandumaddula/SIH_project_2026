/* ==========================================================================
   Officer Verification Page
   Task J — Officer Verification

   Officers explicitly confirm, reject, or request review of AI-suggested
   findings. The system never makes final legal decisions.

   Human-in-the-loop:
   - AI / Automated Screening → Evidence → Officer Review → Officer Decision

   Demo: No real legal determination; AI findings are advisory only.
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useInspectionStore } from '../../store';
import {
  VerificationFinding,
  VerificationResult,
  VerificationDecision,
  OfficerDecision,
  VERIFICATION_STATUS_CONFIG,
  getVerificationResult,
  confirmFinding,
  rejectFinding,
  requestReview,
  getVerificationHistory,
} from '../../services/verification.service';

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

const AI_STATUS_CONFIG: Record<'pass' | 'review_required' | 'potential_issue', {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  pass: { label: 'PASS', color: '#2e7d32', bgColor: '#e8f5e9', icon: '🟢' },
  review_required: { label: 'REVIEW REQUIRED', color: '#f57c00', bgColor: '#fff3e0', icon: '🟡' },
  potential_issue: { label: 'POTENTIAL ISSUE', color: '#d32f2f', bgColor: '#ffebee', icon: '🔴' },
};

const DECISION_CONFIG: Record<VerificationDecision, {
  label: string;
  badge: 'success' | 'warning' | 'neutral' | 'error';
  color: string;
}> = {
  confirmed: { label: 'Officer Verified', badge: 'success', color: '#2e7d32' },
  rejected: { label: 'Rejected by Officer', badge: 'neutral', color: '#757575' },
  review_requested: { label: 'Review Requested', badge: 'warning', color: '#f57c00' },
};

/* ==========================================================================
   Finding Card
   ========================================================================== */

interface FindingCardProps {
  finding: VerificationFinding;
  onConfirm: (f: VerificationFinding) => void;
  onReject: (f: VerificationFinding) => void;
  onRequestReview: (f: VerificationFinding) => void;
}

const FindingCard: React.FC<FindingCardProps> = ({ finding, onConfirm, onReject, onRequestReview }) => {
  const aiCfg = AI_STATUS_CONFIG[finding.aiStatus];
  const decision = finding.officerDecision;
  const decCfg = decision ? DECISION_CONFIG[decision.decision] : null;

  return (
    <div className={`ov-finding ${decision ? `ov-finding--${decision.decision}` : ''}`}>
      <div className="ov-finding__header">
        <div className="ov-finding__ai-result" style={{ backgroundColor: aiCfg.bgColor }}>
          <span className="ov-finding__ai-icon">{aiCfg.icon}</span>
          <div>
            <span className="ov-finding__ai-label" style={{ color: aiCfg.color }}>
              {aiCfg.label}
            </span>
            <span className="ov-finding__type">
              {finding.type === 'compliance_check' ? 'Compliance Check' : finding.type === 'measurement' ? 'Measurement' : 'Observation'}
            </span>
          </div>
        </div>
        {decCfg && (
          <Badge variant={decCfg.badge} size="md">{decCfg.label}</Badge>
        )}
      </div>

      <div className="ov-finding__body">
        <h3 className="ov-finding__label">{finding.label}</h3>

        <div className="ov-finding__meta">
          <div className="ov-finding__meta-row">
            <span className="ov-finding__meta-label">Requirement</span>
            <code className="ov-finding__meta-code">{finding.applicableRequirement}</code>
          </div>
          <div className="ov-finding__meta-row">
            <span className="ov-finding__meta-label">Evidence</span>
            <span className="ov-finding__meta-value">
              {finding.evidenceCount > 0 ? `${finding.evidenceCount} item(s)` : 'No evidence linked'}
            </span>
          </div>
          {finding.confidence > 0 && (
            <div className="ov-finding__meta-row">
              <span className="ov-finding__meta-label">AI Confidence</span>
              <span className="ov-finding__meta-value">{finding.confidence}%</span>
            </div>
          )}
        </div>

        <div className="ov-finding__explanation">
          <span className="ov-finding__explanation-label">AI Explanation</span>
          <p>{finding.explanation}</p>
        </div>

        {decision && (
          <div className="ov-finding__decision-detail">
            <div className="ov-finding__decision-header">
              <strong>Officer Decision</strong>
              <span className="ov-finding__decision-time">{formatTimestamp(decision.timestamp)}</span>
            </div>
            <div className="ov-finding__decision-meta">
              <span>{decision.officerName}</span>
            </div>
            {decision.reason && (
              <p className="ov-finding__decision-reason">
                <em>"{decision.reason}"</em>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="ov-finding__actions">
        <Button variant="success" size="sm" onClick={() => onConfirm(finding)} disabled={!!decision}>
          ✓ Confirm Finding
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onReject(finding)} disabled={!!decision}>
          ✕ Reject Finding
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRequestReview(finding)} disabled={!!decision}>
          ↩ Request Review
        </Button>
      </div>
    </div>
  );
};

/* ==========================================================================
   Confirm Modal
   ========================================================================== */

interface ConfirmModalProps {
  finding: VerificationFinding | null;
  onClose: () => void;
  onConfirm: () => void;
  officerName: string;
}

const ConfirmFindingModal: React.FC<ConfirmModalProps> = ({ finding, onClose, onConfirm, officerName }) => {
  if (!finding) return null;
  const aiCfg = AI_STATUS_CONFIG[finding.aiStatus];
  return (
    <Modal
      isOpen={!!finding}
      onClose={onClose}
      title="Confirm Finding"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="success" onClick={onConfirm}>Confirm Finding</Button>
        </>
      }
    >
      <div className="ov-confirm">
        <p className="ov-confirm__message">
          <strong>Confirm this finding as an officer-verified finding?</strong>
        </p>
        <div className="ov-confirm__details">
          <div className="ov-confirm__row">
            <span>Finding</span>
            <strong>{finding.label}</strong>
          </div>
          <div className="ov-confirm__row">
            <span>AI Result</span>
            <strong style={{ color: aiCfg.color }}>{aiCfg.label}</strong>
          </div>
          <div className="ov-confirm__row">
            <span>Requirement</span>
            <code>{finding.applicableRequirement}</code>
          </div>
          <div className="ov-confirm__row">
            <span>Evidence</span>
            <strong>{finding.evidenceCount} item(s)</strong>
          </div>
          <div className="ov-confirm__row">
            <span>Officer</span>
            <strong>{officerName}</strong>
          </div>
        </div>
        <p className="ov-confirm__disclaimer">
          <em>You are confirming this as an officer-verified finding. This does not represent a final legal determination.</em>
        </p>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Reject Modal
   ========================================================================== */

interface RejectModalProps {
  finding: VerificationFinding | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectFindingModal: React.FC<RejectModalProps> = ({ finding, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  if (!finding) return null;
  const isValid = reason.trim().length > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={!!finding}
      onClose={handleClose}
      title="Reject Finding"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="error" onClick={handleConfirm} disabled={!isValid}>Reject Finding</Button>
        </>
      }
    >
      <div className="ov-reject">
        <p className="ov-reject__message">
          <strong>Reject this finding?</strong>
        </p>
        <div className="ov-reject__finding">
          <span className="ov-reject__finding-label">Finding</span>
          <span className="ov-reject__finding-name">{finding.label}</span>
        </div>
        <div className="ov-reject__field">
          <label className="ov-reject__label">Reason for rejecting this finding</label>
          <textarea
            className="ov-reject__textarea"
            placeholder="Reason for rejecting this finding..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
          />
          <span className="ov-reject__hint">A reason is required.</span>
        </div>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Request Review Modal
   ========================================================================== */

interface RequestReviewModalProps {
  finding: VerificationFinding | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RequestReviewModal: React.FC<RequestReviewModalProps> = ({ finding, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  if (!finding) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || 'Additional physical verification required.');
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={!!finding}
      onClose={handleClose}
      title="Request Review"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="accent" onClick={handleConfirm}>Request Review</Button>
        </>
      }
    >
      <div className="ov-request">
        <p className="ov-request__message">
          <strong>Request additional review for this finding?</strong>
        </p>
        <div className="ov-request__finding">
          <span className="ov-request__finding-label">Finding</span>
          <span className="ov-request__finding-name">{finding.label}</span>
        </div>
        <div className="ov-request__field">
          <label className="ov-request__label">Reason / Observation</label>
          <textarea
            className="ov-request__textarea"
            placeholder="e.g., Additional physical verification required."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
          />
          <span className="ov-request__hint">Optional but recommended.</span>
        </div>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Main Component
   ========================================================================== */

export const OfficerVerification: React.FC = () => {
  const navigate = useNavigate();
  const {
    inspectionId,
    officerName,
    office,
    complianceResult,
    measurements,
  } = useInspectionStore();

  /* ---- State ---- */

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [history, setHistory] = useState<OfficerDecision[]>([]);

  /* Modals */
  const [confirmTarget, setConfirmTarget] = useState<VerificationFinding | null>(null);
  const [rejectTarget, setRejectTarget] = useState<VerificationFinding | null>(null);
  const [reviewTarget, setReviewTarget] = useState<VerificationFinding | null>(null);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);

  /* ---- Load verification on mount ---- */

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const id = inspectionId || 'N/A';
        const result = getVerificationResult(id, complianceResult, measurements, {});
        setVerification(result);
        setHistory(getVerificationHistory(id));
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Refresh helper ---- */

  const refresh = useCallback(() => {
    const id = inspectionId || 'N/A';
    const result = getVerificationResult(id, complianceResult, measurements, {});
    setVerification(result);
    setHistory(getVerificationHistory(id));
  }, [inspectionId, complianceResult, measurements]);

  /* ---- Handlers ---- */

  const handleConfirm = () => {
    if (!confirmTarget) return;
    setSavingMessage('Saving officer decision...');
    setTimeout(() => {
      confirmFinding(
        inspectionId || 'N/A',
        confirmTarget.findingId,
        confirmTarget.label,
        confirmTarget.type,
        confirmTarget.aiResult,
        confirmTarget.aiStatus,
        officerName || 'Officer'
      );
      refresh();
      setConfirmTarget(null);
      setSavingMessage(null);
    }, 400);
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    setSavingMessage('Saving officer decision...');
    setTimeout(() => {
      rejectFinding(
        inspectionId || 'N/A',
        rejectTarget.findingId,
        rejectTarget.label,
        rejectTarget.type,
        rejectTarget.aiResult,
        rejectTarget.aiStatus,
        reason,
        officerName || 'Officer'
      );
      refresh();
      setRejectTarget(null);
      setSavingMessage(null);
    }, 400);
  };

  const handleRequestReview = (reason: string) => {
    if (!reviewTarget) return;
    setSavingMessage('Saving officer decision...');
    setTimeout(() => {
      requestReview(
        inspectionId || 'N/A',
        reviewTarget.findingId,
        reviewTarget.label,
        reviewTarget.type,
        reviewTarget.aiResult,
        reviewTarget.aiStatus,
        reason,
        officerName || 'Officer'
      );
      refresh();
      setReviewTarget(null);
      setSavingMessage(null);
    }, 400);
  };

  /* ---- Navigation ---- */

  const handleBackToCompliance = () => navigate('/employee/inspection/compliance');
  const handleBackToEvidence = () => navigate('/employee/inspection/evidence');
  const handleSaveDraft = () => navigate('/employee/inspection/evidence');
  const handleContinue = () => navigate('/employee/inspection/final');

  /* ---- Render ---- */

  const currentDate = getCurrentDate();
  const productName = complianceResult?.summary ? 'Inspection' : 'Inspection';

  if (phase === 'loading') {
    return (
      <div className="page ov-page">
        <div className="ov-header">
          <h1 className="page-title">Officer Verification</h1>
          <p className="page-subtitle">Loading verification findings...</p>
        </div>
        <div className="ov-loading">
          <div className="ov-loading__spinner" />
          <p>Loading verification history...</p>
        </div>
        <style>{ovStyles}</style>
      </div>
    );
  }

  if (phase === 'error' || !verification) {
    return (
      <div className="page ov-page">
        <div className="ov-header">
          <h1 className="page-title">Officer Verification</h1>
          <p className="page-subtitle">Unable to load verification.</p>
        </div>
        <Card>
          <CardBody>
            <div className="ov-error">
              <p>Unable to load verification data. Please try again.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
        <style>{ovStyles}</style>
      </div>
    );
  }

  const overallCfg = VERIFICATION_STATUS_CONFIG[verification.overallStatus];

  return (
    <div className="page ov-page">
      {/* Header */}
      <div className="ov-header">
        <div className="ov-header__left">
          <h1 className="page-title">Officer Verification Required</h1>
          <p className="page-subtitle">
            AI-assisted screening is advisory and does not replace authorized officer verification.
          </p>
        </div>
        <div className="ov-header__meta">
          <div className="ov-meta-item">
            <span className="ov-meta-label">Inspection ID</span>
            <span className="ov-meta-value ov-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="ov-meta-item">
            <span className="ov-meta-label">Product</span>
            <span className="ov-meta-value">{productName}</span>
          </div>
          <div className="ov-meta-item">
            <span className="ov-meta-label">Officer</span>
            <span className="ov-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="ov-meta-item">
            <span className="ov-meta-label">Office</span>
            <span className="ov-meta-value">{office || 'Regional Metrology Office'}</span>
          </div>
          <div className="ov-meta-item">
            <span className="ov-meta-label">Date / Time</span>
            <span className="ov-meta-value">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Important notice */}
      <div className="ov-notice">
        <span>⚠️</span>
        <div>
          <strong>Important:</strong> AI-assisted compliance screening does not replace authorized
          officer verification. AI findings are advisory only. Final verification requires officer action.
        </div>
      </div>

      {/* Human-in-the-loop diagram */}
      <Card className="ov-hitl">
        <CardBody>
          <div className="ov-hitl__title">Human-in-the-Loop Workflow</div>
          <div className="ov-hitl__flow">
            <span className="ov-hitl__step ov-hitl__step--ai">AI / Automated Screening</span>
            <span className="ov-hitl__arrow">↓</span>
            <span className="ov-hitl__step ov-hitl__step--evidence">Evidence</span>
            <span className="ov-hitl__arrow">↓</span>
            <span className="ov-hitl__step ov-hitl__step--review">Officer Review</span>
            <span className="ov-hitl__arrow">↓</span>
            <span className="ov-hitl__step ov-hitl__step--decision">Officer Decision</span>
            <span className="ov-hitl__arrow">↓</span>
            <span className="ov-hitl__step ov-hitl__step--verified">Verified Finding</span>
          </div>
        </CardBody>
      </Card>

      <div className="ov-body">
        <div className="ov-main">
          {/* Overall status */}
          <Card className="ov-card ov-card--status">
            <CardBody>
              <div className="ov-status">
                <div className="ov-status__icon" style={{ color: overallCfg.color, backgroundColor: overallCfg.bgColor }}>
                  {overallCfg.icon}
                </div>
                <div className="ov-status__text">
                  <h2 className="ov-status__label" style={{ color: overallCfg.color }}>
                    {overallCfg.label}
                  </h2>
                  <div className="ov-status__counts">
                    <span><strong>{verification.confirmedCount}</strong> Verified</span>
                    <span><strong>{verification.rejectedCount}</strong> Rejected</span>
                    <span><strong>{verification.reviewRequestedCount}</strong> Review Requested</span>
                    <span><strong>{verification.pendingCount}</strong> Pending</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Findings */}
          <div className="ov-section-title">
            <h2>AI Findings for Verification</h2>
            <span className="ov-section-count">{verification.findings.length} finding(s)</span>
          </div>

          {verification.findings.length === 0 ? (
            <Card>
              <CardBody>
                <div className="ov-empty">
                  <span className="ov-empty__icon">✓</span>
                  <p>No findings require officer verification.</p>
                  <p className="ov-empty__sub">
                    This does not represent automatic legal clearance. Officer verification is still required
                    to confirm inspection completeness.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="ov-finding-list">
              {verification.findings.map(finding => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onConfirm={setConfirmTarget}
                  onReject={setRejectTarget}
                  onRequestReview={setReviewTarget}
                />
              ))}
            </div>
          )}

          {/* Verification history */}
          {history.length > 0 && (
            <>
              <div className="ov-section-title">
                <h2>Verification History</h2>
                <span className="ov-section-count">{history.length} decision(s)</span>
              </div>
              <Card>
                <CardBody>
                  <div className="ov-history-table">
                    <div className="ov-history-row ov-history-row--header">
                      <span>Finding</span>
                      <span>AI Result</span>
                      <span>Officer Decision</span>
                      <span>Officer</span>
                      <span>Date/Time</span>
                    </div>
                    {history.map(h => {
                      const decCfg = DECISION_CONFIG[h.decision];
                      return (
                        <div key={h.id} className="ov-history-row">
                          <span className="ov-history-row__finding">
                            <strong>{h.findingLabel}</strong>
                            {h.reason && <em>"{h.reason}"</em>}
                          </span>
                          <span>{h.aiResult}</span>
                          <Badge variant={decCfg.badge} size="sm">{decCfg.label}</Badge>
                          <span>{h.officerName}</span>
                          <span className="ov-history-row__time">{formatTimestamp(h.timestamp)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="ov-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="ov-status-card">
                <div className="ov-status-card__icon" style={{ color: overallCfg.color, backgroundColor: overallCfg.bgColor }}>
                  {overallCfg.icon}
                </div>
                <div className="ov-status-card__label" style={{ color: overallCfg.color }}>
                  {overallCfg.label}
                </div>
              </div>
              <div className="ov-status-card__note">
                <em>Officer verification must remain distinct from automated screening.</em>
              </div>
            </CardBody>
          </Card>

          <div className="ov-actions">
            <Button variant="ghost" size="sm" fullWidth onClick={handleBackToEvidence}>
              ← Back to Evidence
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleBackToCompliance}>
              ← Back to Compliance
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="primary" size="sm" fullWidth onClick={handleContinue}>
              Continue to Final Inspection →
            </Button>
          </div>

          <div className="ov-disclaimer">
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              This system never makes a final legal decision. Officer verification is required.
            </p>
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {savingMessage && (
        <div className="ov-saving">
          <div className="ov-saving__spinner" />
          <span>{savingMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ConfirmFindingModal
        finding={confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirm}
        officerName={officerName || 'Officer'}
      />
      <RejectFindingModal
        finding={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
      <RequestReviewModal
        finding={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onConfirm={handleRequestReview}
      />

      <style>{ovStyles}</style>
    </div>
  );
};

export default OfficerVerification;

/* ==========================================================================
   Styles
   ========================================================================== */

const ovStyles = `
  .ov-page { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .ov-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }
  .ov-header__left { flex: 1; }
  .ov-header__meta { display: flex; gap: var(--space-4); flex-wrap: wrap; }
  .ov-meta-item { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .ov-meta-label { font-size: var(--font-size-xs); color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.4px; }
  .ov-meta-value { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ov-meta-value--id { font-family: var(--font-family-mono); color: var(--color-navy-700); font-size: var(--font-size-xs); }

  /* Notice */
  .ov-notice {
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

  /* HITL */
  .ov-hitl { margin-bottom: var(--space-4); background: var(--color-navy-50); border: 1px solid var(--color-navy-200); }
  .ov-hitl__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-3); }
  .ov-hitl__flow { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
  .ov-hitl__step {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    background: var(--color-white);
    border: 1px solid var(--color-gray-300);
    color: var(--color-navy-900);
  }
  .ov-hitl__step--ai { background: #ede7f6; border-color: #b39ddb; color: #4527a0; }
  .ov-hitl__step--evidence { background: #e3f2fd; border-color: #90caf9; color: #1565c0; }
  .ov-hitl__step--review { background: var(--color-warning-100, #fff3e0); border-color: var(--color-warning-600, #f57c00); color: var(--color-warning-700, #e65100); }
  .ov-hitl__step--decision { background: #fce4ec; border-color: #f48fb1; color: #ad1457; }
  .ov-hitl__step--verified { background: var(--color-success-100); border-color: var(--color-success-600, #2e7d32); color: var(--color-success-600, #2e7d32); }
  .ov-hitl__arrow { font-size: 1.2rem; color: var(--color-gray-500); }

  /* Body */
  .ov-body { display: grid; grid-template-columns: 1fr 280px; gap: var(--space-5); align-items: flex-start; }
  .ov-main { display: flex; flex-direction: column; gap: var(--space-4); }
  @media (max-width: 900px) { .ov-body { grid-template-columns: 1fr; } }
  @media (max-width: 768px) {
    .ov-header { flex-direction: column; }
    .ov-header__meta { justify-content: flex-start; }
    .ov-meta-item { align-items: flex-start; }
  }

  /* Status card */
  .ov-card--status { background: linear-gradient(135deg, var(--color-navy-50), var(--color-white)); border: 2px solid var(--color-navy-200); }
  .ov-status { display: flex; align-items: center; gap: var(--space-4); }
  .ov-status__icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ov-status__text { flex: 1; }
  .ov-status__label { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); margin: 0 0 var(--space-2); letter-spacing: 1px; }
  .ov-status__counts { display: flex; gap: var(--space-3); flex-wrap: wrap; font-size: var(--font-size-sm); color: var(--color-gray-700); }
  .ov-status__counts strong { color: var(--color-navy-900); margin-right: 2px; }

  /* Section title */
  .ov-section-title { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-4); }
  .ov-section-title h2 { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-navy-900); margin: 0; }
  .ov-section-count { font-size: var(--font-size-xs); color: var(--color-gray-500); }

  /* Finding list */
  .ov-finding-list { display: flex; flex-direction: column; gap: var(--space-3); }
  .ov-finding {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }
  .ov-finding--confirmed { border-left: 4px solid var(--color-success-600, #2e7d32); }
  .ov-finding--rejected { border-left: 4px solid var(--color-gray-400); opacity: 0.85; }
  .ov-finding--review_requested { border-left: 4px solid var(--color-warning-600, #f57c00); }
  .ov-finding__header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2); flex-wrap: wrap; }
  .ov-finding__ai-result { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); }
  .ov-finding__ai-icon { font-size: 1.4rem; }
  .ov-finding__ai-label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); }
  .ov-finding__type { display: block; font-size: 10px; color: var(--color-gray-600); text-transform: uppercase; }
  .ov-finding__body { display: flex; flex-direction: column; gap: var(--space-2); }
  .ov-finding__label { font-size: var(--font-size-base); font-weight: var(--font-weight-bold); color: var(--color-navy-900); margin: 0; }
  .ov-finding__meta { display: flex; flex-direction: column; gap: var(--space-1); padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-sm); }
  .ov-finding__meta-row { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-2); font-size: var(--font-size-sm); }
  .ov-finding__meta-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; }
  .ov-finding__meta-value { color: var(--color-navy-900); }
  .ov-finding__meta-code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-white); padding: 2px 6px; border-radius: 3px; }
  .ov-finding__explanation { padding: var(--space-2) var(--space-3); background: var(--color-navy-50); border-radius: var(--radius-sm); }
  .ov-finding__explanation-label { display: block; font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
  .ov-finding__explanation p { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0; }

  .ov-finding__decision-detail { padding: var(--space-2) var(--space-3); background: var(--color-success-50, #e8f5e9); border-radius: var(--radius-sm); border-left: 3px solid var(--color-success-600, #2e7d32); }
  .ov-finding--rejected .ov-finding__decision-detail { background: var(--color-gray-100); border-left-color: var(--color-gray-400); }
  .ov-finding--review_requested .ov-finding__decision-detail { background: var(--color-warning-50, #fff3e0); border-left-color: var(--color-warning-600, #f57c00); }
  .ov-finding__decision-header { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .ov-finding__decision-time { font-size: 11px; color: var(--color-gray-500); }
  .ov-finding__decision-meta { font-size: 11px; color: var(--color-gray-600); margin-top: 2px; }
  .ov-finding__decision-reason { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: var(--space-1) 0 0; }

  .ov-finding__actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  @media (max-width: 600px) { .ov-finding__actions { flex-direction: column; } }

  /* Sidebar */
  .ov-sidebar { position: sticky; top: calc(var(--header-height) + var(--space-6)); display: flex; flex-direction: column; gap: var(--space-3); }
  .ov-status-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-3); }
  .ov-status-card__icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
  .ov-status-card__label { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); letter-spacing: 0.5px; text-align: center; }
  .ov-status-card__note { font-size: 11px; color: var(--color-gray-600); text-align: center; padding: var(--space-2) 0; border-top: 1px solid var(--color-gray-200); margin-top: var(--space-2); }

  /* Actions */
  .ov-actions { display: flex; flex-direction: column; gap: var(--space-2); }

  /* Disclaimer */
  .ov-disclaimer { font-size: 11px; color: var(--color-gray-600); display: flex; align-items: flex-start; gap: var(--space-1); padding: 0 var(--space-1); }
  .ov-disclaimer p { margin: 0; display: flex; align-items: flex-start; gap: var(--space-1); }

  /* History */
  .ov-history-table { display: flex; flex-direction: column; gap: 0; }
  .ov-history-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 0.8fr 1fr;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-gray-200);
    font-size: var(--font-size-sm);
    align-items: center;
  }
  .ov-history-row--header { font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); background: var(--color-gray-50); border-radius: var(--radius-sm); }
  .ov-history-row__finding { display: flex; flex-direction: column; gap: 2px; }
  .ov-history-row__finding em { font-size: 11px; color: var(--color-gray-500); }
  .ov-history-row__time { font-size: 11px; color: var(--color-gray-600); font-family: var(--font-family-mono); }

  @media (max-width: 768px) {
    .ov-history-row { grid-template-columns: 1fr 1fr; gap: var(--space-1); font-size: 12px; }
    .ov-history-row--header { display: none; }
  }

  /* Saving */
  .ov-saving {
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-navy-900);
    color: white;
    border-radius: var(--radius-md);
    z-index: var(--z-modal);
    font-size: var(--font-size-sm);
    box-shadow: var(--shadow-lg);
  }
  .ov-saving__spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: ov-spin 0.8s linear infinite; }

  /* Empty */
  .ov-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .ov-empty__icon { font-size: 3rem; color: var(--color-success-600, #2e7d32); }
  .ov-empty p { margin: 0; font-size: var(--font-size-sm); }
  .ov-empty__sub { font-size: 11px; color: var(--color-gray-500); max-width: 400px; }

  /* Loading */
  .ov-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .ov-loading__spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: ov-spin 0.8s linear infinite; }
  @keyframes ov-spin { to { transform: rotate(360deg); } }

  /* Error */
  .ov-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .ov-error p { color: var(--color-gray-600); margin: 0; }

  /* Confirm modal */
  .ov-confirm { display: flex; flex-direction: column; gap: var(--space-3); }
  .ov-confirm__message { font-size: var(--font-size-base); color: var(--color-navy-900); margin: 0; }
  .ov-confirm__details { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); }
  .ov-confirm__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
  .ov-confirm__row code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); background: var(--color-white); padding: 2px 6px; border-radius: 3px; }
  .ov-confirm__disclaimer { font-size: 11px; color: var(--color-warning-700, #e65100); padding: var(--space-2) var(--space-3); background: var(--color-warning-100); border-radius: var(--radius-md); margin: 0; }

  /* Reject modal */
  .ov-reject { display: flex; flex-direction: column; gap: var(--space-4); }
  .ov-reject__message { font-size: var(--font-size-base); color: var(--color-navy-900); margin: 0; }
  .ov-reject__finding { padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-sm); }
  .ov-reject__finding-label { display: block; font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; }
  .ov-reject__finding-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ov-reject__field { display: flex; flex-direction: column; gap: var(--space-1); }
  .ov-reject__label { font-size: 11px; font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; letter-spacing: 0.4px; }
  .ov-reject__textarea {
    padding: var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    resize: vertical;
    background: var(--color-white);
  }
  .ov-reject__textarea:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .ov-reject__hint { font-size: 11px; color: var(--color-error-600, #d32f2f); }

  /* Request modal */
  .ov-request { display: flex; flex-direction: column; gap: var(--space-4); }
  .ov-request__message { font-size: var(--font-size-base); color: var(--color-navy-900); margin: 0; }
  .ov-request__finding { padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-sm); }
  .ov-request__finding-label { display: block; font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; }
  .ov-request__finding-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ov-request__field { display: flex; flex-direction: column; gap: var(--space-1); }
  .ov-request__label { font-size: 11px; font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; letter-spacing: 0.4px; }
  .ov-request__textarea { padding: var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); resize: vertical; background: var(--color-white); }
  .ov-request__textarea:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .ov-request__hint { font-size: 11px; color: var(--color-gray-500); }
`;
