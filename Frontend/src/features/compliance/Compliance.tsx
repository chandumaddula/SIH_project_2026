import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';

interface IndividualCheck {
  field: string;
  rule_id: string;
  status: 'PASS' | 'REVIEW_REQUIRED' | 'POTENTIAL_VIOLATION' | 'EXEMPTED';
  confidence: number;
  message: string;
  legal_clause: string;
  extracted_value?: string;
  evidence?: {
    image_path: string;
    bounding_box: [number, number, number, number];
    ocr_raw_snippet: string;
  };
}

interface ComplianceReportData {
  scan_id: string;
  overall_status: 'PASS' | 'REVIEW_REQUIRED' | 'POTENTIAL_VIOLATION';
  compliance_score: number;
  summary: {
    total_checks: number;
    passed: number;
    review_required: number;
    potential_violations: number;
    exempted: number;
  };
  checks: IndividualCheck[];
  timestamp: string;
}

export const Compliance: React.FC = () => {
  const [report, setReport] = useState<ComplianceReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'PASS' | 'REVIEW_REQUIRED' | 'POTENTIAL_VIOLATION'>('all');
  const [selectedCheck, setSelectedCheck] = useState<IndividualCheck | null>(null);
  const [officerDecision, setOfficerDecision] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setReport({
        scan_id: 'SCAN-2026-0891',
        overall_status: 'REVIEW_REQUIRED',
        compliance_score: 87.5,
        summary: {
          total_checks: 8,
          passed: 6,
          review_required: 1,
          potential_violations: 1,
          exempted: 0
        },
        timestamp: new Date().toISOString(),
        checks: [
          {
            field: 'mrp',
            rule_id: 'MRP-001',
            status: 'PASS',
            confidence: 0.97,
            message: "MRP is declared as '₹ 240.00 (Inclusive of all taxes)'.",
            legal_clause: 'Legal Metrology Rules 2011 - Rule 6(1)(e)',
            extracted_value: '₹ 240.00 (Inclusive of all taxes)',
            evidence: {
              image_path: '/static/scans/sample_oil.jpg',
              bounding_box: [50, 100, 300, 150],
              ocr_raw_snippet: 'MRP Rs 240.00 (Incl. of all taxes)'
            }
          },
          {
            field: 'net_quantity',
            rule_id: 'QTY-001',
            status: 'PASS',
            confidence: 0.96,
            message: "Net Quantity statement is detected as '1 L'.",
            legal_clause: 'Legal Metrology Rules 2011 - Rule 6(1)(c)',
            extracted_value: '1 L',
            evidence: {
              image_path: '/static/scans/sample_oil.jpg',
              bounding_box: [50, 160, 250, 195],
              ocr_raw_snippet: 'Net Qty: 1 L (1000 ml)'
            }
          },
          {
            field: 'manufacturer',
            rule_id: 'PC-001',
            status: 'PASS',
            confidence: 0.92,
            message: "Manufacturer legal name declared as 'Fresh Farms Ltd.'.",
            legal_clause: 'Legal Metrology Rules 2011 - Rule 6(1)(a)',
            extracted_value: 'Fresh Farms Ltd., Industrial Area Phase II, Delhi - 110001',
            evidence: {
              image_path: '/static/scans/sample_oil.jpg',
              bounding_box: [50, 200, 450, 250],
              ocr_raw_snippet: 'Mfd by Fresh Farms Ltd., Delhi'
            }
          },
          {
            field: 'consumer_care',
            rule_id: 'PC-005',
            status: 'REVIEW_REQUIRED',
            confidence: 0.68,
            message: 'Consumer Care telephone helpline present, but missing email address.',
            legal_clause: 'Legal Metrology Rules 2011 - Rule 6(1)(f)',
            extracted_value: 'Tel: 1800-120-1234',
            evidence: {
              image_path: '/static/scans/sample_oil.jpg',
              bounding_box: [50, 260, 350, 300],
              ocr_raw_snippet: 'Consumer Care Tel: 1800-120-1234'
            }
          },
          {
            field: 'unit_sale_symbol',
            rule_id: 'QTY-002',
            status: 'POTENTIAL_VIOLATION',
            confidence: 0.89,
            message: "Non-standard unit symbol 'gm' detected on net content declaration.",
            legal_clause: 'Legal Metrology Rules 2011 - Rule 6(1)(c) & Schedule II',
            extracted_value: '500 gm',
            evidence: {
              image_path: '/static/scans/sample_oil.jpg',
              bounding_box: [50, 310, 200, 340],
              ocr_raw_snippet: 'Net Wt: 500 gm'
            }
          },
          {
            field: 'mfg_date',
            rule_id: 'DATE-001',
            status: 'PASS',
            confidence: 0.94,
            message: "Month and Year of packing declared as '06/2024'.",
            legal_clause: 'Legal Metrology Rules 2011 - Rule 6(1)(d)',
            extracted_value: '06/2024',
            evidence: {
              image_path: '/static/scans/sample_oil.jpg',
              bounding_box: [50, 350, 220, 380],
              ocr_raw_snippet: 'Pkg Date: 06/2024'
            }
          }
        ]
      });
      setLoading(false);
    }, 400);
  }, []);

  const handleOfficerReview = (decision: string) => {
    setOfficerDecision(decision);
    alert(`Officer Decision Recorded: ${decision} for ${report?.scan_id}`);
  };

  const handleDownloadPDF = () => {
    window.open('/api/v1/reports/inspection/1/pdf', '_blank');
  };

  const handleGenerateNotice = () => {
    window.open('/api/v1/reports/inspection/1/notice', '_blank');
  };

  const filteredChecks = report?.checks.filter(c => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  }) || [];

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '24px 28px',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
        borderLeft: '5px solid #2563eb',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '0.2px' }}>
            Legal Metrology Compliance Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#ffffff', fontSize: '14px', margin: '6px 0 0', fontWeight: 400, opacity: 0.95 }}>
            Explainable Rule Engine audit trails, visual evidence verification & officer review portal
          </p>
        </div>

        {/* Phase 8 Download & Notice Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
            📄 Download Inspection PDF
          </Button>
          <Button variant="primary" size="sm" onClick={handleGenerateNotice}>
            ⚖️ Issue Legal Notice (Sec 15/49)
          </Button>
        </div>
      </div>

      {loading || !report ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#ffffff' }}>
          Loading Phase 7 Rule Engine findings...
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <Card accentColor="primary" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <CardBody style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>OVERALL SCORE</span>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                  {report.compliance_score}%
                </div>
                <Badge variant={report.overall_status === 'PASS' ? 'success' : (report.overall_status === 'REVIEW_REQUIRED' ? 'warning' : 'error')}>
                  {report.overall_status.replace('_', ' ')}
                </Badge>
              </CardBody>
            </Card>

            <Card accentColor="primary" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <CardBody style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL CHECKS</span>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {report.summary.total_checks}
                </div>
                <span style={{ fontSize: '12px', color: '#ffffff', opacity: 0.9 }}>Authoritative Rules</span>
              </CardBody>
            </Card>

            <Card accentColor="success" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <CardBody style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>PASSED</span>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                  {report.summary.passed}
                </div>
                <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>Compliant Rules</span>
              </CardBody>
            </Card>

            <Card accentColor="warning" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <CardBody style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>REVIEW REQUIRED</span>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                  {report.summary.review_required}
                </div>
                <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>Officer Review</span>
              </CardBody>
            </Card>

            <Card accentColor="error" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <CardBody style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>POTENTIAL VIOLATIONS</span>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                  {report.summary.potential_violations}
                </div>
                <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>Non-Compliant</span>
              </CardBody>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {(['all', 'PASS', 'REVIEW_REQUIRED', 'POTENTIAL_VIOLATION'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  background: activeTab === tab ? '#2563eb' : '#1e293b',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                {tab === 'all' ? 'All Checks' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Checks List & Evidence Drawer */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedCheck ? '1fr 420px' : '1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredChecks.map(check => (
                <Card
                  key={check.rule_id}
                  style={{
                    background: '#1e293b',
                    borderColor: '#334155',
                    borderLeft: `5px solid ${check.status === 'PASS' ? '#16a34a' : (check.status === 'REVIEW_REQUIRED' ? '#f59e0b' : '#dc2626')}`,
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedCheck(check)}
                >
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {check.field.replace('_', ' ')} ({check.rule_id})
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0', color: '#ffffff' }}>
                          {check.legal_clause}
                        </h4>
                      </div>
                      <Badge variant={check.status === 'PASS' ? 'success' : (check.status === 'REVIEW_REQUIRED' ? 'warning' : 'error')}>
                        {check.status.replace('_', ' ')} ({(check.confidence * 100).toFixed(0)}%)
                      </Badge>
                    </div>

                    <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '8px', lineHeight: 1.5 }}>{check.message}</p>

                    {check.extracted_value && (
                      <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px', color: '#ffffff' }}>
                        <strong style={{ color: '#ffffff' }}>Detected Value:</strong> <code style={{ color: '#38bdf8', fontWeight: 700 }}>{check.extracted_value}</code>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Evidence & Officer Review Sidebar */}
            {selectedCheck && (
              <Card style={{ position: 'sticky', top: '20px', height: 'fit-content', background: '#1e293b', borderColor: '#334155' }}>
                <CardHeader style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle style={{ color: '#ffffff' }}>Traceable Evidence Details</CardTitle>
                    <button onClick={() => setSelectedCheck(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#ffffff', fontSize: '16px' }}>✕</button>
                  </div>
                </CardHeader>
                <CardBody style={{ padding: '16px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>RULE REFERENCE</label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>{selectedCheck.legal_clause}</div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>AI OCR CONFIDENCE SCORE</label>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>{(selectedCheck.confidence * 100).toFixed(1)}%</div>
                  </div>

                  {selectedCheck.evidence && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>EVIDENCE BOUNDING BOX & SNIPPET</label>
                      <div style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', marginTop: '4px', border: '1px solid #334155' }}>
                        <div style={{ color: '#ffffff' }}>BBOX: [{selectedCheck.evidence.bounding_box.join(', ')}]</div>
                        <div style={{ color: '#38bdf8', marginTop: '4px' }}>RAW OCR: "{selectedCheck.evidence.ocr_raw_snippet}"</div>
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>OFFICER REVIEW DECISION</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Button variant="primary" size="sm" onClick={() => handleOfficerReview('APPROVED')}>
                        ✓ Approve Compliance
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOfficerReview('NOTICE_ISSUED')} style={{ color: '#ffffff', borderColor: '#cbd5e1' }}>
                        ⚠️ Issue Statutory Legal Notice
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOfficerReview('PENALIZED')} style={{ color: '#f87171' }}>
                        ✕ Flag Violation & Penalty
                      </Button>
                    </div>
                    {officerDecision && (
                      <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', borderRadius: '4px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                        Recorded Decision: {officerDecision}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Compliance;