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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useInspectionStore } from '../../store';
import { getInspectionById, COMPLIANCE_STATUS_CONFIG, VERIFICATION_STATUS_CONFIG } from '../../services/inspection.service';
import { generateReport, getReportById } from '../../services/report.service';

export const FinalInspection: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, office, measurements, complianceResult, images } = useInspectionStore();
  const [generating, setGenerating] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const inspection = inspectionId ? getInspectionById(inspectionId) : null;
  const existingReport = inspectionId
    ? getReportById(inspectionId) ?? null
    : null;

  const handleGenerate = () => {
    if (!inspectionId) return;
    setGenerating(true);
    setTimeout(() => {
      const result = generateReport(inspectionId);
      setGenerating(false);
      if (result) {
        setActionMsg('Inspection report generated successfully.');
        setTimeout(() => navigate(`/employee/reports/${result.id}`), 500);
      } else {
        setActionMsg('Unable to generate report.');
      }
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

      {actionMsg && <div className="final-inspection-banner">{actionMsg}</div>}

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

      <Card>
        <CardHeader>
          <CardTitle>Generate Inspection Report</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="final-inspection-note">
            <strong>Demo notice:</strong> Report is generated locally. No real PDF is created. Use the report
            preview page to view or print the document. Final compliance determination is made by the authorized
            officer via the Officer Verification workflow.
          </p>
          {existingReport ? (
            <div className="final-inspection-actions">
              <Badge variant="success" size="sm">Report {existingReport.id} already generated</Badge>
              <Button variant="primary" onClick={() => navigate(`/employee/reports/${existingReport.id}`)}>
                Open Report
              </Button>
            </div>
          ) : (
            <div className="final-inspection-actions">
              <Button variant="primary" onClick={handleGenerate} loading={generating}>
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

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
  .final-inspection-page { max-width: 800px; margin: 0 auto; }
  .final-inspection-header { margin-bottom: var(--space-4); }
  .final-inspection-banner {
    padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3);
    font-size: var(--font-size-sm); background: var(--color-info-100); color: var(--color-info-600);
    border: 1px solid var(--color-info-600);
  }
  .final-inspection-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
  .final-inspection-row { display: flex; flex-direction: column; gap: 2px; }
  .final-inspection-row span { font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .final-inspection-row code { font-family: var(--font-family-mono); font-size: var(--font-size-sm); color: var(--color-navy-700); }
  .final-inspection-row strong { font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .final-inspection-actions { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
  .final-inspection-note { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0 0 var(--space-3); padding: var(--space-2) var(--space-3); background: var(--color-navy-50); border-radius: var(--radius-sm); border-left: 3px solid var(--color-navy-500); }
  .final-inspection-nav { display: flex; justify-content: space-between; margin-top: var(--space-4); flex-wrap: wrap; gap: var(--space-2); }
  @media (max-width: 600px) { .final-inspection-grid { grid-template-columns: 1fr; } }
`;
