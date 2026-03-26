import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, Topbar } from '@/components/common/Sidebar';
import { KpiCard, Spinner, EmptyState } from '@/components/common';
import { formatDate } from '@/utils/formatters';
import { statusLabel, statusPill } from '@/utils/mappers';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { ROLE_LABELS, CLEARANCE_ROLES, REFUND_ROLES } from '@/config/constants';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, recentApplications: recent, loading } = useDashboardStats();

  return (
    <div className="dash-layout">
      <Sidebar type="admin" />
      <div className="main-area">
        <Topbar title="Admin Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
            <p>{ROLE_LABELS[user?.role]} · IEHE Caution Money Portal · AY 2024–25</p>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="kpi-grid">
                <KpiCard
                  icon="📋"
                  value={stats.total || 0}
                  label="Total Applications"
                  color="gold"
                />
                <KpiCard
                  icon="⏳"
                  value={stats.underReview || 0}
                  label="Under Review"
                  color="blue"
                />
                <KpiCard icon="✅" value={stats.cleared || 0} label="Fully Cleared" color="green" />
                <KpiCard icon="⚠️" value={stats.onHold || 0} label="On Hold" color="amber" />
                {(user?.role === 'superadmin' || user?.role === 'accounts') && (
                  <>
                    <KpiCard
                      icon="💰"
                      value={stats.refunded || 0}
                      label="Refunds Processed"
                      color="green"
                    />
                    <KpiCard
                      icon="🏦"
                      value={`₹${(stats.totalRefundAmount || 0).toLocaleString('en-IN')}`}
                      label="Total Disbursed"
                      color="gold"
                    />
                    <KpiCard
                      icon="📥"
                      value={stats.submitted || 0}
                      label="Newly Submitted"
                      color="blue"
                    />
                    <KpiCard
                      icon="⏱️"
                      value={(stats.cleared || 0) - (stats.refunded || 0)}
                      label="Awaiting Refund"
                      color="red"
                    />
                  </>
                )}
              </div>

              {/* Role-specific quick action */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div className="card" style={{ padding: 0 }}>
                  <div className="table-head">
                    <h3>Recent Applications</h3>
                    <button
                      className="btn btn-sm btn-gold"
                      onClick={() => navigate('/admin/applications')}
                    >
                      View All →
                    </button>
                  </div>
                  {recent.length === 0 ? (
                    <EmptyState
                      icon="📭"
                      title="No applications yet"
                      desc="Applications will appear here once students submit."
                    />
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>App ID</th>
                          <th>Student</th>
                          <th>Dept</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map(a => (
                          <tr
                            key={a._id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/admin/application/${a.applicationId}`)}
                          >
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
                            <td>
                              <span className={`pill ${statusPill(a.overallStatus)}`}>
                                {statusLabel(a.overallStatus)}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {formatDate(a.submittedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="card">
                  <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>
                    Quick Actions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      className="btn btn-gold btn-full"
                      style={{ fontSize: 13 }}
                      onClick={() => navigate('/admin/applications')}
                    >
                      📋 View All Applications
                    </button>
                    {CLEARANCE_ROLES.includes(user?.role) && (
                      <button
                        className="btn btn-full"
                        style={{
                          fontSize: 13,
                          background: 'var(--navy)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 10,
                          padding: '11px 20px',
                          cursor: 'pointer',
                          fontFamily: 'DM Sans',
                          fontWeight: 600,
                        }}
                        onClick={() => navigate('/admin/clearances')}
                      >
                        ✅ Manage My Clearances
                      </button>
                    )}
                    {REFUND_ROLES.includes(user?.role) && (
                      <button
                        className="btn btn-full"
                        style={{
                          fontSize: 13,
                          background: '#065f46',
                          color: 'white',
                          border: 'none',
                          borderRadius: 10,
                          padding: '11px 20px',
                          cursor: 'pointer',
                          fontFamily: 'DM Sans',
                          fontWeight: 600,
                        }}
                        onClick={() => navigate('/admin/refunds')}
                      >
                        💰 Process Refunds
                      </button>
                    )}
                  </div>

                  <div className="divider" />

                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
                      Late Fee Policy
                    </div>
                    Refund amount: <strong>₹5,000</strong>
                    <br />
                    Processing time: <strong>2–3 business days</strong>
                    <br />
                    After accounts approval, funds are auto-credited to student's registered bank
                    account.
                  </div>
                </div>
              </div>

              {/* Bar chart — clearance distribution */}
              <div className="card">
                <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>
                  Application Distribution
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Submitted', value: stats.submitted || 0, color: '#bfdbfe' },
                    { label: 'Under Review', value: stats.underReview || 0, color: '#93c5fd' },
                    { label: 'Cleared', value: stats.cleared || 0, color: '#6ee7b7' },
                    { label: 'Refunded', value: stats.refunded || 0, color: '#86efac' },
                    { label: 'On Hold', value: stats.onHold || 0, color: '#fde68a' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        minWidth: 100,
                        background: 'var(--bg)',
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 28,
                          fontFamily: 'Playfair Display',
                          fontWeight: 800,
                          color: 'var(--navy)',
                        }}
                      >
                        {item.value}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        {item.label}
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: item.color,
                          borderRadius: 4,
                          marginTop: 10,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
