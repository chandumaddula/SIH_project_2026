import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ComplianceResult } from '../../types/compliance';
import { mockComplianceResults } from '../../services/mockData';

type FilterType = 'all' | 'compliant' | 'non-compliant' | 'missing';

export const Compliance: React.FC = () => {
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setComplianceResults(mockComplianceResults);
      setLoading(false);
    }, 500);
  }, []);

  const filteredResults = complianceResults.filter((result) => {
    if (filter === 'all') return true;
    if (filter === 'compliant') return result.compliant;
    if (filter === 'non-compliant') return !result.compliant;
    if (filter === 'missing') return result.missingInfo.length > 0;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Compliance Results</h1>
        <p className="page-subtitle">View compliance results from scanned/inspected packages</p>
      </div>

      {/* Filter Controls */}
      <div className="compliance__filters">
        <span className="compliance__filters-label">Filter:</span>
        <div className="compliance__filters-buttons">
          {(['all', 'compliant', 'non-compliant', 'missing'] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`compliance__filter-btn ${filter === f ? 'compliance__filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading compliance results...</span>
        </div>
      ) : filteredResults.length === 0 ? (
        <EmptyState
          title="No compliance results"
          description={filter === 'all' ? 'Compliance results will appear here after inspections' : `No ${filter} results found`}
        />
      ) : (
        <div className="compliance__grid">
          {filteredResults.map((result) => (
            <Card
              key={result.id}
              className={`compliance__card ${result.compliant ? 'compliance__card--compliant' : 'compliance__card--non-compliant'}`}
              accentColor={result.compliant ? 'success' : 'error'}
            >
              <CardHeader>
                <div className="compliance__card-header">
                  <CardTitle>{result.product}</CardTitle>
                  <Badge variant={result.compliant ? 'success' : 'error'}>
                    {result.compliant ? 'Compliant' : 'Non-Compliant'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="compliance__card-meta">
                  <div>
                    <span className="compliance__card-label">Inspected:</span>
                    <span className="compliance__card-value">
                      {new Date(result.inspectedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="compliance__card-label">Inspector:</span>
                    <span className="compliance__card-value">{result.inspector}</span>
                  </div>
                </div>

                {result.missingInfo.length > 0 && (
                  <div className="compliance__card-missing">
                    <span className="compliance__card-label">Missing Info:</span>
                    <div className="compliance__card-missing-badges">
                      {result.missingInfo.map((info) => (
                        <Badge key={info} variant="error" size="sm">
                          {info}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.notes && (
                  <div className="compliance__card-notes">
                    <span className="compliance__card-label">Notes:</span>
                    <p className="compliance__card-notes-text">{result.notes}</p>
                  </div>
                )}

                <div className="compliance__card-actions">
                  <Button variant="ghost" size="sm" fullWidth={true}>
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Compliance;