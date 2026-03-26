import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from '@/components/common/Sidebar';
import { Spinner, Alert } from '@/components/common';
import { getAllApplications, processRefund } from '@/services/applicationService';
import { REFUND_AMOUNT, REFUND_AMOUNT_DISPLAY } from '@/config/constants';

const Section = ({ title, items, showAction, onRefund, processing }) => (
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
              <td style={{ fontWeight: 700, color: 'var(--navy)' }}>{REFUND_AMOUNT_DISPLAY}</td>
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
                    onClick={() => onRefund(a.applicationId)}
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

export default function AdminRefunds() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchApps = () => {
    setLoading(true);
    getAllApplications({ limit: 50 })
      .then(r => setApps(r.data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchApps, []);

  const handleRefund = async appId => {
    if (!window.confirm(`Confirm: Process ${REFUND_AMOUNT_DISPLAY} refund for this student?`))
      return;
    setProcessing(appId);
    try {
      const r = await processRefund(appId);
      toast.success(`✅ Refund processed! Txn: ${r.data.transactionId}`);
      fetchApps();
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
                ₹{(processed.length * REFUND_AMOUNT).toLocaleString('en-IN')}
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
              <Section
                title="✅ Ready for Refund"
                items={ready}
                showAction={true}
                onRefund={handleRefund}
                processing={processing}
              />
              <Section title="💰 Processed Refunds" items={processed} showAction={false} />
              <Section title="⏳ Pending Clearances" items={pending} showAction={false} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
