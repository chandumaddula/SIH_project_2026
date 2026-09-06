/**
 * Report Download Component
 * Provides PDF and Excel download options for inspection reports
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { InspectionReport } from '../../types/report';
import { Inspection } from '../../types/inspection';
import { downloadPDF, downloadExcel, printPDF } from '../../services/reportExport.service';

interface ReportDownloadProps {
  report: InspectionReport;
  inspection: Inspection | null;
  onClose?: () => void;
}

export const ReportDownload: React.FC<ReportDownloadProps> = ({ report, inspection, onClose }) => {
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | 'print' | null>(null);

  const handleDownloadPDF = async () => {
    setDownloading('pdf');
    try {
      await downloadPDF(report, inspection);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading('excel');
    try {
      await downloadExcel(report, inspection);
    } catch (error) {
      console.error('Error generating Excel:', error);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const handlePrint = async () => {
    setDownloading('print');
    try {
      await printPDF(report, inspection);
    } catch (error) {
      console.error('Error printing PDF:', error);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <Card className="report-download-card">
      <CardHeader>
        <CardTitle>
          <span className="report-download-icon">📥</span>
          Download Report
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </CardHeader>
      <CardBody>
        <div className="report-download-info">
          <div className="report-download-info-row">
            <span className="report-download-label">Report ID:</span>
            <code>{report.id}</code>
          </div>
          <div className="report-download-info-row">
            <span className="report-download-label">Status:</span>
            <Badge variant={report.status === 'COMPLETED' ? 'success' : 'info'} size="sm">
              {report.status}
            </Badge>
          </div>
          <div className="report-download-info-row">
            <span className="report-download-label">Generated:</span>
            <span>{new Date(report.generatedAt).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="report-download-options">
          <div className="report-download-option" onClick={handleDownloadPDF}>
            <div className="report-download-option-icon report-download-option-icon--pdf">
              📄
            </div>
            <div className="report-download-option-content">
              <span className="report-download-option-title">PDF Report</span>
              <span className="report-download-option-desc">
                Professional document format with complete inspection details, suitable for official submission and printing.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={downloading === 'pdf'}
              disabled={downloading !== null}
            >
              {downloading === 'pdf' ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>

          <div className="report-download-option" onClick={handleDownloadExcel}>
            <div className="report-download-option-icon report-download-option-icon--excel">
              📊
            </div>
            <div className="report-download-option-content">
              <span className="report-download-option-title">Excel Spreadsheet</span>
              <span className="report-download-option-desc">
                Tabular format with separate sheets for declarations, violations, and recommendations. Ideal for data analysis.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              loading={downloading === 'excel'}
              disabled={downloading !== null}
            >
              {downloading === 'excel' ? 'Generating...' : 'Download Excel'}
            </Button>
          </div>

          <div className="report-download-option" onClick={handlePrint}>
            <div className="report-download-option-icon report-download-option-icon--print">
              🖨️
            </div>
            <div className="report-download-option-content">
              <span className="report-download-option-title">Print Report</span>
              <span className="report-download-option-desc">
                Open PDF in print dialog for direct printing or saving as PDF.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              loading={downloading === 'print'}
              disabled={downloading !== null}
            >
              {downloading === 'print' ? 'Opening...' : 'Print'}
            </Button>
          </div>
        </div>

        <div className="report-download-note">
          <span className="report-download-note-icon">ℹ️</span>
          <span>
            Reports are generated locally in your browser. No data is sent to external servers.
          </span>
        </div>

        <style>{reportDownloadStyles}</style>
      </CardBody>
    </Card>
  );
};

const reportDownloadStyles = `
  .report-download-card {
    margin-bottom: var(--space-4);
  }

  .report-download-card .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .report-download-icon {
    font-size: 1.5rem;
    margin-right: var(--space-2);
  }

  .report-download-info {
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .report-download-info-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
  }

  .report-download-label {
    color: var(--color-gray-600);
    min-width: 80px;
    font-weight: 600;
  }

  .report-download-info-row code {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    background: var(--color-navy-50);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--color-navy-700);
  }

  .report-download-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .report-download-option {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .report-download-option:hover {
    border-color: var(--color-navy-300);
    box-shadow: var(--shadow-base);
    transform: translateY(-1px);
  }

  .report-download-option-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .report-download-option-icon--pdf {
    background: #ffebee;
  }

  .report-download-option-icon--excel {
    background: #e8f5e9;
  }

  .report-download-option-icon--print {
    background: #e3f2fd;
  }

  .report-download-option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .report-download-option-title {
    font-weight: 600;
    color: var(--color-navy-900);
    font-size: var(--font-size-base);
  }

  .report-download-option-desc {
    font-size: var(--font-size-xs);
    color: var(--color-gray-600);
    line-height: 1.4;
  }

  .report-download-option .btn {
    flex-shrink: 0;
    min-width: 120px;
  }

  .report-download-note {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-info-100);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    color: var(--color-info-600);
  }

  .report-download-note-icon {
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .report-download-option {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .report-download-option-icon {
      margin: 0 auto;
    }

    .report-download-option .btn {
      width: 100%;
    }
  }
`;

export default ReportDownload;
