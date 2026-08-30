/* ==========================================================================
   Report Details Page
   Task M — Inspection Reports

   Professional preview / view of a single inspection report.
   Includes:
   - Government-style header
   - Inspection & product details
   - Extracted declarations
   - Applicable requirements
   - Compliance findings
   - Package images
   - Measurements
   - Officer observations
   - Officer verification status
   - Generate / Preview / Download actions

   IMPORTANT:
   - This is a frontend DEMO. No real PDF generation.
   - No real legal certification. Reports are mock documents for review.
   - Final compliance determination is made by the authorized officer
     (see OfficerVerification workflow).
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { InspectionReport } from '../../types/report';
import {
  getReportById,
  generateReport,
  updateReportStatus,
  addOfficerObservation,
  REPORT_STATUS_CONFIG,
} from '../../services/report.service';
import { COMPLIANCE_STATUS_CONFIG, VERIFICATION_STATUS_CONFIG } from '../../services/inspection.service';
import { useUserStore } from '../../store';

type ModalMode = 'generate' | 'complete' | 'observation' | null;

export const ReportDetails: React.FC = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { user } = useUserStore();

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [observation, setObservation] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    setTimeout(() => {
      const r = getReportById(reportId);
      if (r) {
        setReport(r);
        setPhase('done');
      } else {
        setPhase('error');
      }
    }, 300);
  }, [reportId]);

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
    setObservation('');
    setModal(mode);
  };

  const closeModal = () => setModal(null);

  const handleGenerate = () => {
    if (!report) return;
    setGenerating(true);
    setTimeout(() => {
      const result = generateReport(report.inspectionId, user?.id ?? 'emp-001');
      if (result) {
        setReport(result);
        closeModal();
        showMessage('Inspection report generated successfully.');
      } else {
        showError('Unable to generate report.');
      }
      setGenerating(false);
    }, 500);
  };

  const handleMarkComplete = () => {
    if (!report) return;
    const result = updateReportStatus(report.id, 'COMPLETED', user?.name ?? 'Officer');
    if (result) {
      setReport(result);
      closeModal();
      showMessage('Report marked as completed.');
    } else {
      showError('Unable to update report status.');
    }
  };

  const handleAddObservation = () => {
    if (!report || !observation.trim()) {
      showError('Please enter an observation.');
      return;
    }
    const result = addOfficerObservation(report.id, user?.name ?? 'Officer', observation);
    if (result) {
      setReport(result);
      closeModal();
      showMessage('Officer observation added.');
    } else {
      showError('Unable to add observation.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (phase === 'loading') {
    return (
      <div className="page rd-page">
        <h1 className="page-title">Report Details</h1>
        <p className="page-subtitle">Loading report...</p>
        <div className="rd-loading"><div className="rd-spinner" /><p>Loading report...</p></div>
        <style>{rdStyles}</style>
      </div>
    );
  }

  if (phase === 'error' || !report) {
    return (
      <div className="page rd-page">
        <h1 className="page-title">Report Details</h1>
        <Card><CardBody>
          <div className="rd-error">
            <p>Unable to load report.</p>
            <div className="rd-error__actions">
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
              <Button variant="ghost" onClick={() => navigate('/employee/reports')}>Back to list</Button>
            </div>
          </div>
        </CardBody></Card>
        <style>{rdStyles}</style>
      </div>
    );
  }

  const statusCfg = REPORT_STATUS_CONFIG[report.status];
  const compCfg = COMPLIANCE_STATUS_CONFIG[report.overallCompliance];
  const verCfg = VERIFICATION_STATUS_CONFIG[report.verificationStatus as keyof typeof VERIFICATION_STATUS_CONFIG];

  return (
    <div className={`page rd-page ${isPreview ? 'rd-page--preview' : ''}`}>
      {!isPreview && (
        <div className="rd-header">
          <div>
            <button className="rd-back" onClick={() => navigate('/employee/reports')}>← Back to reports</button>
            <h1 className="page-title">Inspection Report <code className="rd-id-inline">{report.id}</code></h1>
            <p className="page-subtitle">{report.productName} — {new Date(report.inspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="rd-header__actions">
            <Badge variant={statusCfg.badge as any} size="md">{statusCfg.label}</Badge>
            {report.status === 'DRAFT' && (
              <Button variant="primary" size="sm" onClick={() => openModal('generate')}>
                Generate Report
              </Button>
            )}
            {report.status !== 'COMPLETED' && report.status !== 'DRAFT' && (
              <Button variant="success" size="sm" onClick={() => openModal('complete')}>
                Mark Complete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Print / Save as PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openModal('observation')}>
              + Observation
            </Button>
          </div>
        </div>
      )}

      {actionMessage && !isPreview && <div className="rd-banner rd-banner--success">{actionMessage}</div>}
      {actionError && !isPreview && <div className="rd-banner rd-banner--error">{actionError}</div>}

      {/* Report preview container */}
      <div className="rd-doc">
        {/* Government-style header */}
        <div className="rd-doc__header">
          <div className="rd-doc__crest">⚖️</div>
          <div className="rd-doc__head-text">
            <div className="rd-doc__system">Legal Metrology Compliance System</div>
            <div className="rd-doc__title">Inspection Report</div>
            <div className="rd-doc__subtitle">Mock Document — Frontend Demo</div>
          </div>
          <div className="rd-doc__crest">⚖️</div>
        </div>

        {/* Report meta */}
        <div className="rd-doc__meta">
          <div><span>Report ID</span><code>{report.id}</code></div>
          <div><span>Inspection ID</span><code>{report.inspectionId}</code></div>
          <div><span>Date</span><strong>{new Date(report.inspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
          <div><span>Time</span><strong>{report.inspectionTime}</strong></div>
          <div><span>Officer</span><strong>{report.officerName}</strong></div>
          <div><span>Office</span><strong>{report.office}</strong></div>
          <div><span>Location</span><strong>{report.inspectionLocation}</strong></div>
          <div><span>Status</span><Badge variant={statusCfg.badge as any} size="sm">{statusCfg.label}</Badge></div>
        </div>

        {/* Product details */}
        <section className="rd-doc__section">
          <h2>Product Details</h2>
          <div className="rd-doc__grid">
            <div><span>Product Name</span><strong>{report.productName}</strong></div>
            {report.productGenericDescription && <div><span>Generic Description</span><p>{report.productGenericDescription}</p></div>}
            <div><span>Manufacturer</span><strong>{report.productManufacturer}</strong></div>
            {report.productPacker && <div><span>Packer</span><span>{report.productPacker}</span></div>}
            {report.productImporter && <div><span>Importer</span><span>{report.productImporter}</span></div>}
            <div><span>Category</span><span>{report.productCategory}</span></div>
            {report.productPackageType && <div><span>Package Type</span><span>{report.productPackageType}</span></div>}
            {report.productBarcode && <div><span>Barcode</span><code className="rd-id-inline">{report.productBarcode}</code></div>}
          </div>
        </section>

        {/* Inspection details */}
        <section className="rd-doc__section">
          <h2>Inspection Details</h2>
          <div className="rd-doc__grid">
            <div><span>Inspection ID</span><code>{report.inspectionId}</code></div>
            <div><span>Date / Time</span><strong>{new Date(report.inspectionDate).toLocaleDateString('en-IN')} {report.inspectionTime}</strong></div>
            <div><span>Location</span><strong>{report.inspectionLocation}</strong></div>
            <div><span>Retailer / Market</span><span>{report.inspectionLocation}</span></div>
            <div><span>Officer</span><strong>{report.officerName}</strong></div>
            <div><span>Inspection Status</span><Badge variant="info" size="sm">{report.inspectionStatus}</Badge></div>
            <div><span>Verification Status</span><Badge variant={verCfg.badge as any} size="sm">{verCfg.label}</Badge></div>
          </div>
        </section>

        {/* Package images */}
        <section className="rd-doc__section">
          <h2>Package Images</h2>
          <p className="rd-doc__note">Image data is sourced from the existing inspection / evidence workflow. See the Evidence Management page for full records.</p>
          <div className="rd-doc__images">
            {['Front', 'Back', 'Side', 'Label', 'Additional Evidence'].map(label => (
              <div key={label} className="rd-doc__image">
                <div className="rd-doc__image-thumb">📷</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Extracted declarations */}
        <section className="rd-doc__section">
          <h2>Extracted Declarations</h2>
          <p className="rd-doc__note">Values produced by the existing OCR workflow. Items are shown only where the existing data supports them.</p>
          <div className="rd-doc__table-wrap">
            <table className="rd-doc__table">
              <thead>
                <tr>
                  <th>Declaration</th>
                  <th>Value</th>
                  <th>Confidence</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {report.extractedDeclarations.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.label}</strong></td>
                    <td>{d.value || '—'}</td>
                    <td>{d.confidence ? `${d.confidence}%` : '—'}</td>
                    <td>{d.source || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Applicable requirements */}
        <section className="rd-doc__section">
          <h2>Applicable Requirements</h2>
          <p className="rd-doc__note">Derived from the existing applicability result for this inspection.</p>
          {report.applicableRequirements.length === 0 ? (
            <p className="rd-doc__empty">No applicable requirements recorded for this report.</p>
          ) : (
            <div className="rd-doc__table-wrap">
              <table className="rd-doc__table">
                <thead>
                  <tr><th>Requirement</th><th>Applicability</th><th>Result</th><th>Evidence</th></tr>
                </thead>
                <tbody>
                  {report.applicableRequirements.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.requirementName}</strong></td>
                      <td>{r.applicability}</td>
                      <td><Badge variant="neutral" size="sm">{r.result.replace('_', ' ').toUpperCase()}</Badge></td>
                      <td>{r.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Compliance findings */}
        <section className="rd-doc__section">
          <h2>Compliance Findings</h2>
          <p className="rd-doc__note">
            <strong>Automated Screening</strong> states are advisory. <strong>Officer Verification</strong> is the
            authorized final decision.
          </p>
          {report.complianceFindings.length === 0 ? (
            <p className="rd-doc__empty">No compliance findings recorded for this report.</p>
          ) : (
            <div className="rd-doc__table-wrap">
              <table className="rd-doc__table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Extracted</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Evidence</th>
                    <th>Officer Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {report.complianceFindings.map((f, i) => (
                    <tr key={i}>
                      <td><strong>{f.requirementName}</strong></td>
                      <td>{f.extractedValue}</td>
                      <td><Badge variant={f.status === 'pass' ? 'success' : f.status === 'review_required' ? 'warning' : 'error'} size="sm">{f.status.replace('_', ' ').toUpperCase()}</Badge></td>
                      <td>{f.confidence}%</td>
                      <td>{f.evidence}</td>
                      <td>{f.officerVerification.decision}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Officer verification */}
        <section className="rd-doc__section">
          <h2>Officer Verification</h2>
          <div className="rd-doc__verify">
            <div className="rd-doc__verify-card">
              <strong>Automated Screening</strong>
              <Badge variant={compCfg.badge as any} size="sm">{compCfg.label}</Badge>
              <p>Advisory result produced by the screening system. Not a final legal decision.</p>
            </div>
            <div className="rd-doc__verify-card">
              <strong>Officer Verification</strong>
              <Badge variant={verCfg.badge as any} size="sm">{verCfg.label}</Badge>
              <p>Final determination is made only by the authorized officer via the Officer Verification workflow (Task J).</p>
            </div>
          </div>
        </section>

        {/* Physical measurements */}
        <section className="rd-doc__section">
          <h2>Physical Measurements</h2>
          {report.measurements.length === 0 ? (
            <p className="rd-doc__empty">No physical measurements were recorded for this inspection.</p>
          ) : (
            <div className="rd-doc__table-wrap">
              <table className="rd-doc__table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Location</th>
                    <th>Officer</th>
                    <th>Date / Time</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {report.measurements.map((m, i) => (
                    <tr key={i}>
                      <td><strong>{m.type}</strong></td>
                      <td>{m.value}</td>
                      <td>{m.unit}</td>
                      <td>{m.location}</td>
                      <td>{m.officerName}</td>
                      <td>{new Date(m.timestamp).toLocaleString('en-IN')}</td>
                      <td>{m.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Officer observations */}
        <section className="rd-doc__section">
          <h2>Officer Observations</h2>
          {report.officerObservations.length === 0 ? (
            <p className="rd-doc__empty">No officer observations recorded.</p>
          ) : (
            <ul className="rd-doc__obs">
              {report.officerObservations.map(o => (
                <li key={o.id}>
                  <div className="rd-doc__obs-head">
                    <strong>{o.officerName}</strong>
                    <span>{new Date(o.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <p>{o.observation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Disclaimer */}
        <section className="rd-doc__section rd-doc__disclaimer">
          <strong>Demo Disclaimer:</strong> This document is generated from a frontend DEMO. It is not a legally
          certified PDF. No backend document store or real legal rules engine is involved. The final compliance
          determination is made by the authorized officer via the Officer Verification workflow.
        </section>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal === 'generate'}
        onClose={closeModal}
        title="Generate Inspection Report"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleGenerate} loading={generating}>
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </>
        }
      >
        <div className="rd-form">
          <p>
            This is a mock generation. The report will be created and associated with
            inspection <code className="rd-id-inline">{report.inspectionId}</code>.
          </p>
          <p className="rd-form__note">
            A real PDF is not produced. Use the <strong>Print / Save as PDF</strong> button to save a copy.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={modal === 'complete'}
        onClose={closeModal}
        title="Mark Report Complete"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="success" onClick={handleMarkComplete}>Mark Complete</Button>
          </>
        }
      >
        <p>Mark this report as <strong>COMPLETED</strong>? This indicates that officer review has concluded.</p>
      </Modal>

      <Modal
        isOpen={modal === 'observation'}
        onClose={closeModal}
        title="Add Officer Observation"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleAddObservation}>Save Observation</Button>
          </>
        }
      >
        <div className="rd-form">
          <label className="rd-form__label">Observation</label>
          <textarea
            className="rd-form__textarea"
            rows={4}
            value={observation}
            onChange={e => setObservation(e.target.value)}
            placeholder="Document observation, follow-up actions, or other notes..."
          />
        </div>
      </Modal>

      <style>{rdStyles}</style>
    </div>
  );
};

export default ReportDetails;

const rdStyles = `
  .rd-page { max-width: 1100px; margin: 0 auto; }
  .rd-back { background: none; border: none; color: var(--color-navy-500); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); cursor: pointer; padding: 0; margin-bottom: var(--space-2); }
  .rd-back:hover { color: var(--color-navy-700); text-decoration: underline; }
  .rd-id-inline { font-family: var(--font-family-mono); font-size: var(--font-size-sm); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 8px; border-radius: 3px; }
  .rd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3); flex-wrap: wrap; }
  .rd-header__actions { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
  .rd-banner { padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--font-size-sm); }
  .rd-banner--success { background: var(--color-success-100); color: var(--color-success-600); border: 1px solid var(--color-success-600); }
  .rd-banner--error { background: var(--color-error-100); color: var(--color-error-600); border: 1px solid var(--color-error-600); }

  /* Document container */
  .rd-doc { background: var(--color-white); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: var(--space-6); box-shadow: var(--shadow-base); }
  .rd-doc__header { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--space-4); border-bottom: 3px solid var(--color-navy-700); margin-bottom: var(--space-4); }
  .rd-doc__crest { font-size: 2.5rem; }
  .rd-doc__head-text { text-align: center; }
  .rd-doc__system { font-size: var(--font-size-sm); color: var(--color-gray-600); text-transform: uppercase; letter-spacing: 0.5px; }
  .rd-doc__title { font-size: 1.6rem; font-weight: var(--font-weight-bold); color: var(--color-navy-900); margin: 2px 0; }
  .rd-doc__subtitle { font-size: 11px; color: var(--color-warning-600); font-weight: var(--font-weight-semibold); }

  .rd-doc__meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); padding: var(--space-3); background: var(--color-navy-50); border-radius: var(--radius-sm); margin-bottom: var(--space-5); }
  .rd-doc__meta > div { display: flex; flex-direction: column; gap: 2px; }
  .rd-doc__meta span { font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .rd-doc__meta strong { font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .rd-doc__meta code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); }
  @media (max-width: 700px) { .rd-doc__meta { grid-template-columns: 1fr; } }

  .rd-doc__section { margin-bottom: var(--space-5); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-gray-200); }
  .rd-doc__section:last-child { border-bottom: none; }
  .rd-doc__section h2 { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-navy-900); margin: 0 0 var(--space-3); padding-bottom: var(--space-2); border-bottom: 2px solid var(--color-gold-600); }
  .rd-doc__note { font-size: 11px; color: var(--color-gray-600); font-style: italic; margin: 0 0 var(--space-3); }

  .rd-doc__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
  .rd-doc__grid > div { display: flex; flex-direction: column; gap: 2px; }
  .rd-doc__grid span { font-size: 10px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .rd-doc__grid strong { font-size: var(--font-size-sm); color: var(--color-navy-900); }
  .rd-doc__grid p { margin: 0; font-size: var(--font-size-sm); color: var(--color-gray-800); }
  .rd-doc__grid code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); }
  @media (max-width: 700px) { .rd-doc__grid { grid-template-columns: 1fr; } }

  .rd-doc__images { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-3); }
  .rd-doc__image { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
  .rd-doc__image-thumb { width: 100%; aspect-ratio: 4/3; background: var(--color-gray-100); border: 1px solid var(--color-gray-200); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 2rem; }
  .rd-doc__image span { font-size: 11px; color: var(--color-gray-700); }

  .rd-doc__table-wrap { overflow-x: auto; }
  .rd-doc__table { width: 100%; border-collapse: collapse; }
  .rd-doc__table th, .rd-doc__table td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .rd-doc__table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
  .rd-doc__table tr:hover { background: var(--color-gray-50); }

  .rd-doc__verify { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .rd-doc__verify-card { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-3); border: 1px solid var(--color-gray-200); border-radius: var(--radius-sm); background: var(--color-gray-50); }
  .rd-doc__verify-card strong { color: var(--color-navy-900); }
  .rd-doc__verify-card p { margin: 0; font-size: var(--font-size-sm); color: var(--color-gray-700); line-height: 1.5; }
  @media (max-width: 700px) { .rd-doc__verify { grid-template-columns: 1fr; } }

  .rd-doc__obs { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
  .rd-doc__obs li { padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-left: 3px solid var(--color-navy-500); border-radius: var(--radius-sm); }
  .rd-doc__obs-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .rd-doc__obs-head span { color: var(--color-gray-500); font-size: 11px; }
  .rd-doc__obs p { margin: 0; font-size: var(--font-size-sm); color: var(--color-gray-800); }

  .rd-doc__empty { color: var(--color-gray-500); font-size: var(--font-size-sm); margin: 0; }
  .rd-doc__disclaimer { background: var(--color-warning-100); padding: var(--space-3); border-radius: var(--radius-sm); border-left: 3px solid var(--color-warning-600); font-size: var(--font-size-sm); color: var(--color-warning-600); }

  /* Form */
  .rd-form { display: flex; flex-direction: column; gap: var(--space-2); }
  .rd-form__label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .rd-form__textarea { width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); resize: vertical; }
  .rd-form__textarea:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .rd-form__note { background: var(--color-info-100); color: var(--color-info-600); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: 12px; margin: 0; }

  .rd-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .rd-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: rd-spin 0.8s linear infinite; }
  @keyframes rd-spin { to { transform: rotate(360deg); } }
  .rd-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .rd-error p { color: var(--color-gray-600); margin: 0; }
  .rd-error__actions { display: flex; gap: var(--space-2); }

  /* Print styles */
  @media print {
    .rd-page { max-width: 100%; }
    .rd-back, .rd-header__actions, .rd-banner, button { display: none !important; }
    .rd-doc { box-shadow: none; border: none; }
  }
`;
