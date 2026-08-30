/* ==========================================================================
   Inspection Details Page
   Task K — Inspection details view

   Shows full inspection record, workflow summary, compliance summary,
   evidence summary, verification status, and actions.

   Reuses existing services (compliance, evidence, verification) where
   appropriate.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  InspectionRecord,
  getInspectionById,
  COMPLIANCE_STATUS_CONFIG,
  VERIFICATION_STATUS_CONFIG,
  INSPECTION_STATUS_CONFIG,
} from '../../services/inspection.service';

interface WorkflowStage {
  key: string;
  label: string;
  status: 'completed' | 'pending' | 'review_required';
  href?: string;
}

export const InspectionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [inspection, setInspection] = useState<InspectionRecord | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!inspectionId) {
          setPhase('error');
          return;
        }
        const result = getInspectionById(inspectionId);
        if (!result) {
          setPhase('error');
          return;
        }
        setInspection(result);
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inspectionId]);

  if (phase === 'loading') {
    return (
      <div className="page id-page">
        <h1 className="page-title">Inspection Details</h1>
        <p className="page-subtitle">Loading inspection...</p>
        <div className="id-loading">
          <div className="id-loading__spinner" />
          <p>Loading inspection...</p>
        </div>
        <style>{idStyles}</style>
      </div>
    );
  }

  if (phase === 'error' || !inspection) {
    return (
      <div className="page id-page">
        <h1 className="page-title">Inspection Details</h1>
        <p className="page-subtitle">Unable to load inspection.</p>
        <Card>
          <CardBody>
            <div className="id-error">
              <p>Inspection not found or unable to load.</p>
              <Button variant="primary" onClick={() => navigate('/employee/inspections')}>
                Back to Inspections
              </Button>
            </div>
          </CardBody>
        </Card>
        <style>{idStyles}</style>
      </div>
    );
  }

  const compCfg = COMPLIANCE_STATUS_CONFIG[inspection.complianceStatus];
  const verCfg = VERIFICATION_STATUS_CONFIG[inspection.verificationStatus];
  const insCfg = INSPECTION_STATUS_CONFIG[inspection.status];

  // Mock compliance summary counts based on status
  const passCount = inspection.complianceStatus === 'pass' ? 4 : 2;
  const reviewCount = inspection.complianceStatus === 'review_required' ? 2 : 1;
  const issueCount = inspection.complianceStatus === 'potential_issue' ? 1 : 0;

  // Mock workflow stages
  const stages: WorkflowStage[] = [
    { key: 'images', label: 'Images captured', status: 'completed' },
    { key: 'ocr', label: 'OCR completed', status: 'completed' },
    { key: 'extracted', label: 'Information extracted', status: 'completed' },
    { key: 'requirements', label: 'Requirements evaluated', status: 'completed' },
    { key: 'compliance', label: 'Compliance screened', status: inspection.complianceStatus === 'pass' ? 'completed' : 'review_required' },
    { key: 'readability', label: 'Readability reviewed', status: 'completed' },
    { key: 'evidence', label: 'Evidence attached', status: 'completed' },
    {
      key: 'verification',
      label: 'Officer verified',
      status: inspection.verificationStatus === 'verified' ? 'completed' :
              inspection.verificationStatus === 'pending' ? 'pending' : 'review_required',
    },
  ];

  return (
    <div className="page id-page">
      {/* Header */}
      <div className="id-header">
        <div className="id-header__left">
          <h1 className="page-title">
            Inspection <code className="id-id">{inspection.id}</code>
          </h1>
          <p className="page-subtitle">
            {inspection.product || 'Unnamed Product'} &middot; {inspection.location}
          </p>
        </div>
        <div className="id-header__right">
          <Button variant="ghost" onClick={() => navigate('/employee/inspections')}>
            ← Back to Inspections
          </Button>
        </div>
      </div>

      <div className="id-body">
        <div className="id-main">
          {/* Workflow summary */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Workflow</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="id-workflow">
                {stages.map((stage, i) => (
                  <React.Fragment key={stage.key}>
                    <div className={`id-workflow__step id-workflow__step--${stage.status}`}>
                      <div className="id-workflow__icon">
                        {stage.status === 'completed' ? '✓' : stage.status === 'review_required' ? '⚠' : '○'}
                      </div>
                      <div className="id-workflow__label">{stage.label}</div>
                    </div>
                    {i < stages.length - 1 && <div className="id-workflow__arrow">↓</div>}
                  </React.Fragment>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Compliance summary */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Summary</CardTitle>
              <Badge variant={compCfg.badge} size="sm">{compCfg.label}</Badge>
            </CardHeader>
            <CardBody>
              <div className="id-compliance">
                <div className="id-compliance__row id-compliance__row--pass">
                  <span className="id-compliance__num">{passCount}</span>
                  <span className="id-compliance__label">PASS</span>
                </div>
                <div className="id-compliance__row id-compliance__row--review">
                  <span className="id-compliance__num">{reviewCount}</span>
                  <span className="id-compliance__label">REVIEW REQUIRED</span>
                </div>
                <div className="id-compliance__row id-compliance__row--issue">
                  <span className="id-compliance__num">{issueCount}</span>
                  <span className="id-compliance__label">POTENTIAL ISSUE</span>
                </div>
              </div>
              <p className="id-compliance__note">
                <em>AI-assisted screening is advisory. Final verification requires officer action.</em>
              </p>
            </CardBody>
          </Card>

          {/* Evidence summary */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="id-evidence">
                <div className="id-evidence__row">
                  <span>Total Evidence</span>
                  <strong>3</strong>
                </div>
                <div className="id-evidence__row">
                  <span>Package Images</span>
                  <strong>2</strong>
                </div>
                <div className="id-evidence__row">
                  <span>Additional Evidence</span>
                  <strong>1</strong>
                </div>
                <div className="id-evidence__row">
                  <span>Measurement Evidence</span>
                  <strong>0</strong>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/employee/inspection/evidence')}
                className="id-evidence__btn"
              >
                View Evidence
              </Button>
            </CardBody>
          </Card>

          {/* Officer verification summary */}
          <Card>
            <CardHeader>
              <CardTitle>Officer Verification</CardTitle>
              <Badge variant={verCfg.badge} size="sm">{verCfg.label}</Badge>
            </CardHeader>
            <CardBody>
              {inspection.verificationStatus === 'pending' ? (
                <div className="id-verify id-verify--pending">
                  <p><strong>PENDING VERIFICATION</strong></p>
                  <p className="id-verify__note">
                    This inspection has not yet been verified by an authorized officer.
                    Pending does not indicate failure or success — officer review is required.
                  </p>
                </div>
              ) : (
                <div className="id-verify">
                  <div className="id-verify__row">
                    <span>Verification Status</span>
                    <strong style={{ color: verCfg.color }}>{verCfg.label}</strong>
                  </div>
                  <div className="id-verify__row">
                    <span>Officer</span>
                    <strong>{inspection.inspectorId}</strong>
                  </div>
                  <div className="id-verify__row">
                    <span>Date/Time</span>
                    <strong>{new Date(inspection.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {inspection.time}</strong>
                  </div>
                  <div className="id-verify__row">
                    <span>Decision</span>
                    <strong>{verCfg.label}</strong>
                  </div>
                </div>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/employee/inspection/verification')}
                className="id-verify__btn"
              >
                Open Verification
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar: Inspection info */}
        <div className="id-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Information</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="id-info">
                <div className="id-info__row">
                  <span>Inspection ID</span>
                  <code className="id-id">{inspection.id}</code>
                </div>
                <div className="id-info__row">
                  <span>Product</span>
                  <strong>{inspection.product || '—'}</strong>
                </div>
                <div className="id-info__row">
                  <span>Manufacturer</span>
                  <strong>{inspection.manufacturer || 'Not specified'}</strong>
                </div>
                <div className="id-info__row">
                  <span>Category</span>
                  <strong>{inspection.category || 'General'}</strong>
                </div>
                <div className="id-info__row">
                  <span>Package Type</span>
                  <strong>{inspection.packageType || 'Not specified'}</strong>
                </div>
                <div className="id-info__row">
                  <span>Location</span>
                  <strong>{inspection.location}</strong>
                </div>
                <div className="id-info__row">
                  <span>Retailer / Market</span>
                  <strong>—</strong>
                </div>
                <div className="id-info__row">
                  <span>Date</span>
                  <strong>{new Date(inspection.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </div>
                <div className="id-info__row">
                  <span>Time</span>
                  <strong>{inspection.time}</strong>
                </div>
                <div className="id-info__row">
                  <span>Officer</span>
                  <strong>{inspection.inspectorId}</strong>
                </div>
                <div className="id-info__row">
                  <span>Status</span>
                  <Badge variant={insCfg.badge} size="sm">{insCfg.label}</Badge>
                </div>
                <div className="id-info__row">
                  <span>Compliance</span>
                  <Badge variant={compCfg.badge} size="sm">{compCfg.label}</Badge>
                </div>
                <div className="id-info__row">
                  <span>Verification</span>
                  <Badge variant={verCfg.badge} size="sm">{verCfg.label}</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="id-actions">
            <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/employee/inspection/new')}>
              Continue Inspection
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/employee/inspection/evidence')}>
              View Evidence
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/employee/reports')}>
              View Report
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/employee/inspections')}>
              ← Back
            </Button>
          </div>

          <div className="id-disclaimer">
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              Automated screening does not replace authorized officer verification.
            </p>
          </div>
        </div>
      </div>

      <style>{idStyles}</style>
    </div>
  );
};

export default InspectionDetails;

/* ==========================================================================
   Styles
   ========================================================================== */

const idStyles = `
  .id-page { max-width: 1280px; margin: 0 auto; }
  .id-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4); }
  .id-header__left { flex: 1; }
  .id-id { font-family: var(--font-family-mono); font-size: var(--font-size-base); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 8px; border-radius: 4px; vertical-align: middle; }

  .id-body { display: grid; grid-template-columns: 1fr 300px; gap: var(--space-5); align-items: flex-start; }
  .id-main { display: flex; flex-direction: column; gap: var(--space-4); }
  @media (max-width: 900px) { .id-body { grid-template-columns: 1fr; } }

  /* Workflow */
  .id-workflow { display: flex; flex-direction: column; align-items: stretch; gap: 0; }
  .id-workflow__step { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); }
  .id-workflow__step--completed { background: var(--color-success-100, #e8f5e9); }
  .id-workflow__step--review_required { background: var(--color-warning-100, #fff3e0); }
  .id-workflow__step--pending { background: var(--color-gray-100); }
  .id-workflow__icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
  }
  .id-workflow__step--completed .id-workflow__icon { background: var(--color-success-600, #2e7d32); }
  .id-workflow__step--review_required .id-workflow__icon { background: var(--color-warning-600, #f57c00); }
  .id-workflow__step--pending .id-workflow__icon { background: var(--color-gray-400); }
  .id-workflow__label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .id-workflow__arrow { text-align: center; color: var(--color-gray-400); font-size: 1.2rem; }

  /* Compliance summary */
  .id-compliance { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); margin-bottom: var(--space-3); }
  .id-compliance__row { display: flex; flex-direction: column; align-items: center; padding: var(--space-3); border-radius: var(--radius-md); text-align: center; }
  .id-compliance__row--pass { background: var(--color-success-100, #e8f5e9); }
  .id-compliance__row--review { background: var(--color-warning-100, #fff3e0); }
  .id-compliance__row--issue { background: var(--color-error-100, #ffebee); }
  .id-compliance__num { font-size: 1.5rem; font-weight: var(--font-weight-bold); }
  .id-compliance__row--pass .id-compliance__num { color: var(--color-success-600, #2e7d32); }
  .id-compliance__row--review .id-compliance__num { color: var(--color-warning-600, #f57c00); }
  .id-compliance__row--issue .id-compliance__num { color: var(--color-error-600, #d32f2f); }
  .id-compliance__label { font-size: 10px; color: var(--color-gray-700); text-transform: uppercase; margin-top: 2px; }
  .id-compliance__note { font-size: 11px; color: var(--color-gray-500); margin: 0; }

  /* Evidence */
  .id-evidence { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3); }
  .id-evidence__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-sm); }
  .id-evidence__btn { margin-top: var(--space-2); }

  /* Verification */
  .id-verify { display: flex; flex-direction: column; gap: var(--space-2); }
  .id-verify__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); }
  .id-verify--pending { padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); }
  .id-verify--pending p { margin: 0; color: var(--color-gray-700); }
  .id-verify__note { font-size: 11px; color: var(--color-gray-500); margin-top: var(--space-2) !important; }
  .id-verify__btn { margin-top: var(--space-3); }

  /* Sidebar */
  .id-sidebar { position: sticky; top: calc(var(--header-height) + var(--space-6)); display: flex; flex-direction: column; gap: var(--space-3); }
  .id-info { display: flex; flex-direction: column; gap: var(--space-2); }
  .id-info__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); }
  .id-info__row span { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .id-info__row strong { color: var(--color-navy-900); font-weight: var(--font-weight-semibold); text-align: right; }
  .id-actions { display: flex; flex-direction: column; gap: var(--space-2); }

  .id-disclaimer { font-size: 11px; color: var(--color-gray-600); display: flex; align-items: flex-start; gap: var(--space-1); padding: 0 var(--space-1); }
  .id-disclaimer p { margin: 0; display: flex; align-items: flex-start; gap: var(--space-1); }

  /* Loading / error */
  .id-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .id-loading__spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: id-spin 0.8s linear infinite; }
  @keyframes id-spin { to { transform: rotate(360deg); } }
  .id-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .id-error p { color: var(--color-gray-600); margin: 0; }
`;
