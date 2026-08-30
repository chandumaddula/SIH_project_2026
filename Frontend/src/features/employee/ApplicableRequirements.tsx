import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useInspectionStore } from '../../store';
import {
  evaluateApplicability,
  ApplicabilityResult,
  Requirement,
} from '../../services/applicability.service';

/* ==========================================================================
   Helpers
   ========================================================================== */

const STATUS_CONFIG = {
  applicable: { label: 'Applicable', badge: 'success' as const, icon: '✓' },
  not_applicable: { label: 'Not Applicable', badge: 'neutral' as const, icon: '—' },
  review_required: { label: 'Review Required', badge: 'warning' as const, icon: '⚠' },
};

const getCurrentDate = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ==========================================================================
   Requirement Card
   ========================================================================== */

interface RequirementCardProps {
  requirement: Requirement;
  onViewRule: (r: Requirement) => void;
}

const RequirementCard: React.FC<RequirementCardProps> = ({ requirement, onViewRule }) => {
  const status = STATUS_CONFIG[requirement.applicabilityStatus];

  return (
    <div className={`ar-req-card ar-req-card--${requirement.applicabilityStatus}`}>
      <div className="ar-req-card__header">
        <div className="ar-req-card__title-row">
          <span className={`ar-req-icon ar-req-icon--${requirement.applicabilityStatus}`}>
            {status.icon}
          </span>
          <h4 className="ar-req-card__title">{requirement.name}</h4>
        </div>
        <Badge variant={status.badge} size="sm">{status.label}</Badge>
      </div>

      <div className="ar-req-card__body">
        <p className="ar-req-card__desc">{requirement.description}</p>
        <div className="ar-req-card__rule-ref">
          <span className="ar-req-card__rule-label">Rule Reference:</span>
          <code className="ar-req-card__rule-code">{requirement.ruleReference}</code>
        </div>
        {requirement.reviewFlag && requirement.reviewReason && (
          <p className="ar-req-card__review-note">
            ⚠ {requirement.reviewReason}
          </p>
        )}
      </div>

      <div className="ar-req-card__footer">
        <Button variant="ghost" size="sm" onClick={() => onViewRule(requirement)}>
          View Rule Details
        </Button>
      </div>
    </div>
  );
};

/* ==========================================================================
   Rule Detail Modal
   ========================================================================== */

interface RuleDetailModalProps {
  requirement: Requirement | null;
  onClose: () => void;
}

const RuleDetailModal: React.FC<RuleDetailModalProps> = ({ requirement, onClose }) => {
  if (!requirement) return null;
  const status = STATUS_CONFIG[requirement.applicabilityStatus];

  return (
    <Modal
      isOpen={!!requirement}
      onClose={onClose}
      title="Rule Details"
      size="md"
      footer={
        <Button variant="ghost" onClick={onClose}>Close</Button>
      }
    >
      <div className="ar-rule-detail">
        <div className="ar-rule-detail__row">
          <span className="ar-rule-detail__label">Requirement</span>
          <span className="ar-rule-detail__value">{requirement.name}</span>
        </div>
        <div className="ar-rule-detail__row">
          <span className="ar-rule-detail__label">Applicability Status</span>
          <Badge variant={status.badge} size="sm">{status.label}</Badge>
        </div>
        <div className="ar-rule-detail__row">
          <span className="ar-rule-detail__label">Reason Selected</span>
          <p className="ar-rule-detail__value ar-rule-detail__value--block">
            {requirement.applicabilityReason}
          </p>
        </div>
        <div className="ar-rule-detail__row">
          <span className="ar-rule-detail__label">Rule Reference</span>
          <code className="ar-rule-detail__code">{requirement.ruleReference}</code>
        </div>
        <div className="ar-rule-detail__row">
          <span className="ar-rule-detail__label">Conditions Considered</span>
          <ul className="ar-rule-detail__conditions">
            {requirement.conditionsConsidered.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        {requirement.reviewFlag && (
          <div className="ar-rule-detail__review">
            <h5>Review Note</h5>
            <p>{requirement.reviewReason}</p>
          </div>
        )}
        <p className="ar-rule-detail__disclaimer">
          <em>
            Rule references are demo configuration identifiers. Do not represent as actual legislation.
          </em>
        </p>
      </div>
    </Modal>
  );
};

/* ==========================================================================
   Main component
   ========================================================================== */

export const ApplicableRequirements: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, extractedInfo, setApplicabilityResult } = useInspectionStore();

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [result, setResult] = useState<ApplicabilityResult | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Evaluate applicability on mount
  useEffect(() => {
    if (!extractedInfo) {
      setPhase('error');
      setResult({
        success: false,
        errorMessage: 'No extracted product information is available. Please complete the image analysis and extraction steps first.',
        productCategory: '',
        packageType: '',
        conditions: [],
        requirements: [],
        exceptions: [],
        summary: { applicableCount: 0, notApplicableCount: 0, reviewRequiredCount: 0, conditionsEvaluatedCount: 0 },
        inspectionId: inspectionId || 'N/A',
      });
      return;
    }

    // Simulate brief evaluation delay
    const timer = setTimeout(() => {
      try {
        const evalResult = evaluateApplicability(extractedInfo);
        setResult(evalResult);
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Handlers ---- */

  const handleBack = () => {
    navigate('/employee/inspection/readability');
  };

  const handleReviewExtracted = () => {
    navigate('/employee/inspection/extracted');
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleContinue = () => {
    if (result) {
      setApplicabilityResult(result);
    }
    navigate('/employee/inspection/compliance');
  };

  /* ---- Render ---- */

  const currentDate = getCurrentDate();
  const ps = extractedInfo?.productSummary;

  // Loading state
  if (phase === 'loading') {
    return (
      <div className="page ar-page">
        <div className="ar-header">
          <div className="ar-header__left">
            <h1 className="page-title">Applicable Requirements</h1>
            <p className="page-subtitle">Evaluating which requirements apply to this package...</p>
          </div>
        </div>
        <div className="ar-loading">
          <div className="ar-loading__spinner" />
          <div className="ar-loading__steps">
            <div className="ar-loading__step ar-loading__step--done">
              <span>✓</span> Product classification
            </div>
            <div className="ar-loading__step ar-loading__step--active">
              <span>●</span> Evaluating conditions
            </div>
            <div className="ar-loading__step ar-loading__step--pending">
              <span>○</span> Selecting applicable requirements
            </div>
          </div>
          <p className="ar-loading__note">This is a demo evaluation — no real rules engine is running.</p>
        </div>
        <style>{arStyles}</style>
      </div>
    );
  }

  // Error state
  if (phase === 'error' || !result) {
    return (
      <div className="page ar-page">
        <div className="ar-header">
          <div className="ar-header__left">
            <h1 className="page-title">Applicable Requirements</h1>
            <p className="page-subtitle">Unable to evaluate applicable requirements.</p>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="ar-error">
              <h3>Evaluation Failed</h3>
              <p>{result?.errorMessage ?? 'An error occurred while evaluating requirements.'}</p>
              <div className="ar-error__actions">
                <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
                <Button variant="secondary" onClick={handleReviewExtracted}>Review Extracted Information</Button>
                <Button variant="ghost" onClick={handleBack}>← Back</Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <style>{arStyles}</style>
      </div>
    );
  }

  const { conditions, requirements, exceptions, summary } = result;
  const applicableReqs = requirements.filter(r => r.applicabilityStatus === 'applicable');
  const notApplicableReqs = requirements.filter(r => r.applicabilityStatus === 'not_applicable');
  const reviewReqs = requirements.filter(r => r.applicabilityStatus === 'review_required');

  return (
    <div className="page ar-page">
      {/* Header */}
      <div className="ar-header">
        <div className="ar-header__left">
          <h1 className="page-title">Applicable Requirements</h1>
          <p className="page-subtitle">
            Review the requirements selected for this package before compliance screening.
          </p>
        </div>
        <div className="ar-header__meta">
          <div className="ar-meta-item">
            <span className="ar-meta-label">Inspection ID</span>
            <span className="ar-meta-value ar-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="ar-meta-item">
            <span className="ar-meta-label">Officer</span>
            <span className="ar-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="ar-meta-item">
            <span className="ar-meta-label">Date</span>
            <span className="ar-meta-value">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Demo banner */}
      <div className="ar-demo-banner" role="status">
        <span className="ar-demo-banner__icon">ℹ️</span>
        <span>
          <strong>Demo / Mock Requirements</strong> — Requirements shown are configured demo data.
          Do not represent as actual legislation. Final determination is made by the officer.
        </span>
      </div>

      <div className="ar-body">
        <div className="ar-main">

          {/* Applicability flow visualization */}
          <Card className="ar-card">
            <CardHeader>
              <CardTitle>Applicability Evaluation</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="ar-flow">
                <div className="ar-flow__step ar-flow__step--done">
                  <span className="ar-flow__icon">✓</span>
                  <span>Product identified</span>
                </div>
                <div className="ar-flow__connector" />
                <div className="ar-flow__step ar-flow__step--done">
                  <span className="ar-flow__icon">✓</span>
                  <span>Package type identified</span>
                </div>
                <div className="ar-flow__connector" />
                <div className="ar-flow__step ar-flow__step--done">
                  <span className="ar-flow__icon">✓</span>
                  <span>Conditions evaluated</span>
                </div>
                <div className="ar-flow__connector" />
                <div className="ar-flow__step ar-flow__step--done">
                  <span className="ar-flow__icon">✓</span>
                  <span>Requirements selected</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Product Context */}
          <Card className="ar-card">
            <CardHeader>
              <CardTitle>Product Context</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReviewExtracted}>
                ← Review Extracted Information
              </Button>
            </CardHeader>
            <CardBody>
              <div className="ar-context-grid">
                <div className="ar-context-item">
                  <span className="ar-context-label">Product Name</span>
                  <span className="ar-context-value">{ps?.productName || 'Not available'}</span>
                </div>
                <div className="ar-context-item">
                  <span className="ar-context-label">Category</span>
                  <span className="ar-context-value">{ps?.productCategory || 'Not available'}</span>
                </div>
                <div className="ar-context-item">
                  <span className="ar-context-label">Package Type</span>
                  <span className="ar-context-value">{ps?.packageType || 'Not available'}</span>
                </div>
                <div className="ar-context-item">
                  <span className="ar-context-label">Manufacturer</span>
                  <span className="ar-context-value">{ps?.manufacturer || 'Not available'}</span>
                </div>
                <div className="ar-context-item">
                  <span className="ar-context-label">Net Quantity</span>
                  <span className="ar-context-value">
                    {extractedInfo?.fields.find(f => f.declarationType === 'net_quantity')?.currentValue || 'Not available'}
                  </span>
                </div>
                <div className="ar-context-item">
                  <span className="ar-context-label">MRP</span>
                  <span className="ar-context-value">
                    {extractedInfo?.fields.find(f => f.declarationType === 'mrp')?.currentValue || 'Not available'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Applicability Conditions */}
          <Card className="ar-card">
            <CardHeader>
              <CardTitle>Applicability Conditions</CardTitle>
              <span className="ar-card-count">{conditions.length} conditions</span>
            </CardHeader>
            <CardBody>
              <div className="ar-conditions">
                {conditions.map(cond => (
                  <div key={cond.id} className="ar-condition">
                    <span className="ar-condition__name">{cond.name}</span>
                    <span className="ar-condition__value">{cond.value}</span>
                  </div>
                ))}
              </div>
              <p className="ar-conditions-note">
                Conditions are derived from extracted product information and configured demo parameters.
              </p>
            </CardBody>
          </Card>

          {/* Applicable Requirements */}
          {applicableReqs.length > 0 && (
            <Card className="ar-card">
              <CardHeader>
                <CardTitle>Applicable Requirements</CardTitle>
                <Badge variant="success" size="sm">{applicableReqs.length}</Badge>
              </CardHeader>
              <CardBody>
                <div className="ar-req-list">
                  {applicableReqs.map(req => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      onViewRule={setSelectedRequirement}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Not Applicable */}
          {notApplicableReqs.length > 0 && (
            <Card className="ar-card">
              <CardHeader>
                <CardTitle>Not Applicable</CardTitle>
                <Badge variant="neutral" size="sm">{notApplicableReqs.length}</Badge>
              </CardHeader>
              <CardBody>
                <div className="ar-req-list">
                  {notApplicableReqs.map(req => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      onViewRule={setSelectedRequirement}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Review Required */}
          {reviewReqs.length > 0 && (
            <Card className="ar-card ar-card--review">
              <CardHeader>
                <CardTitle>Review Required</CardTitle>
                <Badge variant="warning" size="sm">{reviewReqs.length}</Badge>
              </CardHeader>
              <CardBody>
                <div className="ar-req-list">
                  {reviewReqs.map(req => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      onViewRule={setSelectedRequirement}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Exceptions / Exemptions */}
          {exceptions.length > 0 && (
            <Card className="ar-card">
              <CardHeader>
                <CardTitle>Exceptions / Exemptions Considered</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="ar-exceptions">
                  {exceptions.map(exc => (
                    <div key={exc.id} className={`ar-exception ar-exception--${exc.result}`}>
                      <div className="ar-exception__header">
                        <span className="ar-exception__name">{exc.name}</span>
                        <Badge
                          variant={exc.result === 'triggered' ? 'warning' : 'neutral'}
                          size="sm"
                        >
                          {exc.result === 'triggered' ? 'Triggered' : 'Not Applied'}
                        </Badge>
                      </div>
                      <p className="ar-exception__condition">Condition: {exc.condition}</p>
                      <p className="ar-exception__explanation">{exc.explanation}</p>
                    </div>
                  ))}
                </div>
                <p className="ar-exceptions-note">
                  Exception results are based on configured demo conditions. Do not represent as actual legal exemptions.
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sticky sidebar */}
        <div className="ar-sidebar">
          {/* Summary */}
          <Card className="ar-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="ar-summary-grid">
                <div className="ar-summary-item">
                  <span className="ar-summary-number">{summary.applicableCount}</span>
                  <span className="ar-summary-label">Applicable</span>
                </div>
                <div className="ar-summary-item ar-summary-item--muted">
                  <span className="ar-summary-number">{summary.notApplicableCount}</span>
                  <span className="ar-summary-label">Not Applicable</span>
                </div>
                <div className="ar-summary-item ar-summary-item--warn">
                  <span className="ar-summary-number">{summary.reviewRequiredCount}</span>
                  <span className="ar-summary-label">Review Required</span>
                </div>
                <div className="ar-summary-item ar-summary-item--info">
                  <span className="ar-summary-number">{summary.conditionsEvaluatedCount}</span>
                  <span className="ar-summary-label">Conditions Evaluated</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="ar-actions">
            {saveSuccess && (
              <div className="ar-alert ar-alert--success">✓ Draft saved</div>
            )}
            <Button variant="secondary" size="lg" fullWidth onClick={handleSaveDraft} loading={isSaving}>
              Save Draft
            </Button>
            <Button variant="primary" size="lg" fullWidth onClick={handleContinue}>
              Continue to Compliance Screening →
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleBack}>
              ← Back
            </Button>
          </div>

          <div className="ar-sidebar__note">
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              This step evaluates applicability only. Compliance is assessed in the next stage.
            </p>
          </div>
        </div>
      </div>

      {/* Rule Detail Modal */}
      <RuleDetailModal
        requirement={selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
      />

      <style>{arStyles}</style>
    </div>
  );
};

export default ApplicableRequirements;

/* ==========================================================================
   Styles
   ========================================================================== */

const arStyles = `
  .ar-page { max-width: 1200px; margin: 0 auto; }

  /* Header */
  .ar-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }
  .ar-header__left { flex: 1; }
  .ar-header__meta { display: flex; gap: var(--space-4); flex-wrap: wrap; }
  .ar-meta-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .ar-meta-label {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .ar-meta-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }
  .ar-meta-value--id {
    font-family: var(--font-family-mono);
    color: var(--color-navy-700);
    font-size: var(--font-size-xs);
  }

  /* Demo banner */
  .ar-demo-banner {
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
  .ar-demo-banner__icon { font-size: 1.2rem; flex-shrink: 0; }

  /* Body */
  .ar-body {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: var(--space-5);
    align-items: flex-start;
  }
  .ar-main { display: flex; flex-direction: column; gap: var(--space-4); }

  @media (max-width: 900px) {
    .ar-body { grid-template-columns: 1fr; }
    .ar-sidebar { position: static; order: -1; }
  }
  @media (max-width: 768px) {
    .ar-header { flex-direction: column; }
    .ar-header__meta { justify-content: flex-start; }
    .ar-meta-item { align-items: flex-start; }
  }

  /* Card */
  .ar-card { margin-bottom: 0; }
  .ar-card--review { border: 2px solid var(--color-warning-300, #fcd9a8); }
  .ar-card .card-body { padding: var(--space-4) var(--space-5); }
  .ar-card-count { font-size: var(--font-size-sm); color: var(--color-gray-600); }

  /* Flow visualization */
  .ar-flow {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    padding: var(--space-2) 0;
  }
  .ar-flow__step {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    background: var(--color-gray-100);
    color: var(--color-gray-600);
  }
  .ar-flow__step--done {
    background: var(--color-success-50, #e8f5e9);
    color: var(--color-success-700, #2e7d32);
  }
  .ar-flow__step--active {
    background: var(--color-navy-50);
    color: var(--color-navy-700);
  }
  .ar-flow__icon { font-weight: 700; }
  .ar-flow__connector {
    flex: 1;
    min-width: 16px;
    max-width: 32px;
    height: 2px;
    background: var(--color-gray-300);
    border-radius: 1px;
  }

  /* Product context */
  .ar-context-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }
  .ar-context-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-2) var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
  }
  .ar-context-label {
    font-size: 11px;
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .ar-context-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }

  @media (max-width: 640px) {
    .ar-context-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* Conditions */
  .ar-conditions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
  .ar-condition {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-navy-200);
  }
  .ar-condition__name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }
  .ar-condition__value {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    font-family: var(--font-family-mono);
  }
  .ar-conditions-note {
    font-size: 11px;
    color: var(--color-gray-500);
    margin: 0;
    font-style: italic;
  }

  /* Requirement cards */
  .ar-req-list { display: flex; flex-direction: column; gap: var(--space-3); }
  .ar-req-card {
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    background: var(--color-white);
    overflow: hidden;
  }
  .ar-req-card--not_applicable { opacity: 0.7; }
  .ar-req-card--review_required { border-color: var(--color-warning-400, #ffa726); }
  .ar-req-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-gray-50);
    border-bottom: 1px solid var(--color-gray-100);
  }
  .ar-req-card__title-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .ar-req-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ar-req-icon--applicable { background: var(--color-success-600, #2e7d32); color: white; }
  .ar-req-icon--not_applicable { background: var(--color-gray-400); color: white; }
  .ar-req-icon--review_required { background: var(--color-warning-600, #f57c00); color: white; }
  .ar-req-card__title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    margin: 0;
  }
  .ar-req-card__body { padding: var(--space-3) var(--space-4); }
  .ar-req-card__desc {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    margin: 0 0 var(--space-2);
  }
  .ar-req-card__rule-ref {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 11px;
    margin-bottom: var(--space-2);
  }
  .ar-req-card__rule-label { color: var(--color-gray-500); }
  .ar-req-card__rule-code {
    font-family: var(--font-family-mono);
    color: var(--color-navy-700);
    background: var(--color-navy-50);
    padding: 1px 6px;
    border-radius: 3px;
  }
  .ar-req-card__review-note {
    font-size: 11px;
    color: var(--color-warning-700, #e65100);
    background: var(--color-warning-50, #fff3e0);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    margin: 0;
    border-left: 2px solid var(--color-warning-600, #f57c00);
  }
  .ar-req-card__footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-2) var(--space-4);
    border-top: 1px solid var(--color-gray-100);
    background: var(--color-gray-50);
  }

  /* Exceptions */
  .ar-exceptions { display: flex; flex-direction: column; gap: var(--space-2); }
  .ar-exception {
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--color-gray-50);
    border-left: 3px solid var(--color-gray-300);
  }
  .ar-exception--triggered { background: var(--color-warning-50, #fff3e0); border-left-color: var(--color-warning-600, #f57c00); }
  .ar-exception__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-1);
  }
  .ar-exception__name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
  }
  .ar-exception__condition {
    font-size: 11px;
    color: var(--color-gray-600);
    margin: 0 0 var(--space-1);
  }
  .ar-exception__explanation {
    font-size: 12px;
    color: var(--color-gray-700);
    margin: 0;
  }
  .ar-exceptions-note {
    font-size: 11px;
    color: var(--color-gray-500);
    margin: var(--space-3) 0 0;
    font-style: italic;
  }

  /* Sidebar */
  .ar-sidebar {
    position: sticky;
    top: calc(var(--header-height) + var(--space-6));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Summary */
  .ar-summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }
  .ar-summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3);
    background: var(--color-navy-50);
    border-radius: var(--radius-md);
    text-align: center;
  }
  .ar-summary-item--muted { background: var(--color-gray-100); }
  .ar-summary-item--warn { background: var(--color-warning-50, #fff3e0); }
  .ar-summary-item--info { background: var(--color-gray-50); }
  .ar-summary-number {
    font-size: 1.8rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    line-height: 1;
  }
  .ar-summary-item--warn .ar-summary-number { color: var(--color-warning-600, #f57c00); }
  .ar-summary-label {
    font-size: 10px;
    color: var(--color-gray-700);
    margin-top: var(--space-1);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Actions */
  .ar-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .ar-alert {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .ar-alert--success {
    background: var(--color-success-100);
    border: 1px solid var(--color-success-600);
    color: var(--color-success-600);
  }
  .ar-sidebar__note {
    font-size: 11px;
    color: var(--color-gray-600);
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
    padding: 0 var(--space-1);
  }
  .ar-sidebar__note p { margin: 0; display: flex; align-items: flex-start; gap: var(--space-1); }

  /* Loading */
  .ar-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-12) 0;
  }
  .ar-loading__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-gray-200);
    border-top-color: var(--color-navy-500);
    border-radius: 50%;
    animation: ar-spin 0.8s linear infinite;
  }
  .ar-loading__steps {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .ar-loading__step {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-4);
    border-radius: 20px;
    background: var(--color-gray-100);
    color: var(--color-gray-600);
  }
  .ar-loading__step--done { background: var(--color-success-50, #e8f5e9); color: var(--color-success-700, #2e7d32); }
  .ar-loading__step--active { background: var(--color-navy-50); color: var(--color-navy-700); font-weight: var(--font-weight-semibold); }
  .ar-loading__note { font-size: 12px; color: var(--color-gray-500); font-style: italic; }
  @keyframes ar-spin { to { transform: rotate(360deg); } }

  /* Error */
  .ar-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-4);
    padding: var(--space-6) 0;
  }
  .ar-error h3 { margin: 0; color: var(--color-navy-900); }
  .ar-error p { color: var(--color-gray-600); margin: 0; max-width: 400px; }
  .ar-error__actions { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }

  /* Rule detail modal */
  .ar-rule-detail { display: flex; flex-direction: column; gap: var(--space-4); }
  .ar-rule-detail__row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .ar-rule-detail__label {
    font-size: 11px;
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-weight: var(--font-weight-bold);
  }
  .ar-rule-detail__value {
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    font-weight: var(--font-weight-semibold);
  }
  .ar-rule-detail__value--block {
    font-weight: normal;
    color: var(--color-gray-700);
    line-height: 1.5;
    margin: 0;
  }
  .ar-rule-detail__code {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    color: var(--color-navy-700);
    background: var(--color-navy-50);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
  }
  .ar-rule-detail__conditions {
    margin: 0;
    padding-left: var(--space-5);
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
  }
  .ar-rule-detail__conditions li + li { margin-top: var(--space-1); }
  .ar-rule-detail__review {
    background: var(--color-warning-50, #fff3e0);
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-warning-600, #f57c00);
  }
  .ar-rule-detail__review h5 { font-size: var(--font-size-sm); margin: 0 0 var(--space-1); color: var(--color-warning-700, #e65100); }
  .ar-rule-detail__review p { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0; }
  .ar-rule-detail__disclaimer {
    font-size: 11px;
    color: var(--color-gray-500);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-gray-200);
  }
`;
