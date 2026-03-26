import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common/Sidebar';
import { Spinner, EmptyState } from '../../components/common';
import { formatDate, statusLabel, statusPill, DEPARTMENTS } from '../../utils/helpers';
import api from '../../utils/api';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'partially_cleared', label: 'Partial Clearance' },
  { value: 'fully_cleared', label: 'Fully Cleared' },
  { value: 'refund_processed', label: 'Refund Processed' },
  { value: 'on_hold', label: 'On Hold' },
];

export default function AdminApplications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [deptF, setDeptF] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusF) params.set('status', statusF);
      if (deptF) params.set('department', deptF);
      const r = await api.get(`/application/all?${params}`);
      setApps(r.data.applications);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusF, deptF, page]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const clearanceBar = app => {
    const types = ['library', 'sports', 'department', 'accounts'];
    if (app.isHosteller) types.splice(2, 0, 'hostel');
    const cleared = types.filter(t => app.clearances[t]?.status === 'cleared').length;
    const pct = Math.round((cleared / types.length) * 100);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
        <div
          style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: pct === 100 ? 'var(--success)' : 'var(--gold)',
              borderRadius: 3,
              transition: 'width .3s',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            color: 'var(--muted)',
            flexShrink: 0,
          }}
        >
          {cleared}/{types.length}
        </span>
      </div>
    );
  };

  return (
    <div className="dash-layout">
      <Sidebar type="admin" />
      <div className="main-area">
        <Topbar title="All Applications" />
        <div className="page-content">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div className="page-header" style={{ margin: 0 }}>
              <h2>Applications</h2>
              <p>{total} total applications</p>
            </div>
            <button className="btn btn-gold btn-sm" onClick={fetchApps}>
              🔄 Refresh
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input
              className="search-input"
              placeholder="🔍 Search name or enrollment…"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ flex: '1 1 200px' }}
            />
            <select
              className="search-input"
              style={{ width: 160 }}
              value={statusF}
              onChange={e => {
                setStatusF(e.target.value);
                setPage(1);
              }}
            >
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="search-input"
              style={{ width: 130 }}
              value={deptF}
              onChange={e => {
                setDeptF(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Depts</option>
              {DEPARTMENTS.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            {loading ? (
              <Spinner />
            ) : apps.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No applications found"
                desc="Try adjusting your filters."
              />
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Student</th>
                      <th>Dept</th>
                      <th>Hosteller</th>
                      <th>Clearances</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(a => (
                      <tr key={a._id}>
                        <td>
                          <span className="enroll-code">{a.applicationId}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.studentName}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--muted)',
                              fontFamily: 'JetBrains Mono',
                            }}
                          >
                            {a.enrollmentNumber}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 12,
                              background: 'var(--bg)',
                              padding: '3px 9px',
                              borderRadius: 6,
                              fontWeight: 600,
                            }}
                          >
                            {a.department}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{a.isHosteller ? '🏠 Yes' : '—'}</td>
                        <td>{clearanceBar(a)}</td>
                        <td>
                          <span className={`pill ${statusPill(a.overallStatus)}`}>
                            {statusLabel(a.overallStatus)}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {formatDate(a.submittedAt)}
                        </td>
                        <td>
                          <button
                            className="btn btn-xs btn-gold"
                            onClick={() => navigate(`/admin/application/${a.applicationId}`)}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '16px 0',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <button
                      className="btn btn-sm"
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontFamily: 'DM Sans',
                      }}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      ← Prev
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Page {page} of {pages}
                    </span>
                    <button
                      className="btn btn-sm"
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontFamily: 'DM Sans',
                      }}
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      disabled={page === pages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
