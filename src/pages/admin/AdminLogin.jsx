import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Field, Alert } from '../../components/common';
import { ROLE_LABELS } from '../../utils/helpers';
import api from '../../utils/api';

const ROLE_ICONS = {
  superadmin: '👑',
  library: '📚',
  sports: '⚽',
  hostel: '🏠',
  department: '🎓',
  accounts: '💳',
};

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', {
        email: form.email,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}! 🔐`);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <div className="auth-logo">
          <div className="auth-logo-seal">IE</div>
          <h2>IEHE Bhopal</h2>
          <p>Administration Portal</p>
        </div>

        {error && <Alert type="danger">{error}</Alert>}

        {/* Role quick-select */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            Select Your Role
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <button
                key={k}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  border: '1.5px solid',
                  borderColor: form.role === k ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  background: form.role === k ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                  color: form.role === k ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'DM Sans',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all .18s',
                }}
                onClick={() => setForm(p => ({ ...p, role: k }))}
              >
                <span style={{ fontSize: 18 }}>{ROLE_ICONS[k]}</span>
                <span>
                  {v.replace(' Department', '').replace(' Section', '').replace(' Warden', '')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Admin Email">
            <input
              className="form-input"
              type="email"
              placeholder="admin@iehe.ac.in"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </Field>
          <Field label="Password">
            <input
              className="form-input"
              type="password"
              placeholder="Admin password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </Field>
          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ borderTopColor: 'var(--navy)' }} />{' '}
                Authenticating…
              </>
            ) : (
              'Login as Admin →'
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: 22,
            padding: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Demo Credentials
          </div>
          {[
            ['superadmin@iehe.ac.in', 'Admin@123', 'Super Admin'],
            ['library@iehe.ac.in', 'Lib@123', 'Library'],
            ['accounts@iehe.ac.in', 'Acc@123', 'Accounts'],
          ].map(([e, p, r]) => (
            <div
              key={e}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono' }}>{e}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold-light)' }}>{p}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: 11,
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          🔐 Authorized personnel only · IEHE Bhopal
        </div>
      </div>
    </div>
  );
}
