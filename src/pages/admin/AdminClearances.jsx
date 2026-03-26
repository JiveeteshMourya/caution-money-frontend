import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, Topbar } from '@/components/common/Sidebar';
import { Spinner, EmptyState } from '@/components/common';
import { formatDate } from '@/utils/formatters';
import { statusPill } from '@/utils/mappers';
import { getAllApplications, updateClearance } from '@/services/applicationService';

export default function AdminClearances() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const myType = user?.role;

  const fetchApps = () => {
    if (!myType) return;
    setLoading(true);
    getAllApplications({ limit: 50 })
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

  useEffect(fetchApps, [myType]);

  const quickUpdate = async (appId, status) => {
    const reason = status === 'hold' ? window.prompt('Enter reason for putting on hold:') : '';
    if (status === 'hold' && !reason) return;
    setUpdating(`${appId}::${status}`);
    try {
      await updateClearance(appId, myType, status, reason || '');
      toast.success(`Clearance ${status === 'cleared' ? 'approved' : 'put on hold'}`);
      fetchApps();
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
                                disabled={updating === `${a.applicationId}::cleared`}
                                onClick={() => quickUpdate(a.applicationId, 'cleared')}
                              >
                                ✓ Approve
                              </button>
                            )}
                            {c?.status !== 'hold' && (
                              <button
                                className="btn btn-xs btn-danger"
                                disabled={updating === `${a.applicationId}::hold`}
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
