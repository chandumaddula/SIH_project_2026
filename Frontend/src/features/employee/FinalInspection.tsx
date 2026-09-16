/* ==========================================================================
   Final Inspection Page
   Task O — End-to-End Integration

   Summarises the completed inspection and allows the officer to
   generate the inspection report. Ties together all preceding
   inspection workflow steps.

   This is the end of the inspection flow:
     Capture → OCR → Extracted → Applicable → Compliance
     → Readability/Measurement → Evidence → Officer Verification
     → Final Inspection → Report
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useInspectionStore } from '../../store';
import { getInspectionById, COMPLIANCE_STATUS_CONFIG, VERIFICATION_STATUS_CONFIG } from '../../services/inspection.service';
import { generateReport, getReportById } from '../../services/report.service';
import { ReportDownload } from './ReportDownload';

export const FinalInspection: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, office, measurements, complianceResult, images } = useInspectionStore();
  const [generating, setGenerating] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<ReturnType<typeof getReportById>>(null);

  const inspection = inspectionId ? getInspectionById(inspectionId) : null;

  // Refresh report when it changes
  useEffect(() => {
    if (inspectionId) {
      const report = getReportById(inspectionId);
      setCurrentReport(report ?? null);
    }
  }, [inspectionId, actionMsg]);

  const handleGenerate = () => {
    if (!inspectionId) return;
    setGenerating(true);
    setTimeout(() => {
      const result = generateReport(inspectionId);
      setGenerating(false);
      if (result) {
        setCurrentReport(result);
        setActionMsg('Inspection report generated successfully!');
      } else {
        setActionMsg('Unable to generate report.');
      }
      setTimeout(() => setActionMsg(null), 4000);
    }, 600);
  };

  const complianceCfg = complianceResult
    ? COMPLIANCE_STATUS_CONFIG[complianceResult.overallStatus]
    : null;

  return (
    <div className="page final-inspection-page">
      <div className="final-inspection-header">
        <div>
          <h1 className="page-title">Final Inspection</h1>
          <p className="page-subtitle">Inspection summary and report generation.</p>
        </div>
      </div>

      {actionMsg && (
        <div className={`final-inspection-banner ${actionMsg.includes('success') ? 'final-inspection-banner--success' : 'final-inspection-banner--error'}`}>
          {actionMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inspection Summary</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="final-inspection-grid">
            <div className="final-inspection-row">
              <span>Inspection ID</span>
              <code>{inspectionId || 'N/A'}</code>
            </div>
            <div className="final-inspection-row">
              <span>Officer</span>
              <strong>{officerName || 'Officer'}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Office</span>
              <strong>{office || 'Regional Metrology Office'}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Product</span>
              <strong>{inspection?.product ?? 'N/A'}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Location</span>
              <strong>{inspection?.location ?? 'N/A'}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Date / Time</span>
              <strong>{inspection ? `${inspection.date} ${inspection.time}` : 'N/A'}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Images Captured</span>
              <strong>{images.length}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Measurements</span>
              <strong>{measurements.length}</strong>
            </div>
            <div className="final-inspection-row">
              <span>Compliance Result</span>
              {complianceCfg ? (
                <Badge variant={complianceCfg.badge as any} size="sm">{complianceCfg.label}</Badge>
              ) : (
                <Badge variant="neutral" size="sm">PENDING</Badge>
              )}
            </div>
            <div className="final-inspection-row">
              <span>Verification Status</span>
              {inspection ? (
                <Badge variant={(VERIFICATION_STATUS_CONFIG[inspection.verificationStatus]?.badge ?? 'neutral') as any} size="sm">
                  {VERIFICATION_STATUS_CONFIG[inspection.verificationStatus]?.label ?? inspection.verificationStatus}
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">N/A</Badge>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {!currentReport ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate Inspection Report</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="final-inspection-note">
              <strong>Generate Report:</strong> Create an official inspection report that includes all captured data,
              compliance results, and recommendations. You can download the report as PDF or Excel after generation.
            </p>
            <div className="final-inspection-actions">
              <Button variant="primary" size="lg" onClick={handleGenerate} loading={generating}>
                {generating ? 'Generating...' : '📄 Generate Inspection Report'}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="final-report-status">
                  <Badge variant="success" size="sm">Report Generated</Badge>
                  <code className="final-report-id">{currentReport.id}</code>
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="final-inspection-note final-inspection-note--success">
                <strong>Report Ready!</strong> Your inspection report has been successfully generated.
                Choose your preferred format below to download.
              </p>
              <div className="final-inspection-actions">
                <Button variant="outline" onClick={() => navigate(`/employee/reports/${currentReport.id}`)}>
                  📋 View Report Details
                </Button>
                <Button variant="ghost" onClick={handleGenerate}>
                  🔄 Regenerate Report
                </Button>
              </div>
            </CardBody>
          </Card>

          <ReportDownload report={currentReport} />
        </>
      )}

      <div className="final-inspection-nav">
        <Button variant="ghost" onClick={() => navigate('/employee/inspection/verification')}>
          ← Back to Officer Verification
        </Button>
        <Button variant="outline" onClick={() => navigate('/employee/home')}>
          Return to Home
        </Button>
      </div>

      <style>{finalStyles}</style>
    </div>
  );
};

export default FinalInspection;

const finalStyles = `
  .final-inspection-page { max-width: 900px; margin: 0 auto; }
  .final-inspection-header { margin-bottom: var(--space-4); }
  .final-inspection-banner {
    padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);
    font-size: var(--font-size-base); font-weight: 500;
  }
  .final-inspection-banner--success {
    background: var(--color-success-100); color: var(--color-success-600);
    border: 1px solid var(--color-success-600);
  }
  .final-inspection-banner--error {
    background: var(--color-error-100); color: var(--color-error-600);
    border: 1px solid var(--color-error-600);
  }
  .final-inspection-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .final-inspection-row { display: flex; flex-direction: column; gap: 4px; padding: var(--space-2); background: var(--color-gray-50); border-radius: var(--radius-sm); }
  .final-inspection-row span { font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .final-inspection-row code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); }
  .final-inspection-row strong { font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .final-inspection-actions { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-3); }
  .final-inspection-note {
    font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0;
    padding: var(--space-3); background: var(--color-navy-50);
    border-radius: var(--radius-sm); border-left: 4px solid var(--color-navy-500);
  }
  .final-inspection-note--success {
    background: var(--color-success-100);
    border-left-color: var(--color-success-600);
    color: var(--color-success-700);
  }
  .final-report-status {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
  }
  .final-report-id {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    background: var(--color-gray-100);
    padding: 4px 10px;
    border-radius: 4px;
    color: var(--color-navy-700);
  }
  .final-inspection-nav { display: flex; justify-content: space-between; margin-top: var(--space-6); flex-wrap: wrap; gap: var(--space-2); }
  @media (max-width: 600px) {
    .final-inspection-grid { grid-template-columns: 1fr; }
    .final-inspection-actions { flex-direction: column; }
    .final-inspection-actions .btn { width: 100%; }
  }
`;
