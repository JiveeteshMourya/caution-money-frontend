import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Sidebar, Topbar } from '../../components/common/Sidebar';
import { ClearanceCard, Alert, Spinner, Modal, InfoRow, Timeline } from '../../components/common';
import {
  formatDate,
  formatDateTime,
  statusLabel,
  statusPill,
  maskAccount,
  deptIcons,
  ROLE_LABELS,
} from '../../utils/helpers';
import api from '../../utils/api';

const CLEARANCE_ROLE_MAP = {
  library: ['library', 'superadmin'],
  sports: ['sports', 'superadmin'],
  hostel: ['hostel', 'superadmin'],
  department: ['department', 'superadmin'],
  accounts: ['accounts', 'superadmin'],
};

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', status: 'cleared', reason: '' });
  const [updating, setUpdating] = useState(false);

  const fetchApp = () => {
    setLoading(true);
    api
      .get(`/application/${id}`)
      .then(r => setApp(r.data.application))
      .catch(() => navigate('/admin/applications'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchApp, [id]);

  const clearanceTypes = app
    ? ['library', 'sports', ...(app.isHosteller ? ['hostel'] : []), 'department', 'accounts']
    : [];

  const canUpdate = type => CLEARANCE_ROLE_MAP[type]?.includes(user?.role);

  const openModal = type => {
    const current = app.clearances[type];
    setModal({
      open: true,
      type,
      status: current.status === 'cleared' ? 'pending' : 'cleared',
      reason: current.reason || '',
    });
  };

  const handleUpdate = async () => {
    if (modal.status === 'hold' && !modal.reason.trim()) {
      toast.error('Please provide a reason for putting on hold.');
      return;
    }
    setUpdating(true);
    try {
      await api.patch(`/application/${id}/clearance`, {
        clearanceType: modal.type,
        status: modal.status,
        reason: modal.reason,
      });
      toast.success(`${modal.type} clearance updated to ${modal.status}`);
      setModal(m => ({ ...m, open: false }));
      fetchApp();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm('Are you sure you want to process the ₹5,000 refund for this student?'))
      return;
    try {
      const r = await api.patch(`/application/${id}/refund`);
      toast.success(`Refund processed! Txn: ${r.data.transactionId}`);
      fetchApp();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Refund processing failed');
    }
  };

  if (loading)
    return (
      <div className="dash-layout">
        <Sidebar type="admin" />
        <div className="main-area">
          <Topbar title="Application Detail" />
          <Spinner />
        </div>
      </div>
    );

  return (
    <div className="dash-layout">
      <Sidebar type="admin" />
      <div className="main-area">
        <Topbar title="Application Detail" />
        <div className="page-content">
          {/* Back + header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-sm"
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontFamily: 'DM Sans',
              }}
              onClick={() => navigate('/admin/applications')}
            >
              ← Back
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 22, color: 'var(--navy)' }}>
                {app.studentName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                {app.applicationId}
              </div>
            </div>
            <span
              className={`pill ${statusPill(app.overallStatus)}`}
              style={{ fontSize: 13, padding: '5px 14px' }}
            >
              {statusLabel(app.overallStatus)}
            </span>
          </div>

          {/* Accounts refund action */}
          {(user?.role === 'accounts' || user?.role === 'superadmin') &&
            app.overallStatus === 'fully_cleared' && (
              <Alert type="success">
                ✅ All department clearances are approved. Ready to process refund.
                <button
                  className="btn btn-sm btn-success"
                  style={{ marginLeft: 12 }}
                  onClick={handleRefund}
                >
                  💰 Process ₹5,000 Refund
                </button>
              </Alert>
            )}
          {app.refundStatus === 'processed' && (
            <Alert type="success">
              🎉 Refund of ₹5,000 has been processed. Txn ID:{' '}
              <strong className="mono">{app.refundTransactionId}</strong>
              <span style={{ fontSize: 12, marginLeft: 8, color: 'var(--muted)' }}>
                ({formatDateTime(app.refundProcessedAt)})
              </span>
            </Alert>
          )}

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
          >
            {/* Student info */}
            <div className="card">
              <div className="card-title" style={{ fontSize: 16, marginBottom: 14 }}>
                Student Information
              </div>
              <InfoRow label="Full Name" value={app.studentName} />
              <InfoRow label="Enrollment No." value={app.enrollmentNumber} mono />
              <InfoRow label="Department" value={app.department} />
              <InfoRow label="Mobile" value={app.mobileNumber} mono />
              <InfoRow label="Passing Year" value={app.passoutYear} />
              <InfoRow label="Hosteller" value={app.isHosteller ? '🏠 Yes' : 'No'} />
              <InfoRow label="Submitted On" value={formatDate(app.submittedAt)} />
              <InfoRow label="Last Updated" value={formatDateTime(app.lastUpdated)} />
            </div>

            {/* Bank details */}
            <div className="card">
              <div className="card-title" style={{ fontSize: 16, marginBottom: 14 }}>
                Bank Details
              </div>
              <div className="bank-box" style={{ marginBottom: 14 }}>
                <div className="bank-row">
                  <span className="bank-key">Account Holder</span>
                  <span className="bank-val">{app.bankDetails?.accountHolderName}</span>
                </div>
                <div className="bank-row">
                  <span className="bank-key">Account No.</span>
                  <span className="bank-val">{maskAccount(app.bankDetails?.accountNumber)}</span>
                </div>
                <div className="bank-row">
                  <span className="bank-key">IFSC Code</span>
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
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 10,
                  fontSize: 13,
                }}
              >
                💰 Refund Amount: <strong>₹5,000</strong>
                {app.refundStatus === 'processed' && (
                  <span style={{ marginLeft: 10, color: 'var(--success)', fontWeight: 600 }}>
                    ✓ Processed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clearances */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div className="card-title" style={{ fontSize: 16, margin: 0 }}>
                Department Clearances
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Click on a clearance to update (if you have permission)
              </div>
            </div>
            <div className="clearance-grid">
              {clearanceTypes.map(type => {
                const c = app.clearances[type];
                const canEdit = canUpdate(type) && c?.status !== 'na';
                return (
                  <div key={type} style={{ position: 'relative' }}>
                    <ClearanceCard type={type} data={c} />
                    {canEdit && (
                      <button
                        onClick={() => openModal(type)}
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'var(--navy)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 11,
                          cursor: 'pointer',
                          fontFamily: 'DM Sans',
                          fontWeight: 600,
                        }}
                      >
                        ✏️ Update
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>
              Activity Timeline
            </div>
            <Timeline events={[...(app.timeline || [])].reverse()} />
          </div>
        </div>
      </div>

      {/* Clearance Update Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        title={`Update ${modal.type?.charAt(0).toUpperCase() + modal.type?.slice(1)} Clearance`}
        subtitle="Select new status and provide a reason if required."
      >
        <div className="form-group">
          <label className="dark">New Status</label>
          <select
            className="form-input dark"
            value={modal.status}
            onChange={e => setModal(m => ({ ...m, status: e.target.value }))}
          >
            <option value="cleared">✅ Cleared — No Dues</option>
            <option value="hold">⚠️ On Hold — Dues Pending</option>
            <option value="pending">⏳ Pending — Awaiting Review</option>
          </select>
        </div>
        <div className="form-group">
          <label className="dark">
            Reason / Remarks {modal.status === 'hold' ? '(Required)' : '(Optional)'}
          </label>
          <textarea
            className="form-input dark"
            style={{ minHeight: 90, resize: 'vertical' }}
            placeholder={
              modal.status === 'hold' ? 'Describe the pending dues in detail…' : 'Optional remarks…'
            }
            value={modal.reason}
            onChange={e => setModal(m => ({ ...m, reason: e.target.value }))}
          />
        </div>
        {modal.status === 'hold' && (
          <Alert type="warning">
            A notification will be visible to the student explaining why their clearance is on hold.
          </Alert>
        )}
        <div className="modal-btns">
          <button
            className="btn"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
            onClick={() => setModal(m => ({ ...m, open: false }))}
          >
            Cancel
          </button>
          <button
            className={`btn ${modal.status === 'cleared' ? 'btn-success' : modal.status === 'hold' ? 'btn-danger' : 'btn-gold'}`}
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <>
                <div className="spinner" /> Updating…
              </>
            ) : (
              `Update ${modal.type}`
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
