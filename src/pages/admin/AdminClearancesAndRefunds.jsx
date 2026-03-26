// AdminClearances.jsx — for dept-specific admins
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Sidebar, Topbar } from '../../components/common/Sidebar';
import { Spinner, EmptyState, Alert } from '../../components/common';
import { formatDate, statusPill } from '../../utils/helpers';
import api from '../../utils/api';

export function AdminClearances() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const myType = user?.role; // library, sports, hostel, department

  const fetch = () => {
    setLoading(true);
    api
      .get('/application/all?limit=50')
      .then(r =>
        setApps(
          r.data.applications.filter(a => {
            const c = a.clearances[myType];
            return c && c.status !== 'na';
          })
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const quickUpdate = async (appId, status) => {
    const reason = status === 'hold' ? window.prompt('Enter reason for putting on hold:') : '';
    if (status === 'hold' && !reason) return;
    setUpdating(appId + status);
    try {
      await api.patch(`/application/${appId}/clearance`, {
        clearanceType: myType,
        status,
        reason: reason || '',
      });
      toast.success(`Clearance ${status === 'cleared' ? 'approved' : 'put on hold'}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const pending = apps.filter(a => a.clearances[myType]?.status === 'pending');
  const cleared = apps.filter(a => a.clearances[myType]?.status === 'cleared');
  const onHold = apps.filter(a => a.clearances[myType]?.status === 'hold');

  return (
    <div className="dash-layout">
      <Sidebar type="admin" />
      <div className="main-area">
        <Topbar title="My Clearances" />
        <div className="page-content">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div className="page-header" style={{ margin: 0 }}>
              <h2>{myType?.charAt(0).toUpperCase() + myType?.slice(1)} Clearances</h2>
              <p>Review and approve/hold applications for your department.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                }}
              >
                ⏳ Pending: <strong>{pending.length}</strong>
              </div>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                }}
              >
                ✅ Cleared: <strong>{cleared.length}</strong>
              </div>
              <div
                style={{
                  background: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                }}
              >
                🔴 On Hold: <strong>{onHold.length}</strong>
              </div>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : apps.length === 0 ? (
            <EmptyState
              icon="✅"
              title="All Clear!"
              desc="No applications pending clearance for your department."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Enrollment</th>
                    <th>Department</th>
                    <th>Submitted</th>
                    <th>My Clearance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(a => {
                    const c = a.clearances[myType];
                    return (
                      <tr key={a._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.studentName}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {a.department} · {a.isHosteller ? '🏠' : '🏫'}
                          </div>
                        </td>
                        <td>
                          <span className="enroll-code">{a.enrollmentNumber}</span>
                        </td>
                        <td>{a.department}</td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {formatDate(a.submittedAt)}
                        </td>
                        <td>
                          <span className={`pill ${statusPill(c?.status)}`}>
                            {c?.status === 'pending'
                              ? 'Awaiting Review'
                              : c?.status === 'cleared'
                                ? 'Cleared ✓'
                                : c?.status === 'hold'
                                  ? 'On Hold'
                                  : c?.status}
                          </span>
                          {c?.reason && (
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                              {c.reason}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {c?.status !== 'cleared' && (
                              <button
                                className="btn btn-xs btn-success"
                                disabled={updating === a.applicationId + 'cleared'}
                                onClick={() => quickUpdate(a.applicationId, 'cleared')}
                              >
                                ✓ Approve
                              </button>
                            )}
                            {c?.status !== 'hold' && (
                              <button
                                className="btn btn-xs btn-danger"
                                disabled={updating === a.applicationId + 'hold'}
                                onClick={() => quickUpdate(a.applicationId, 'hold')}
                              >
                                ⚠ Hold
                              </button>
                            )}
                            <button
                              className="btn btn-xs"
                              style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--muted)',
                                cursor: 'pointer',
                                fontFamily: 'DM Sans',
                                fontWeight: 600,
                                fontSize: 12,
                                borderRadius: 7,
                                padding: '5px 10px',
                              }}
                              onClick={() => navigate(`/admin/application/${a.applicationId}`)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// AdminRefunds.jsx — for accounts/superadmin
export function AdminRefunds() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetch = () => {
    setLoading(true);
    api
      .get('/application/all?limit=50')
      .then(r => setApps(r.data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const processRefund = async appId => {
    if (!window.confirm('Confirm: Process ₹5,000 refund for this student?')) return;
    setProcessing(appId);
    try {
      const r = await api.patch(`/application/${appId}/refund`);
      toast.success(`✅ Refund processed! Txn: ${r.data.transactionId}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setProcessing(null);
    }
  };

  const ready = apps.filter(a => a.overallStatus === 'fully_cleared');
  const processed = apps.filter(a => a.overallStatus === 'refund_processed');
  const pending = apps.filter(
    a => !['fully_cleared', 'refund_processed'].includes(a.overallStatus)
  );

  const Section = ({ title, items, showAction }) => (
    <div className="table-wrap" style={{ marginBottom: 20 }}>
      <div className="table-head">
        <h3>
          {title}{' '}
          <span
            style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400, fontFamily: 'DM Sans' }}
          >
            ({items.length})
          </span>
        </h3>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No applications in this category.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Enrollment</th>
              <th>Bank Account</th>
              <th>IFSC</th>
              <th>Amount</th>
              <th>Status</th>
              {showAction && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a._id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.studentName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.department}</div>
                </td>
                <td>
                  <span className="enroll-code">{a.enrollmentNumber}</span>
                </td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                  ****{a.bankDetails?.accountNumber?.slice(-4)}
                </td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                  {a.bankDetails?.ifscCode}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--navy)' }}>₹5,000</td>
                <td>
                  {a.overallStatus === 'refund_processed' ? (
                    <span className="pill pill-refunded">Refunded ✓</span>
                  ) : a.overallStatus === 'fully_cleared' ? (
                    <span className="pill pill-cleared">Ready</span>
                  ) : (
                    <span className="pill pill-pending">Pending Clearances</span>
                  )}
                </td>
                {showAction && (
                  <td>
                    <button
                      className="btn btn-xs btn-success"
                      disabled={processing === a.applicationId}
                      onClick={() => processRefund(a.applicationId)}
                    >
                      {processing === a.applicationId ? '⏳ Processing…' : '💰 Process Refund'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="dash-layout">
      <Sidebar type="admin" />
      <div className="main-area">
        <Topbar title="Refund Processing" />
        <div className="page-content">
          <div className="page-header">
            <h2>Refund Queue</h2>
            <p>Process caution money refunds for students with full clearance.</p>
          </div>

          {/* Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: 32, fontFamily: 'Playfair Display', color: 'var(--success)' }}
              >
                {ready.length}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px',
                }}
              >
                Ready to Refund
              </div>
              <div
                style={{ height: 3, background: 'var(--success)', borderRadius: 2, marginTop: 10 }}
              />
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontFamily: 'Playfair Display', color: 'var(--gold)' }}>
                {processed.length}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px',
                }}
              >
                Refunds Processed
              </div>
              <div
                style={{ height: 3, background: 'var(--gold)', borderRadius: 2, marginTop: 10 }}
              />
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontFamily: 'Playfair Display', color: 'var(--navy)' }}>
                ₹{(processed.length * 5000).toLocaleString('en-IN')}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px',
                }}
              >
                Total Disbursed
              </div>
              <div
                style={{ height: 3, background: 'var(--navy)', borderRadius: 2, marginTop: 10 }}
              />
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {ready.length > 0 && (
                <Alert type="success">
                  🟢 {ready.length} application(s) are fully cleared and ready for refund
                  processing.
                </Alert>
              )}
              <Section title="✅ Ready for Refund" items={ready} showAction={true} />
              <Section title="💰 Processed Refunds" items={processed} showAction={false} />
              <Section title="⏳ Pending Clearances" items={pending} showAction={false} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
