import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';

export const About: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">About Metrology</h1>
        <p className="page-subtitle">Understanding the Metrology Portal</p>
      </div>

      <div className="about__grid">
        <Card className="about__card">
          <CardHeader>
            <CardTitle>What is Metrology?</CardTitle>
          </CardHeader>
          <CardBody>
            <p>
              Metrology is the scientific study of measurement. In the government context,
              it encompasses the regulation and verification of weights, measures, and
              commercial instruments to ensure fairness and accuracy in trade.
            </p>
            <p>
              The Metrology Portal provides government employees with a centralized
              platform to conduct inspections, record compliance data, and manage
              consumer complaints related to product packaging and labeling.
            </p>
          </CardBody>
        </Card>

        <Card className="about__card">
          <CardHeader>
            <CardTitle>Why Does This Platform Exist?</CardTitle>
          </CardHeader>
          <CardBody>
            <p>
              The Metrology Portal was created to modernize and streamline the inspection
              workflow for government metrology officers. It addresses several key needs:
            </p>
            <ul className="about__list">
              <li>Centralized record-keeping for inspections and compliance results</li>
              <li>Streamlined complaint management from citizens</li>
              <li>Mobile-friendly tools for on-site inspections</li>
              <li>Real-time data access and reporting capabilities</li>
              <li>Reduced paperwork and manual processes</li>
            </ul>
          </CardBody>
        </Card>

        <Card className="about__card">
          <CardHeader>
            <CardTitle>How Employees Use This Platform</CardTitle>
          </CardHeader>
          <CardBody>
            <p>Employees can perform the following tasks:</p>
            <ol className="about__list">
              <li><strong>Inspect Products:</strong> Scan product labels using the device camera or upload images for analysis</li>
              <li><strong>Check Compliance:</strong> Verify that products meet regulatory requirements for labeling and packaging</li>
              <li><strong>Record Inspections:</strong> Log inspection details including location, date, time, and findings</li>
              <li><strong>File Complaints:</strong> Report non-compliant products through the complaint system</li>
              <li><strong>View History:</strong> Access past inspection records and compliance history</li>
              <li><strong>Locate Sites:</strong> Use the integrated map to find retail and market locations for inspections</li>
            </ol>
          </CardBody>
        </Card>

        <Card className="about__card">
          <CardHeader>
            <CardTitle>Main Features</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="about__list about__list--grid">
              <li>
                <strong>Scan/Upload:</strong> Capture product labels with your device camera or upload images for inspection
              </li>
              <li>
                <strong>Compliance Tracking:</strong> Track compliant and non-compliant products with detailed records
              </li>
              <li>
                <strong>Inspection Management:</strong> Create, schedule, and manage inspection records
              </li>
              <li>
                <strong>Complaint Handling:</strong> Review and manage citizen complaints about products
              </li>
              <li>
                <strong>Map Integration:</strong> Locate retail and market sites for planning inspection routes
              </li>
              <li>
                <strong>History & Reports:</strong> Access comprehensive inspection history and analytics
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card className="about__card">
          <CardHeader>
            <CardTitle>General Workflow</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="about__workflow">
              <div className="about__workflow-step">
                <div className="about__workflow-number">1</div>
                <div className="about__workflow-content">
                  <h4>Select Location</h4>
                  <p>Use the map to identify a retail or market location for inspection</p>
                </div>
              </div>
              <div className="about__workflow-step">
                <div className="about__workflow-number">2</div>
                <div className="about__workflow-content">
                  <h4>Scan Product</h4>
                  <p>Use your device camera to scan the product label or upload an image</p>
                </div>
              </div>
              <div className="about__workflow-step">
                <div className="about__workflow-number">3</div>
                <div className="about__workflow-content">
                  <h4>Review Compliance</h4>
                  <p>Check detected information against regulatory requirements</p>
                </div>
              </div>
              <div className="about__workflow-step">
                <div className="about__workflow-number">4</div>
                <div className="about__workflow-content">
                  <h4>Record Findings</h4>
                  <p>Document inspection results and file complaints if needed</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="about__card">
          <CardHeader>
            <CardTitle>Version & Support</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="about__info">
              <div className="about__info-row">
                <span className="about__info-label">Version</span>
                <span className="about__info-value">1.0.0 (Phase 1)</span>
              </div>
              <div className="about__info-row">
                <span className="about__info-label">Status</span>
                <span className="about__info-value">Development Prototype</span>
              </div>
              <div className="about__info-row">
                <span className="about__info-label">Last Updated</span>
                <span className="about__info-value">August 2024</span>
              </div>
              <div className="about__info-row">
                <span className="about__info-label">Data</span>
                <span className="about__info-value">Mock/Seeded Data (Phase 1)</span>
              </div>
            </div>
            <p className="about__note">
              This is a Phase 1 prototype. All data shown is mock/seeded data
              for demonstration purposes. The production version will connect to
              real government databases and services.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default About;