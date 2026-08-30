import React, { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminService } from '../../services/admin.service';
import { AdminLocation, AdminLocationLevel } from '../../types/admin';
import { Loading } from '../../components/Loading';

const LEVEL_COLORS: Record<AdminLocationLevel, { marker: string; text: string }> = {
  country: { marker: '#1e40af', text: '#1e40af' },
  state: { marker: '#3b82f6', text: '#1e40af' },
  district: { marker: '#60a5fa', text: '#1e40af' },
  market: { marker: '#93c5fd', text: '#3b82f6' },
  retail: { marker: '#bfdbfe', text: '#2563eb' },
};

function makeMarker(level: AdminLocationLevel, size = 12): L.DivIcon {
  const color = LEVEL_COLORS[level].marker;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

const LEVEL_LABELS: Record<AdminLocationLevel, string> = {
  country: 'Country',
  state: 'State',
  district: 'District',
  market: 'Market',
  retail: 'Retail Location',
};

const METRIC_ICONS: Record<string, string> = {
  inspectionCount: '🔍',
  complaintCount: '📋',
  potentialIssues: '⚠️',
  repeatLocations: '🔁',
  pendingInspections: '⏳',
};

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const AdminGeography: React.FC = () => {
  const [tree, setTree] = useState<AdminLocation[]>([]);
  const [selected, setSelected] = useState<AdminLocation | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getLocationTree();
      setTree(data);
      // Select India by default
      const india = data.find(n => n.level === 'country');
      if (india) {
        setSelected(india);
        setBreadcrumb([{ id: india.id, name: india.name }]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ---- Initialize Leaflet map ---- */
  useEffect(() => {
    if (loading || !containerRef.current) return;

    const initMap = () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      const container = containerRef.current;
      if (!container) return;

      const map = L.map('adm-geo-map', {
        center: [22.5937, 78.9629],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
    };

    // Wait for DOM
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [loading]);

  /* ---- Render markers whenever tree or selected changes ---- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const addMarkers = (nodes: AdminLocation[]) => {
      nodes.forEach(node => {
        if (node.lat == null || node.lng == null) return;
        const marker = L.marker([node.lat, node.lng], {
          icon: makeMarker(node.level, node.level === 'country' ? 16 : node.level === 'state' ? 12 : 10),
        });
        marker.bindTooltip(node.name, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          setSelected(node);
          const crumbs: BreadcrumbItem[] = [];
          let current: AdminLocation | undefined = node;
          while (current) {
            crumbs.unshift({ id: current.id, name: current.name });
            // find parent
            const findParent = (ns: AdminLocation[], pid?: string): AdminLocation | undefined => {
              for (const n of ns) {
                if (n.id === pid) return n;
                if (n.children) { const f = findParent(n.children, pid); if (f) return f; }
              }
              return undefined;
            };
            current = current.parentId ? findParent(tree, current.parentId) : undefined;
          }
          setBreadcrumb(crumbs);

          // Pan to location
          map.flyTo([node.lat, node.lng], node.level === 'country' ? 4 : node.level === 'state' ? 6 : node.level === 'district' ? 8 : 10);
        });
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    };

    addMarkers(tree);
  }, [tree, loading]);

  const handleChildClick = useCallback((child: AdminLocation) => {
    setSelected(child);
    const crumbs: BreadcrumbItem[] = [...breadcrumb];
    const existing = crumbs.findIndex(c => c.id === child.id);
    if (existing >= 0) {
      setBreadcrumb(crumbs.slice(0, existing + 1));
    } else {
      crumbs.push({ id: child.id, name: child.name });
      setBreadcrumb(crumbs);
    }
    // Pan map
    if (mapRef.current && child.lat != null && child.lng != null) {
      mapRef.current.flyTo([child.lat, child.lng], child.level === 'state' ? 6 : child.level === 'district' ? 8 : child.level === 'market' ? 10 : 12);
    }
  }, [breadcrumb, tree]);

  if (loading) return <Loading text="Loading geographic data..." fullPage />;

  const metrics = selected?.metrics;
  const children = selected?.children || [];

  return (
    <div className="adm-geo">
      <header className="adm-geo__header">
        <div>
          <h1 className="adm-geo__title">Geographic Monitoring</h1>
          <p className="adm-geo__subtitle">
            Hierarchical view of inspection and complaint activity across India.
          </p>
        </div>
      </header>

      <div className="adm-geo__layout">
        {/* Hierarchy sidebar */}
        <aside className="adm-geo__hierarchy">
          {/* Breadcrumb */}
          <nav className="adm-geo__breadcrumb" aria-label="Location breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                {i > 0 && <span className="adm-geo__crumb-sep">›</span>}
                <button
                  className={`adm-geo__crumb ${i === breadcrumb.length - 1 ? 'adm-geo__crumb--active' : ''}`}
                  onClick={() => {
                    setSelected(tree.find(n => n.id === crumb.id) || null);
                    setBreadcrumb(breadcrumb.slice(0, i + 1));
                  }}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* Location detail */}
          {selected ? (
            <div className="adm-geo__detail">
              <div className="adm-geo__detail-header">
                <span className="adm-geo__level-badge" style={{ color: LEVEL_COLORS[selected.level].text, background: `${LEVEL_COLORS[selected.level].marker}20` }}>
                  {LEVEL_LABELS[selected.level]}
                </span>
                <h2 className="adm-geo__detail-name">{selected.name}</h2>
              </div>

              {metrics && (
                <div className="adm-geo__metrics">
                  {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="adm-geo__metric">
                      <span className="adm-geo__metric-icon">{METRIC_ICONS[key] || '📊'}</span>
                      <div className="adm-geo__metric-info">
                        <span className="adm-geo__metric-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                        <span className="adm-geo__metric-value">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected.lastInspection && (
                <p className="adm-geo__last">
                  Last inspection: <strong>{new Date(selected.lastInspection).toLocaleDateString()}</strong>
                </p>
              )}
            </div>
          ) : (
            <p className="adm-geo__no-selection">Select a location on the map or list.</p>
          )}

          {/* Children list */}
          {children.length > 0 && (
            <div className="adm-geo__children">
              <h3 className="adm-geo__children-title">
                Sub-locations ({children.length})
              </h3>
              <ul className="adm-geo__child-list">
                {children.map(child => (
                  <li key={child.id}>
                    <button
                      className="adm-geo__child"
                      onClick={() => handleChildClick(child)}
                    >
                      <span
                        className="adm-geo__child-dot"
                        style={{ background: LEVEL_COLORS[child.level].marker }}
                      />
                      <div className="adm-geo__child-info">
                        <span className="adm-geo__child-name">{child.name}</span>
                        <span className="adm-geo__child-level">{LEVEL_LABELS[child.level]}</span>
                      </div>
                      {child.metrics && (
                        <div className="adm-geo__child-counts">
                          <span title="Inspections">{child.metrics.inspectionCount} 🔍</span>
                          {child.metrics.potentialIssues > 0 && (
                            <span className="adm-geo__child-issues" title="Potential issues">{child.metrics.potentialIssues} ⚠️</span>
                          )}
                        </div>
                      )}
                      <span className="adm-geo__child-arrow">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children.length === 0 && selected && (
            <p className="adm-geo__no-children">No sub-locations in mock data.</p>
          )}
        </aside>

        {/* Map */}
        <div className="adm-geo__map-container">
          <div id="adm-geo-map" ref={containerRef} className="adm-geo__map" />
          <div className="adm-geo__map-legend">
            <div className="adm-geo__legend-title">Location Levels</div>
            {(Object.keys(LEVEL_COLORS) as AdminLocationLevel[]).map(level => (
              <div key={level} className="adm-geo__legend-item">
                <span className="adm-geo__legend-dot" style={{ background: LEVEL_COLORS[level].marker }} />
                <span>{LEVEL_LABELS[level]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminGeographyStyles />
    </div>
  );
};

const AdminGeographyStyles: React.FC = () => (
  <style>{`
    .adm-geo {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      height: calc(100vh - var(--admin-header-height, 64px));
      box-sizing: border-box;
    }

    .adm-geo__header {
      flex-shrink: 0;
    }

    .adm-geo__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: #0f172a;
      margin: 0 0 var(--space-1) 0;
    }

    .adm-geo__subtitle {
      font-size: var(--font-size-sm);
      color: #475569;
      margin: 0;
    }

    .adm-geo__layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: var(--space-4);
      flex: 1;
      min-height: 0;
    }

    /* Hierarchy sidebar */
    .adm-geo__hierarchy {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-lg);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .adm-geo__breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-1);
    }

    .adm-geo__crumb-sep {
      color: #94a3b8;
      font-size: 14px;
    }

    .adm-geo__crumb {
      background: none;
      border: none;
      color: #3b82f6;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      padding: 2px var(--space-1);
      border-radius: var(--radius-sm);
      font-family: inherit;
    }

    .adm-geo__crumb:hover {
      background: #eff6ff;
    }

    .adm-geo__crumb--active {
      color: #1e40af;
      font-weight: var(--font-weight-bold);
      cursor: default;
    }

    .adm-geo__crumb--active:hover {
      background: none;
    }

    .adm-geo__detail-header {
      margin-bottom: var(--space-3);
    }

    .adm-geo__level-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-1);
    }

    .adm-geo__detail-name {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: #0f172a;
      margin: 0;
    }

    .adm-geo__metrics {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .adm-geo__metric {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background: #f8fafc;
      border-radius: var(--radius-md);
    }

    .adm-geo__metric-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .adm-geo__metric-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .adm-geo__metric-label {
      font-size: var(--font-size-xs);
      color: #475569;
    }

    .adm-geo__metric-value {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: #0f172a;
    }

    .adm-geo__last {
      font-size: var(--font-size-xs);
      color: #64748b;
      margin: 0;
    }

    .adm-geo__no-selection,
    .adm-geo__no-children {
      font-size: var(--font-size-sm);
      color: #94a3b8;
      font-style: italic;
      margin: 0;
    }

    .adm-geo__children-title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: var(--space-2) 0 var(--space-2) 0;
    }

    .adm-geo__child-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .adm-geo__child {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-2);
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: all var(--transition-fast);
    }

    .adm-geo__child:hover {
      background: #f8fafc;
      border-color: #e2e8f0;
    }

    .adm-geo__child-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .adm-geo__child-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .adm-geo__child-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: #0f172a;
    }

    .adm-geo__child-level {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .adm-geo__child-counts {
      display: flex;
      gap: var(--space-2);
      font-size: 11px;
      color: #64748b;
      flex-shrink: 0;
    }

    .adm-geo__child-issues {
      color: #dc2626;
      font-weight: var(--font-weight-semibold);
    }

    .adm-geo__child-arrow {
      color: #cbd5e1;
      font-size: var(--font-size-sm);
    }

    /* Map */
    .adm-geo__map-container {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid #e2e8f0;
      min-height: 400px;
    }

    .adm-geo__map {
      width: 100%;
      height: 100%;
      min-height: 400px;
    }

    .adm-geo__map-legend {
      position: absolute;
      bottom: var(--space-4);
      right: var(--space-4);
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      z-index: 1000;
      min-width: 140px;
    }

    .adm-geo__legend-title {
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--space-2);
    }

    .adm-geo__legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 12px;
      color: #475569;
      margin-bottom: 4px;
    }

    .adm-geo__legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    @media (max-width: 1023px) {
      .adm-geo__layout {
        grid-template-columns: 1fr;
        height: auto;
      }
      .adm-geo__map {
        height: 320px;
      }
    }

    @media (max-width: 768px) {
      .adm-geo {
        padding: var(--space-4);
        height: auto;
      }
    }
  `}</style>
);

export default AdminGeography;
