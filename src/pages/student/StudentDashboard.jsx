import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar, Topbar } from '../../components/common/Sidebar';
import { KpiCard, ClearanceCard, Alert, Spinner, EmptyState } from '../../components/common';
import { formatDate, statusLabel, statusPill, maskAccount } from '../../utils/helpers';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/application/my')
      .then(r => setApp(r.data.application))
      .catch(() => setApp(null))
      .finally(() => setLoading(false));
  }, []);

  const paid = app?.refundStatus === 'processed';
  const allClear = app?.overallStatus === 'fully_cleared' || paid;

  const clearanceTypes = [
    'library',
    'sports',
    ...(app?.isHosteller ? ['hostel'] : []),
    'department',
    'accounts',
  ];

  return (
    <div className="dash-layout">
      <Sidebar type="student" />
      <div className="main-area">
        <Topbar title="Student Dashboard" />
        <div className="page-content">
          {/* Welcome */}
          <div className="page-header">
            <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p>Track your caution money refund application status below.</p>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* KPIs */}
              <div
                className="kpi-grid"
                style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}
              >
                <KpiCard icon="💰" value="₹5,000" label="Refund Amount" color="gold" />
                <KpiCard
                  icon="📋"
                  value={app ? statusLabel(app.overallStatus) : 'Not Applied'}
                  label="Application Status"
                  color={app ? 'green' : 'amber'}
                />
                <KpiCard icon="🏫" value={user?.department} label="Department" color="blue" />
              </div>

              {/* No application */}
              {!app && (
                <div className="card">
                  <EmptyState
                    icon="📄"
                    title="No Application Yet"
                    desc="You haven't submitted your caution money refund application. Start the process now — it takes less than 5 minutes."
                    action={
                      <button
                        className="btn btn-gold"
                        onClick={() => navigate('/student/application')}
                      >
                        Start Application →
                      </button>
                    }
                  />
                </div>
              )}

              {app && (
                <>
                  {/* Status Hero */}
                  <div className="hero-status-card">
                    <div>
                      <div className="hsc-label">Application ID</div>
                      <div
                        style={{
                          fontFamily: 'JetBrains Mono',
                          color: 'var(--gold-light)',
                          fontSize: 15,
                        }}
                      >
                        {app.applicationId}
                      </div>
                      <div className="hsc-label" style={{ marginTop: 12 }}>
                        Overall Status
                      </div>
                      <div className="hsc-value">{statusLabel(app.overallStatus)}</div>
                      <div className="hsc-meta">Submitted: {formatDate(app.submittedAt)}</div>
                    </div>
                    <div className="refund-box">
                      <div className="amt">₹5,000</div>
                      <div className="lbl">Caution Money</div>
                      {paid && (
                        <div style={{ fontSize: 12, marginTop: 6, color: 'var(--navy)' }}>
                          ✅ Processed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Paid alert */}
                  {paid && (
                    <Alert type="success">
                      🎉 Your ₹5,000 refund has been processed! Transaction ID:{' '}
                      <strong className="mono">{app.refundTransactionId}</strong>. It will reflect
                      in your bank account within 2–3 business days.
                    </Alert>
                  )}

                  {/* Hold alert */}
                  {app.overallStatus === 'on_hold' && (
                    <Alert type="warning">
                      ⚠️ Your application is on hold. One or more departments have flagged dues.
                      Please check clearance details below.
                    </Alert>
                  )}

                  {/* Clearances */}
                  <div className="section-title" style={{ marginBottom: 14 }}>
                    Department Clearances
                  </div>
                  <div className="clearance-grid">
                    {clearanceTypes.map(t => (
                      <ClearanceCard key={t} type={t} data={app.clearances[t]} />
                    ))}
                  </div>

                  {/* Bank Details */}
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>
                      Registered Bank Details
                    </div>
                    <div className="bank-box">
                      {[
                        ['Account Holder', app.bankDetails?.accountHolderName],
                        ['Account Number', maskAccount(app.bankDetails?.accountNumber)],
                        ['IFSC Code', app.bankDetails?.ifscCode],
                        ['Bank', app.bankDetails?.bankName],
                        ['Branch', app.bankDetails?.branchName],
                      ].map(([k, v]) => (
                        <div className="bank-row" key={k}>
                          <span className="bank-key">{k}</span>
                          <span className="bank-val">{v || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
