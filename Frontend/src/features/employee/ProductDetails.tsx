/* ==========================================================================
   Product Details Page
   Task M — Product Repository

   Detailed view of a single product with:
   - Product information (name, manufacturer, category, etc.)
   - Compliance summary
   - Inspection history
   - Evidence summary
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Product } from '../../types/product';
import {
  getProductById,
  getProductInspections,
  getOfficerName,
} from '../../services/product.service';
import { InspectionRecord, COMPLIANCE_STATUS_CONFIG, VERIFICATION_STATUS_CONFIG } from '../../services/inspection.service';

export const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [product, setProduct] = useState<Product | null>(null);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);

  useEffect(() => {
    if (!productId) return;
    setTimeout(() => {
      const p = getProductById(productId);
      if (p) {
        setProduct(p);
        setInspections(getProductInspections(productId));
        setPhase('done');
      } else {
        setPhase('error');
      }
    }, 300);
  }, [productId]);

  if (phase === 'loading') {
    return (
      <div className="page pd-page">
        <h1 className="page-title">Product Details</h1>
        <p className="page-subtitle">Loading product details...</p>
        <div className="pd-loading"><div className="pd-spinner" /><p>Loading product details...</p></div>
        <style>{pdStyles}</style>
      </div>
    );
  }

  if (phase === 'error' || !product) {
    return (
      <div className="page pd-page">
        <h1 className="page-title">Product Details</h1>
        <p className="page-subtitle">Unable to load product.</p>
        <Card><CardBody>
          <div className="pd-error">
            <p>Unable to load product details.</p>
            <div className="pd-error__actions">
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
              <Button variant="ghost" onClick={() => navigate('/employee/products')}>Back to list</Button>
            </div>
          </div>
        </CardBody></Card>
        <style>{pdStyles}</style>
      </div>
    );
  }

  const statusCfg = COMPLIANCE_STATUS_CONFIG[product.complianceStatus];
  const verCfg = VERIFICATION_STATUS_CONFIG[product.verificationStatus];

  return (
    <div className="page pd-page">
      <div className="pd-header">
        <div>
          <button className="pd-back" onClick={() => navigate('/employee/products')}>← Back to products</button>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">{product.manufacturer} — {product.category}</p>
        </div>
        <div className="pd-header__badges">
          <Badge variant={statusCfg.badge as any} size="md">{statusCfg.label}</Badge>
          <Badge variant={verCfg.badge as any} size="md">{verCfg.label}</Badge>
        </div>
      </div>

      <div className="pd-grid">
        <div className="pd-main">
          {/* Product info */}
          <Card>
            <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
            <CardBody>
              <div className="pd-info">
                <div className="pd-info__row"><span>Product Name</span><strong>{product.name}</strong></div>
                {product.genericDescription && (
                  <div className="pd-info__row pd-info__row--block">
                    <span>Generic Description</span>
                    <p>{product.genericDescription}</p>
                  </div>
                )}
                <div className="pd-info__row"><span>Manufacturer</span><strong>{product.manufacturer}</strong></div>
                {product.packer && <div className="pd-info__row"><span>Packer</span><span>{product.packer}</span></div>}
                {product.importer && <div className="pd-info__row"><span>Importer</span><span>{product.importer}</span></div>}
                <div className="pd-info__row"><span>Category</span><span>{product.category}</span></div>
                {product.packageType && <div className="pd-info__row"><span>Package Type</span><span>{product.packageType}</span></div>}
                {product.barcode && <div className="pd-info__row"><span>Barcode</span><code className="pd-id-inline">{product.barcode}</code></div>}
                {product.countryOfOrigin && <div className="pd-info__row"><span>Country of Origin</span><span>{product.countryOfOrigin}</span></div>}
                <div className="pd-info__row"><span>Last Inspection</span><span>{product.lastInspectionDate ? new Date(product.lastInspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span></div>
                <div className="pd-info__row"><span>Inspection Count</span><Badge variant="info" size="sm">{product.inspectionCount}</Badge></div>
              </div>
            </CardBody>
          </Card>

          {/* Inspection history */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
              <Badge variant="info" size="sm">{inspections.length} inspection(s)</Badge>
            </CardHeader>
            <CardBody>
              {inspections.length === 0 ? (
                <p className="pd-empty-inline">No inspections found for this product.</p>
              ) : (
                <div className="pd-table-wrapper">
                  <table className="pd-table">
                    <thead>
                      <tr>
                        <th>Inspection ID</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Officer</th>
                        <th>Status</th>
                        <th>Verification</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.map(i => {
                        const comp = COMPLIANCE_STATUS_CONFIG[i.complianceStatus];
                        const ver = VERIFICATION_STATUS_CONFIG[i.verificationStatus];
                        return (
                          <tr key={i.id}>
                            <td><code className="pd-id-inline">{i.id}</code></td>
                            <td>{new Date(i.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td>{i.location}</td>
                            <td>{getOfficerName(i.inspectorId)}</td>
                            <td><Badge variant={comp.badge as any} size="sm">{comp.label}</Badge></td>
                            <td><Badge variant={ver.badge as any} size="sm">{ver.label}</Badge></td>
                            <td><Button variant="ghost" size="sm" onClick={() => navigate(`/employee/inspections/${i.id}`)}>View</Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Evidence summary */}
          <Card>
            <CardHeader><CardTitle>Evidence Summary</CardTitle></CardHeader>
            <CardBody>
              <div className="pd-evidence">
                <div className="pd-evidence__row">
                  <span className="pd-evidence__label">Package Images</span>
                  <span className="pd-evidence__count">{inspections.length} inspection set(s)</span>
                </div>
                <div className="pd-evidence__row">
                  <span className="pd-evidence__label">Additional Evidence</span>
                  <span className="pd-evidence__count">{product.inspectionCount} inspection record(s)</span>
                </div>
                <div className="pd-evidence__row">
                  <span className="pd-evidence__label">Measurement Evidence</span>
                  <span className="pd-evidence__count">From inspections</span>
                </div>
                <div className="pd-evidence__actions">
                  <Button variant="primary" size="sm" onClick={() => navigate('/employee/inspection/evidence')}>
                    View Evidence
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="pd-sidebar">
          <Card>
            <CardHeader><CardTitle>Compliance Summary</CardTitle></CardHeader>
            <CardBody>
              <div className="pd-comp">
                <div className="pd-comp__row pd-comp__row--pass">
                  <span>PASS</span>
                  <strong>{product.passCount}</strong>
                </div>
                <div className="pd-comp__row pd-comp__row--review">
                  <span>REVIEW REQUIRED</span>
                  <strong>{product.reviewRequiredCount}</strong>
                </div>
                <div className="pd-comp__row pd-comp__row--issue">
                  <span>POTENTIAL ISSUE</span>
                  <strong>{product.potentialIssueCount}</strong>
                </div>
                <p className="pd-comp__note">
                  These represent screening / finding states. Final findings require officer verification.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardBody>
              <div className="pd-side-actions">
                <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/employee/inspections')}>View All Inspections</Button>
                <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/employee/reports')}>View Reports</Button>
                <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/employee/products')}>Back to List</Button>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>

      <style>{pdStyles}</style>
    </div>
  );
};

export default ProductDetails;

const pdStyles = `
  .pd-page { max-width: 1280px; margin: 0 auto; }
  .pd-back { background: none; border: none; color: var(--color-navy-500); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); cursor: pointer; padding: 0; margin-bottom: var(--space-2); }
  .pd-back:hover { color: var(--color-navy-700); text-decoration: underline; }
  .pd-id-inline { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .pd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3); flex-wrap: wrap; }
  .pd-header__badges { display: flex; gap: var(--space-2); }

  .pd-grid { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-4); align-items: flex-start; }
  .pd-main { display: flex; flex-direction: column; gap: var(--space-3); }
  .pd-sidebar { display: flex; flex-direction: column; gap: var(--space-3); }
  @media (max-width: 900px) { .pd-grid { grid-template-columns: 1fr; } }

  .pd-info { display: flex; flex-direction: column; gap: var(--space-2); }
  .pd-info__row { display: flex; justify-content: space-between; align-items: flex-start; font-size: var(--font-size-sm); padding: var(--space-1) 0; }
  .pd-info__row span:first-child { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; flex-shrink: 0; margin-right: var(--space-2); }
  .pd-info__row--block { flex-direction: column; align-items: stretch; gap: var(--space-1); }
  .pd-info__row--block p { margin: 0; color: var(--color-gray-800); line-height: 1.5; }

  .pd-table-wrapper { overflow-x: auto; }
  .pd-table { width: 100%; border-collapse: collapse; }
  .pd-table th, .pd-table td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .pd-table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
  .pd-table tr:hover { background: var(--color-gray-50); }

  .pd-evidence { display: flex; flex-direction: column; gap: var(--space-2); }
  .pd-evidence__row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-100); }
  .pd-evidence__label { font-size: var(--font-size-sm); color: var(--color-gray-700); }
  .pd-evidence__count { font-size: var(--font-size-sm); color: var(--color-navy-700); font-weight: var(--font-weight-semibold); }
  .pd-evidence__actions { margin-top: var(--space-2); }

  .pd-comp { display: flex; flex-direction: column; gap: var(--space-2); }
  .pd-comp__row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); }
  .pd-comp__row--pass { background: var(--color-success-100); color: var(--color-success-600); }
  .pd-comp__row--review { background: var(--color-warning-100); color: var(--color-warning-600); }
  .pd-comp__row--issue { background: var(--color-error-100); color: var(--color-error-600); }
  .pd-comp__row strong { font-size: var(--font-size-lg); }
  .pd-comp__note { font-size: 11px; color: var(--color-gray-500); font-style: italic; margin: 0; padding-top: var(--space-2); border-top: 1px solid var(--color-gray-200); }

  .pd-side-actions { display: flex; flex-direction: column; gap: var(--space-2); }

  .pd-empty-inline { color: var(--color-gray-500); font-size: var(--font-size-sm); margin: 0; text-align: center; padding: var(--space-3) 0; }
  .pd-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .pd-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: pd-spin 0.8s linear infinite; }
  @keyframes pd-spin { to { transform: rotate(360deg); } }
  .pd-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .pd-error p { color: var(--color-gray-600); margin: 0; }
  .pd-error__actions { display: flex; gap: var(--space-2); }
`;
