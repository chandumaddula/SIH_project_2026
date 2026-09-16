/**
 * Report Export Service
 * Generates PDF and Excel reports from inspection data
 */

import { InspectionReport } from '../types/report';
import { COMPLIANCE_STATUS_CONFIG } from './inspection.service';

// PDF Generation using jsPDF
export const generatePDFReport = async (report: InspectionReport): Promise<Blob> => {
  // Dynamically import jsPDF to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const rgb = hexToRgb(color);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);

    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    if (y + lines.length * (fontSize * 0.4) > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.4) + 4;
  };

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Add horizontal line
  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // Header with logo area
  doc.setFillColor(26, 35, 126); // Navy color
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INSPECTION REPORT', margin, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Department of Consumer Affairs | Legal Metrology Division', margin, 30);

  y = 50;

  // Report Info Box
  doc.setFillColor(245, 245, 250);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, 'F');

  addText(`Report ID: ${report.id}`, 11, true, '#1a237e');
  addText(`Inspection ID: ${report.inspectionId}`, 10, false, '#333333');
  addText(`Generated: ${report.generatedAt ? new Date(report.generatedAt).toLocaleString('en-IN') : 'N/A'}`, 10, false, '#666666');

  y += 15;
  addLine();

  // Get compliance status config
  const complianceConfig = COMPLIANCE_STATUS_CONFIG[report.overallCompliance] || { label: 'N/A', description: '' };
  const complianceStatus = complianceConfig.label;

  // Inspection Details Section
  addText('INSPECTION DETAILS', 14, true, '#1a237e');
  y += 5;

  const details = [
    ['Product Name', report.productName],
    ['Category', report.productCategory],
    ['Manufacturer', report.productManufacturer],
    ['Inspection Date', new Date(report.inspectionDate).toLocaleDateString('en-IN')],
    ['Inspection Location', report.inspectionLocation],
    ['Officer Name', report.officerName],
    ['Office', report.office],
  ];

  details.forEach(([label, value]) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), margin + 45, y);
    y += 7;
  });

  y += 5;
  addLine();

  // Compliance Status Section
  addText('COMPLIANCE STATUS', 14, true, '#1a237e');
  y += 5;

  const statusColors: Record<string, string> = {
    COMPLIANT: '#2e7d32',
    'NON-COMPLIANT': '#c62828',
    'REVIEW REQUIRED': '#f57c00',
    'PARTIALLY COMPLIANT': '#1976d2',
    pass: '#2e7d32',
    review_required: '#f57c00',
    potential_issue: '#c62828',
    not_applicable: '#757575',
  };

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const statusColor = statusColors[report.overallCompliance] || '#666666';
  doc.setTextColor(hexToRgb(statusColor).r, hexToRgb(statusColor).g, hexToRgb(statusColor).b);
  doc.text(complianceStatus, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const complianceLines = doc.splitTextToSize(complianceConfig.description || 'Compliance screening completed.', pageWidth - 2 * margin - 10);
  doc.text(complianceLines, margin, y);
  y += complianceLines.length * 5 + 5;

  y += 5;
  addLine();

  // Extracted Declarations Section
  addText('EXTRACTED DECLARATIONS', 14, true, '#1a237e');
  y += 5;

  report.extractedDeclarations.forEach((decl) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const statusIcon = decl.value ? '✓' : '✗';
    const statusColor = decl.value ? '#2e7d32' : '#c62828';

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(hexToRgb(statusColor).r, hexToRgb(statusColor).g, hexToRgb(statusColor).b);
    doc.text(statusIcon, margin, y);

    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(decl.label, margin + 8, y);

    if (decl.value) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Value: ${decl.value}`, margin + 55, y);
      y += 5;
      if (decl.confidence) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Confidence: ${decl.confidence}%`, margin + 55, y);
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 50, 50);
      doc.text('NOT DETECTED', margin + 55, y);
    }
    y += 10;
  });

  y += 5;
  addLine();

  // Compliance Findings Section
  if (report.complianceFindings && report.complianceFindings.length > 0) {
    addText('COMPLIANCE FINDINGS', 14, true, '#1a237e');
    y += 5;

    report.complianceFindings.forEach((finding) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      const findingStatus = finding.status === 'pass' ? 'PASS' : finding.status === 'review_required' ? 'REVIEW' : 'FAIL';
      const findingColor = finding.status === 'pass' ? '#2e7d32' : finding.status === 'review_required' ? '#f57c00' : '#c62828';

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(finding.requirementName, margin, y);

      doc.setTextColor(hexToRgb(findingColor).r, hexToRgb(findingColor).g, hexToRgb(findingColor).b);
      doc.text(findingStatus, pageWidth - margin - 15, y);

      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Extracted: ${finding.extractedValue || 'N/A'} | Evidence: ${finding.evidence || 'N/A'}`, margin, y);
      y += 10;
    });

    y += 5;
    addLine();
  }

  // Measurements Section
  if (report.measurements && report.measurements.length > 0) {
    addText('PHYSICAL MEASUREMENTS', 14, true, '#1a237e');
    y += 5;

    report.measurements.forEach((m) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(`${m.type}: ${m.value} ${m.unit}`, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Location: ${m.location || 'N/A'} | Officer: ${m.officerName || 'N/A'}`, margin, y);
      y += 10;
    });

    y += 5;
    addLine();
  }

  // Officer Observations Section
  if (report.officerObservations && report.officerObservations.length > 0) {
    addText('OFFICER OBSERVATIONS', 14, true, '#1a237e');
    y += 5;

    report.officerObservations.forEach((obs) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(`${obs.officerName} - ${new Date(obs.timestamp).toLocaleString('en-IN')}`, margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(obs.observation, pageWidth - 2 * margin - 10);
      doc.text(obsLines, margin, y);
      y += obsLines.length * 5 + 5;
    });

    y += 5;
    addLine();
  }

  // Signature Section
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth / 2 - 10, y);
  doc.line(pageWidth / 2 + 10, y, pageWidth - margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Inspector Signature', margin, y);
  doc.text('Authorized Signature', pageWidth / 2 + 10, y);

  y += 15;
  doc.setFontSize(8);
  doc.text(`Document generated on ${new Date().toLocaleString('en-IN')}`, margin, y);
  doc.text('This is a computer-generated document.', margin, y + 4);

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, 290);
    doc.text('Department of Consumer Affairs - Legal Metrology', margin, 290);
  }

  return doc.output('blob');
};

// CSV Generation
export const generateCSVReport = async (report: InspectionReport): Promise<Blob> => {
  const csvRows = [];

  // Header
  csvRows.push(['INSPECTION REPORT']);
  csvRows.push(['']);
  csvRows.push(['Report Information']);
  csvRows.push(['Report ID', report.id]);
  csvRows.push(['Inspection ID', report.inspectionId]);
  csvRows.push(['Generated Date', report.generatedAt ? new Date(report.generatedAt).toLocaleString('en-IN') : 'N/A']);
  csvRows.push(['']);
  csvRows.push(['Inspection Details']);
  csvRows.push(['Product Name', report.productName]);
  csvRows.push(['Category', report.productCategory]);
  csvRows.push(['Manufacturer', report.productManufacturer]);
  csvRows.push(['Packer', report.productPacker || 'N/A']);
  csvRows.push(['Importer', report.productImporter || 'N/A']);
  csvRows.push(['Package Type', report.productPackageType || 'N/A']);
  csvRows.push(['Barcode', report.productBarcode || 'N/A']);
  csvRows.push(['Inspection Date', new Date(report.inspectionDate).toLocaleDateString('en-IN')]);
  csvRows.push(['Inspection Location', report.inspectionLocation]);
  csvRows.push(['Officer Name', report.officerName]);
  csvRows.push(['Office', report.office]);
  csvRows.push(['Verification Status', report.verificationStatus]);
  csvRows.push(['']);
  csvRows.push(['Compliance Status']);
  csvRows.push(['Status', report.overallCompliance]);
  csvRows.push(['']);
  csvRows.push(['Extracted Declarations']);
  csvRows.push(['Field Label', 'Extracted Value', 'Confidence', 'Source']);

  report.extractedDeclarations.forEach((decl) => {
    csvRows.push([
      decl.label,
      decl.value || 'NOT DETECTED',
      decl.confidence ? `${decl.confidence}%` : 'N/A',
      decl.source || 'OCR',
    ]);
  });

  csvRows.push(['']);
  csvRows.push(['Compliance Findings']);
  if (report.complianceFindings && report.complianceFindings.length > 0) {
    csvRows.push(['Requirement', 'Extracted Value', 'Status', 'Confidence', 'Evidence', 'Officer Verification']);
    report.complianceFindings.forEach((finding) => {
      csvRows.push([
        finding.requirementName,
        finding.extractedValue || 'N/A',
        finding.status.toUpperCase().replace('_', ' '),
        finding.confidence ? `${finding.confidence}%` : 'N/A',
        finding.evidence || 'N/A',
        finding.officerVerification?.decision || 'N/A',
      ]);
    });
  } else {
    csvRows.push(['No compliance findings recorded']);
  }

  csvRows.push(['']);
  csvRows.push(['Applicable Requirements']);
  if (report.applicableRequirements && report.applicableRequirements.length > 0) {
    csvRows.push(['Requirement', 'Applicability', 'Result', 'Evidence']);
    report.applicableRequirements.forEach((req) => {
      csvRows.push([
        req.requirementName,
        req.applicability,
        req.result.toUpperCase().replace('_', ' '),
        req.evidence || 'N/A',
      ]);
    });
  } else {
    csvRows.push(['No applicable requirements recorded']);
  }

  csvRows.push(['']);
  csvRows.push(['Measurements']);
  if (report.measurements && report.measurements.length > 0) {
    csvRows.push(['Type', 'Value', 'Unit', 'Location', 'Officer', 'Timestamp']);
    report.measurements.forEach((m) => {
      csvRows.push([
        m.type,
        m.value,
        m.unit,
        m.location || 'N/A',
        m.officerName,
        new Date(m.timestamp).toLocaleString('en-IN'),
      ]);
    });
  } else {
    csvRows.push(['No measurements recorded']);
  }

  csvRows.push(['']);
  csvRows.push(['Officer Observations']);
  if (report.officerObservations && report.officerObservations.length > 0) {
    csvRows.push(['S.No', 'Officer', 'Timestamp', 'Observation']);
    report.officerObservations.forEach((obs, index) => {
      csvRows.push([
        index + 1,
        obs.officerName,
        new Date(obs.timestamp).toLocaleString('en-IN'),
        obs.observation,
      ]);
    });
  } else {
    csvRows.push(['No officer observations recorded']);
  }

  // Join rows with commas and handle special characters
  const csvContent = csvRows.map(row =>
    row.map(cell => {
      const cellStr = String(cell);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Excel Generation using xlsx
export const generateExcelReport = async (report: InspectionReport): Promise<Blob> => {
  // Dynamically import xlsx to avoid SSR issues
  const XLSX = await import('xlsx');

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Report Summary
  const complianceConfig = COMPLIANCE_STATUS_CONFIG[report.overallCompliance] || { label: 'N/A', description: '' };

  const summaryData = [
    ['INSPECTION REPORT'],
    [''],
    ['Report Information', ''],
    ['Report ID', report.id],
    ['Inspection ID', report.inspectionId],
    ['Generated Date', report.generatedAt ? new Date(report.generatedAt).toLocaleString('en-IN') : 'N/A'],
    [''],
    ['Inspection Details', ''],
    ['Product Name', report.productName],
    ['Category', report.productCategory],
    ['Manufacturer', report.productManufacturer],
    ['Packer', report.productPacker || 'N/A'],
    ['Importer', report.productImporter || 'N/A'],
    ['Package Type', report.productPackageType || 'N/A'],
    ['Barcode', report.productBarcode || 'N/A'],
    ['Inspection Date', new Date(report.inspectionDate).toLocaleDateString('en-IN')],
    ['Inspection Location', report.inspectionLocation],
    ['Officer Name', report.officerName],
    ['Office', report.office],
    ['Verification Status', report.verificationStatus],
    [''],
    ['Compliance Status', ''],
    ['Status', complianceConfig.label],
    ['Description', complianceConfig.description],
    ['Overall Compliance', report.overallCompliance],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  wsSummary['!cols'] = [
    { wch: 20 },  // Column A
    { wch: 50 },  // Column B
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Report Summary');

  // Sheet 2: Extracted Declarations
  const declarationsHeader = ['Field Label', 'Extracted Value', 'Confidence', 'Source'];
  const declarationsData = report.extractedDeclarations.map(d => [
    d.label,
    d.value || 'NOT DETECTED',
    d.confidence ? `${d.confidence}%` : 'N/A',
    d.source || 'OCR',
  ]);

  const wsDeclarations = XLSX.utils.aoa_to_sheet([
    ['EXTRACTED DECLARATIONS'],
    [''],
    declarationsHeader,
    ...declarationsData,
  ]);

  wsDeclarations['!cols'] = [
    { wch: 25 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, wsDeclarations, 'Declarations');

  // Sheet 3: Compliance Findings
  if (report.complianceFindings && report.complianceFindings.length > 0) {
    const findingsHeader = ['Requirement', 'Extracted Value', 'Status', 'Confidence', 'Evidence', 'Officer Verification'];
    const findingsData = report.complianceFindings.map(f => [
      f.requirementName,
      f.extractedValue || 'N/A',
      f.status.toUpperCase().replace('_', ' '),
      f.confidence ? `${f.confidence}%` : 'N/A',
      f.evidence || 'N/A',
      f.officerVerification?.decision || 'N/A',
    ]);

    const wsFindings = XLSX.utils.aoa_to_sheet([
      ['COMPLIANCE FINDINGS'],
      [''],
      findingsHeader,
      ...findingsData,
    ]);

    wsFindings['!cols'] = [
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(wb, wsFindings, 'Compliance Findings');
  }

  // Sheet 4: Applicable Requirements
  if (report.applicableRequirements && report.applicableRequirements.length > 0) {
    const requirementsHeader = ['Requirement', 'Applicability', 'Result', 'Evidence'];
    const requirementsData = report.applicableRequirements.map(r => [
      r.requirementName,
      r.applicability,
      r.result.toUpperCase().replace('_', ' '),
      r.evidence || 'N/A',
    ]);

    const wsRequirements = XLSX.utils.aoa_to_sheet([
      ['APPLICABLE REQUIREMENTS'],
      [''],
      requirementsHeader,
      ...requirementsData,
    ]);

    wsRequirements['!cols'] = [
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, wsRequirements, 'Requirements');
  }

  // Sheet 5: Measurements
  if (report.measurements && report.measurements.length > 0) {
    const measurementsHeader = ['Type', 'Value', 'Unit', 'Location', 'Officer', 'Timestamp'];
    const measurementsData = report.measurements.map(m => [
      m.type,
      m.value,
      m.unit,
      m.location || 'N/A',
      m.officerName,
      new Date(m.timestamp).toLocaleString('en-IN'),
    ]);

    const wsMeasurements = XLSX.utils.aoa_to_sheet([
      ['PHYSICAL MEASUREMENTS'],
      [''],
      measurementsHeader,
      ...measurementsData,
    ]);

    wsMeasurements['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(wb, wsMeasurements, 'Measurements');
  }

  // Sheet 6: Officer Observations
  if (report.officerObservations && report.officerObservations.length > 0) {
    const observationsData = report.officerObservations.map((o, index) => [
      index + 1,
      o.officerName,
      new Date(o.timestamp).toLocaleString('en-IN'),
      o.observation,
    ]);

    const wsObservations = XLSX.utils.aoa_to_sheet([
      ['OFFICER OBSERVATIONS'],
      [''],
      ['S.No', 'Officer', 'Timestamp', 'Observation'],
      ...observationsData,
    ]);

    wsObservations['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 25 },
      { wch: 60 },
    ];

    XLSX.utils.book_append_sheet(wb, wsObservations, 'Observations');
  }

  // Sheet 7: Metadata
  const metadataData = [
    ['INSPECTION METADATA'],
    [''],
    ['Field', 'Value'],
    ['Report ID', report.id],
    ['Inspection ID', report.inspectionId],
    ['Product', report.productName],
    ['Category', report.productCategory],
    ['Location', report.inspectionLocation],
    ['Officer', report.officerName],
    ['Office', report.office],
    ['Report Status', report.status],
    ['Overall Compliance', report.overallCompliance],
    ['Generated At', report.generatedAt ? new Date(report.generatedAt).toLocaleString('en-IN') : 'N/A'],
    [''],
    ['Document Information'],
    ['Generated By', 'Metrology Inspection System'],
    ['Generation Date', new Date().toISOString()],
    ['Version', '1.0'],
  ];

  const wsMetadata = XLSX.utils.aoa_to_sheet(metadataData);
  wsMetadata['!cols'] = [
    { wch: 20 },
    { wch: 50 },
  ];

  XLSX.utils.book_append_sheet(wb, wsMetadata, 'Metadata');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Download helper functions
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadPDF = async (report: InspectionReport) => {
  const blob = await generatePDFReport(report);
  const filename = `Inspection_Report_${report.inspectionId}_${formatDateForFilename(new Date())}.pdf`;
  downloadBlob(blob, filename);
};

export const downloadExcel = async (report: InspectionReport) => {
  const blob = await generateExcelReport(report);
  const filename = `Inspection_Report_${report.inspectionId}_${formatDateForFilename(new Date())}.xlsx`;
  downloadBlob(blob, filename);
};

export const downloadCSV = async (report: InspectionReport) => {
  const blob = await generateCSVReport(report);
  const filename = `Inspection_Report_${report.inspectionId}_${formatDateForFilename(new Date())}.csv`;
  downloadBlob(blob, filename);
};

// Helper function to format date for filename
const formatDateForFilename = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '');
};

// Print PDF directly
export const printPDF = async (report: InspectionReport) => {
  const blob = await generatePDFReport(report);
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
