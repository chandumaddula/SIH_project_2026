/* ==========================================================================
   Employee About Page
   Task N — About

   Platform information with AI limitations, officer verification
   principle, and demo status clearly stated.
   No invented legal provisions.
   ========================================================================== */

import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';

export const EmployeeAbout: React.FC = () => {
  return (
    <div className="page emp-about-page">
      <div className="emp-about-header">
        <h1 className="page-title">About Legal Metrology Compliance System</h1>
        <p className="page-subtitle">AI-Assisted Packaged Commodity Compliance &amp; Digital Inspection Platform</p>
      </div>

      <div className="emp-about-grid">

        {/* About Legal Metrology */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>About Legal Metrology</CardTitle></CardHeader>
          <CardBody>
            <p>
              Legal Metrology is the branch of metrology concerned with the regulation
              of commercial transactions and the enforcement of weights and measures laws.
              It ensures fairness, accuracy, and transparency in trade by regulating
              measuring instruments, pre-packaged goods, and product labeling.
            </p>
            <p>
              This platform assists authorized officers in conducting digital inspections,
              reviewing product packaging information, and managing compliance records.
            </p>
          </CardBody>
        </Card>

        {/* About the Platform */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>About the Platform</CardTitle></CardHeader>
          <CardBody>
            <p>
              The Legal Metrology Compliance System is a digital platform designed
              to assist authorized Legal Metrology officers in conducting product
              inspections and managing compliance workflows.
            </p>
            <p>
              Key capabilities include product label scanning, compliance screening,
              evidence collection, officer verification, and report generation.
            </p>
          </CardBody>
        </Card>

        {/* How Package Scanning Works */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>How Package Scanning Works</CardTitle></CardHeader>
          <CardBody>
            <p>
              The officer captures product images using the device camera or uploads
              existing photos. The platform performs automated image quality assessment
              to ensure the images are suitable for inspection.
            </p>
            <p>
              The captured images serve as evidence for the inspection record and are
              associated with the relevant compliance checks.
            </p>
          </CardBody>
        </Card>

        {/* How OCR Works */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>How OCR Works</CardTitle></CardHeader>
          <CardBody>
            <p>
              Optical Character Recognition (OCR) is used to extract printed text from
              product label images. The system identifies key fields such as product
              name, batch number, net quantity, MRP, manufacturer details, and
              best-before date.
            </p>
            <p>
              The extracted text is presented to the officer for review and correction
              as needed. All OCR results are advisory — the officer verifies the
              accuracy of each field.
            </p>
          </CardBody>
        </Card>

        {/* How Compliance Screening Works */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>How Compliance Screening Works</CardTitle></CardHeader>
          <CardBody>
            <p>
              After OCR extraction, the system applies a set of screening rules to
              identify potential compliance issues. This is an advisory screening —
              not a legal determination.
            </p>
            <p>
              The screening result highlights items that may require officer review.
              The officer must verify each finding and make the final determination
              through the Officer Verification workflow.
            </p>
          </CardBody>
        </Card>

        {/* AI Limitations */}
        <Card className="emp-about-card emp-about-card--warning">
          <CardHeader><CardTitle>AI Limitations</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-about-warning">
              <p>
                <strong>This platform provides AI-assisted compliance screening
                and does not replace authorized legal enforcement or officer
                verification.</strong>
              </p>
              <ul>
                <li>AI-assisted screening identifies information that may require review.</li>
                <li>All screening results are advisory and subject to officer review.</li>
                <li>The authorized officer remains responsible for verification and final findings.</li>
                <li>No AI system can replace the legal authority of an authorized officer.</li>
                <li>Officer decisions are the final determination for any inspection record.</li>
              </ul>
            </div>
          </CardBody>
        </Card>

        {/* Officer Verification */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>Officer Verification</CardTitle></CardHeader>
          <CardBody>
            <p>
              The Officer Verification workflow is the authorized process through
              which a Legal Metrology officer reviews automated screening results,
              verifies extracted information, and makes the final compliance
              determination.
            </p>
            <p>
              This workflow ensures that human judgment — with appropriate training
              and legal authority — makes all compliance decisions. The officer's
              verification is recorded in the inspection record.
            </p>
          </CardBody>
        </Card>

        {/* Citizen Complaints */}
        <Card className="emp-about-card">
          <CardHeader><CardTitle>Citizen Complaints</CardTitle></CardHeader>
          <CardBody>
            <p>
              Citizens can submit complaints about potentially non-compliant products.
              Each complaint is reviewed by an officer who may initiate an inspection.
            </p>
            <p>
              The officer investigates the complaint, conducts an on-site or digital
              inspection, and records findings. The complaint record is linked to
              the resulting inspection.
            </p>
          </CardBody>
        </Card>

        {/* System Information */}
        <Card className="emp-about-card emp-about-card--info">
          <CardHeader><CardTitle>System Information</CardTitle></CardHeader>
          <CardBody>
            <div className="emp-about-sysinfo">
              <div className="emp-about-sysinfo__row">
                <span>Application</span>
                <strong>Legal Metrology Compliance System</strong>
              </div>
              <div className="emp-about-sysinfo__row">
                <span>Version</span>
                <strong>1.0.0</strong>
              </div>
              <div className="emp-about-sysinfo__row">
                <span>Environment</span>
                <strong>Demo / Frontend</strong>
              </div>
              <div className="emp-about-sysinfo__row">
                <span>AI</span>
                <strong>AI-assisted screening</strong>
              </div>
              <div className="emp-about-sysinfo__row">
                <span>Data</span>
                <strong>Mock demonstration data</strong>
              </div>
            </div>
            <p className="emp-about-demo-note">
              Demo environment — data shown is for demonstration purposes only.
            </p>
          </CardBody>
        </Card>

      </div>

      <style>{empAboutStyles}</style>
    </div>
  );
};

export default EmployeeAbout;

const empAboutStyles = `
  .emp-about-page { max-width: 1000px; margin: 0 auto; }
  .emp-about-header { margin-bottom: var(--space-4); }
  .emp-about-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
  .emp-about-card--warning { border-left: 3px solid var(--color-warning-500); }
  .emp-about-card--info { grid-column: 1 / -1; }
  @media (max-width: 768px) { .emp-about-grid { grid-template-columns: 1fr; } }

  .emp-about-warning { display: flex; flex-direction: column; gap: var(--space-2); }
  .emp-about-warning p { color: var(--color-warning-600); margin: 0; }
  .emp-about-warning ul { margin: 0; padding-left: var(--space-4); display: flex; flex-direction: column; gap: 6px; }
  .emp-about-warning li { font-size: var(--font-size-sm); color: var(--color-gray-700); }

  .emp-about-sysinfo { display: flex; flex-direction: column; gap: var(--space-2); }
  .emp-about-sysinfo__row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); font-size: var(--font-size-sm); }
  .emp-about-sysinfo__row:last-child { border-bottom: none; }
  .emp-about-sysinfo__row span { color: var(--color-gray-600); font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .emp-about-sysinfo__row strong { color: var(--color-navy-900); }

  .emp-about-demo-note { background: var(--color-info-100); color: var(--color-info-600); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--font-size-sm); margin: var(--space-3) 0 0; }
`;
