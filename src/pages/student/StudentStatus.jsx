import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from '@/components/common/Sidebar';
import { ClearanceCard, Alert, Spinner, EmptyState, Timeline, InfoRow } from '@/components/common';
import { formatDate, formatDateTime, maskAccount } from '@/utils/formatters';
import { useMyApplication } from '@/hooks/useMyApplication';
import { APPLICATION_STATUS_STEPS, REFUND_AMOUNT_DISPLAY, backendUrl } from '@/config/constants';
import { submitOfflineNoDues } from '@/services/applicationService';

export default function StudentStatus() {
  const navigate = useNavigate();
  const { application: app, loading, refresh } = useMyApplication();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const clearanceTypes = app
    ? ['library', 'sports', ...(app.isHosteller ? ['hostel'] : []), 'department', 'accounts']
    : [];

  const handleOfflineUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large — maximum size is 5 MB');
      return;
    }
    setUploading(true);
    try {
      await submitOfflineNoDues(file);
      toast.success('Offline no-dues form submitted successfully');
      if (fileRef.current) fileRef.current.value = '';
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const statusStep = APPLICATION_STATUS_STEPS[app?.overallStatus] || 1;

  return (
    <div className="dash-layout">
      <Sidebar type="student" />
      <div className="main-area">
        <Topbar title="Clearance Status" />
        <div className="page-content">
          {loading ? (
            <Spinner />
          ) : !app ? (
            <div className="card">
              <EmptyState
                icon="🔍"
                title="No Application Found"
                desc="You haven't submitted a refund application yet."
                action={
                  <button className="btn btn-gold" onClick={() => navigate('/student/application')}>
                    Apply Now →
                  </button>
                }
              />
            </div>
          ) : (
            <>
              {/* Progress tracker */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <div className="card-title" style={{ fontSize: 17, marginBottom: 2 }}>
                      Application Progress
                    </div>
                    <div
                      style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}
                    >
                      {app.applicationId}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'white',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                    }}
                    onClick={refresh}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {/* Visual step tracker */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                  {['Submitted', 'Under Review', 'All Cleared', 'Refund Sent'].map((s, i) => {
                    const done = i + 1 < statusStep;
                    const active = i + 1 === statusStep;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: done ? 'var(--gold)' : active ? 'var(--navy)' : '#e5e7eb',
                              border: active ? '3px solid var(--gold)' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              color: done ? 'var(--navy)' : active ? 'white' : '#9ca3af',
                              fontWeight: 700,
                              transition: 'all .3s',
                              boxShadow: active ? '0 0 0 4px rgba(201,168,76,0.2)' : 'none',
                            }}
                          >
                            {done ? '✓' : i + 1}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              marginTop: 6,
                              color: done || active ? 'var(--navy)' : '#9ca3af',
                              fontWeight: done || active ? 600 : 400,
                              textAlign: 'center',
                            }}
                          >
                            {s}
                          </div>
                        </div>
                        {i < 3 && (
                          <div
                            style={{
                              height: 2,
                              flex: 0.5,
                              background: i + 1 < statusStep ? 'var(--gold)' : '#e5e7eb',
                              margin: '0 4px',
                              marginBottom: 20,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status alerts */}
                {app.overallStatus === 'refund_processed' && (
                  <Alert type="success">
                    🎉 Your {REFUND_AMOUNT_DISPLAY} refund has been processed! Txn ID:{' '}
                    <strong className="mono">{app.refundTransactionId}</strong>. Credit expected in
                    2–3 business days.
                  </Alert>
                )}
                {app.overallStatus === 'on_hold' && (
                  <Alert type="warning">
                    ⚠️ Application on hold. One or more departments have flagged pending dues.
                    Please resolve them to proceed.
                  </Alert>
                )}
                {app.overallStatus === 'fully_cleared' && (
                  <Alert type="info">
                    ✅ All clearances approved! Your application is now with the Accounts section
                    for final processing.
                  </Alert>
                )}
              </div>

              {/* Clearances */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ fontSize: 17, marginBottom: 16 }}>
                  Department Clearances
                </div>
                <div className="clearance-grid">
                  {clearanceTypes.map(t => (
                    <ClearanceCard key={t} type={t} data={app.clearances[t]} />
                  ))}
                </div>
              </div>

              {/* Offline No-Dues Upload */}
              {app.refundStatus !== 'processed' && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-title" style={{ fontSize: 17, marginBottom: 4 }}>
                    Offline No-Dues Form
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                    If you have physically obtained the no-dues form signed by all departments,
                    upload a photo of the completed form here. Each admin will review it to approve
                    their section.
                  </p>

                  {app.noDuesMode === 'offline' && app.noDuesImageId && (
                    <div style={{ marginBottom: 14 }}>
                      <a
                        href={`${backendUrl}/image/${app.noDuesImageId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`${backendUrl}/image/${app.noDuesImageId}`}
                          alt="Offline no-dues form"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 180,
                            borderRadius: 8,
                            border: '1px solid #e9d5ff',
                            display: 'block',
                            marginBottom: 6,
                          }}
                        />
                      </a>
                      <div style={{ color: '#7c3aed', fontSize: 12 }}>
                        ✅ Form submitted — awaiting admin review. Re-upload to replace.
                      </div>
                    </div>
                  )}

                  <div style={{ color: '#6b21a8', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
                    📄{' '}
                    {app.noDuesMode === 'offline'
                      ? 'Re-upload Form'
                      : 'Upload Offline No-Dues Form'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    style={{ fontSize: 12, marginBottom: 10, display: 'block' }}
                  />
                  <button
                    disabled={uploading}
                    onClick={handleOfflineUpload}
                    style={{
                      background: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 18px',
                      fontSize: 13,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontFamily: 'DM Sans',
                      fontWeight: 600,
                      opacity: uploading ? 0.7 : 1,
                    }}
                  >
                    {uploading ? 'Uploading…' : 'Submit Form'}
                  </button>
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ fontSize: 17, marginBottom: 16 }}>
                  My Uploaded Documents
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 14,
                  }}
                >
                  {[
                    { label: 'TC / Admission Slip', id: app.tcOrAdmissionSlipImageId },
                    { label: 'Bank Passbook', id: app.bankPassbookImageId },
                    { label: 'Fees Slip', id: app.feesSlipImageId },
                    { label: 'No-Dues Form', id: app.noDuesImageId },
                  ].map(({ label, id }) => (
                    <div
                      key={label}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: 'var(--bg)',
                      }}
                    >
                      {id ? (
                        <>
                          <a href={`${backendUrl}/image/${id}`} target="_blank" rel="noreferrer">
                            <img
                              src={`${backendUrl}/image/${id}`}
                              alt={label}
                              style={{
                                width: '100%',
                                height: 130,
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </a>
                          <div
                            style={{
                              padding: '8px 10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>
                              {label}
                            </span>
                            <a
                              href={`${backendUrl}/image/${id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 11,
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              🔍 View
                            </a>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            height: 160,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            color: 'var(--muted)',
                          }}
                        >
                          <span style={{ fontSize: 28 }}>📄</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                          <span style={{ fontSize: 11 }}>Not uploaded</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div className="card">
                  <div className="card-title" style={{ fontSize: 16, marginBottom: 14 }}>
                    Application Details
                  </div>
                  <InfoRow label="Application ID" value={app.applicationId} mono />
                  <InfoRow label="Student Name" value={app.studentName} />
                  <InfoRow label="Enrollment" value={app.enrollmentNumber} mono />
                  <InfoRow label="Department" value={app.department} />
                  <InfoRow label="Passing Year" value={app.passoutYear} />
                  <InfoRow label="Submitted On" value={formatDate(app.submittedAt)} />
                  <InfoRow label="Last Updated" value={formatDateTime(app.lastUpdated)} />
                </div>

                <div className="card">
                  <div className="card-title" style={{ fontSize: 16, marginBottom: 14 }}>
                    Bank Details
                  </div>
                  <div className="bank-box">
                    <div className="bank-row">
                      <span className="bank-key">Account Holder</span>
                      <span className="bank-val">{app.bankDetails?.accountHolderName}</span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-key">Account No.</span>
                      <span className="bank-val">
                        {maskAccount(app.bankDetails?.accountNumber)}
                      </span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-key">IFSC</span>
                      <span className="bank-val">{app.bankDetails?.ifscCode}</span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-key">Bank</span>
                      <span className="bank-val">{app.bankDetails?.bankName}</span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-key">Branch</span>
                      <span className="bank-val">{app.bankDetails?.branchName || '—'}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      padding: '10px 14px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 10,
                      fontSize: 12,
                      color: '#92400e',
                    }}
                  >
                    ⚠️ Bank details can only be updated before refund is processed. Contact admin if
                    needed.
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>
                  Activity Timeline
                </div>
                <Timeline events={[...(app.timeline || [])].reverse()} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
