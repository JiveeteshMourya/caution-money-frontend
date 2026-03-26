import { statusPill, clearanceLabel, deptIcons } from '../../utils/helpers';

// ── Spinner ───────────────────────────────────────────────────────
export const Spinner = ({ text = 'Loading…' }) => (
  <div className="loading">
    <div className="spinner" />
    <span>{text}</span>
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', children }) => (
  <div className={`alert alert-${type}`}>
    <span>
      {type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'danger' ? '🚨' : 'ℹ️'}
    </span>
    <span>{children}</span>
  </div>
);

// ── Status Pill ───────────────────────────────────────────────────
export const StatusPill = ({ status }) => (
  <span className={`pill ${statusPill(status)}`}>{clearanceLabel(status)}</span>
);

// ── Clearance Card ────────────────────────────────────────────────
export const ClearanceCard = ({ type, data }) => {
  const s = data?.status || 'pending';
  return (
    <div className={`clearance-item ${s}`}>
      <div className={`ci-icon ${s}`}>{deptIcons[type] || '📋'}</div>
      <div style={{ flex: 1 }}>
        <div className="ci-dept">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <StatusPill status={s} />
        {data?.reason && <div className="ci-reason">📌 {data.reason}</div>}
        {data?.updatedByName && (
          <div
            className="ci-reason"
            style={{ fontFamily: 'JetBrains Mono', fontSize: 11, marginTop: 4 }}
          >
            By: {data.updatedByName}
          </div>
        )}
      </div>
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────
export const KpiCard = ({ icon, value, label, color = 'gold', sub }) => (
  <div className={`kpi-card ${color}`}>
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-val">{value}</div>
    <div className="kpi-label">{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 18,
          }}
        >
          <div>
            <h3>{title}</h3>
            {subtitle && <p style={{ marginBottom: 0 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: 'var(--muted)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── Info Row ──────────────────────────────────────────────────────
export const InfoRow = ({ label, value, mono }) => (
  <div className="info-row">
    <span className="info-key">{label}</span>
    <span className={`info-val ${mono ? 'mono' : ''}`} style={mono ? { fontSize: 12 } : {}}>
      {value || '—'}
    </span>
  </div>
);

// ── Timeline ──────────────────────────────────────────────────────
export const Timeline = ({ events = [] }) => (
  <div className="timeline">
    {events.map((e, i) => (
      <div key={i} className="tl-item">
        <div className={`tl-dot ${i > 0 ? '' : ''}`}>{i === 0 ? '✓' : i + 1}</div>
        <div className="tl-body">
          <div className="tl-title">{e.event}</div>
          <div className="tl-time">
            {e.timestamp ? new Date(e.timestamp).toLocaleString('en-IN') : ''}
          </div>
          {e.description && <div className="tl-note">{e.description}</div>}
          {e.performedBy && (
            <div className="tl-note" style={{ color: 'var(--gold)', fontSize: 11 }}>
              By: {e.performedBy}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ── Step Progress ─────────────────────────────────────────────────
export const StepProgress = ({ steps, current }) => (
  <div className="step-progress">
    {steps.map((s, i) => {
      const done = i + 1 < current;
      const active = i + 1 === current;
      return (
        <div key={i} className={`sp-step ${done ? 'done' : active ? 'active' : ''}`}>
          <div className="sp-circle">{done ? '✓' : i + 1}</div>
          <div className="sp-label">{s}</div>
        </div>
      );
    })}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, desc, action }) => (
  <div className="empty-state">
    <div className="es-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

// ── Input Field ───────────────────────────────────────────────────
export const Field = ({ label, error, children, dark }) => (
  <div className="form-group">
    {label && <label className={dark ? 'dark' : ''}>{label}</label>}
    {children}
    {error && <div className="form-error">{error}</div>}
  </div>
);
