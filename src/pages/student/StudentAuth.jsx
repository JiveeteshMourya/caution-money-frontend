import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Field, Alert, StepProgress } from '@/components/common';
import { studentLogin, studentRegister } from '@/services/authService';
import { DEPARTMENTS, PASSOUT_YEARS } from '@/config/constants';

const STEPS = ['Basic Info', 'Security', 'Confirm'];

export default function StudentAuth() {
  const [tab, setTab] = useState('login');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hosteller, setHosteller] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ enrollmentNumber: '', password: '' });
  const [regData, setRegData] = useState({
    enrollmentNumber: '',
    name: '',
    mobileNumber: '',
    department: '',
    dateOfBirth: '',
    passoutYear: '',
    password: '',
    confirmPassword: '',
  });

  const setReg = (k, v) => setRegData(p => ({ ...p, [k]: v }));
  const setLog = (k, v) => setLoginData(p => ({ ...p, [k]: v }));

  // ── Login ──
  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    if (!loginData.enrollmentNumber || !loginData.password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await studentLogin(loginData);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Register Step Validation ──
  const validateStep = () => {
    if (step === 1) {
      if (!regData.enrollmentNumber || regData.enrollmentNumber.length < 8)
        return 'Enter a valid enrollment number (min 8 chars).';
      if (!regData.name || regData.name.length < 2) return 'Enter your full name.';
      if (!/^[6-9]\d{9}$/.test(regData.mobileNumber))
        return 'Enter a valid 10-digit Indian mobile number.';
      if (!regData.department) return 'Select your department.';
      if (!regData.dateOfBirth) return 'Select your date of birth.';
      if (!regData.passoutYear) return 'Enter your passing year.';
    }
    if (step === 2) {
      if (regData.password.length < 8) return 'Password must be at least 8 characters.';
      if (regData.password !== regData.confirmPassword) return 'Passwords do not match.';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(s => s + 1);
  };

  // ── Register Submit ──
  const handleRegister = async () => {
    if (!agreed) {
      setError('Please confirm the declaration before registering.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { ...regData, isHosteller: hosteller };
      delete payload.confirmPassword;
      const res = await studentRegister(payload);
      login(res.data.token, res.data.user);
      toast.success('Registration successful! Welcome to IEHE Portal 🎉');
      navigate('/student/application');
    } catch (err) {
      const msg =
        err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed.';
      setError(msg);
      setStep(1);
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
          <p>Student Portal</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setStep(1);
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setStep(1);
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {error && <Alert type="danger">{error}</Alert>}

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <Field label="Enrollment Number">
              <input
                className="form-input"
                placeholder="e.g. 0110CS211001"
                value={loginData.enrollmentNumber}
                onChange={e => setLog('enrollmentNumber', e.target.value.toUpperCase())}
                maxLength={14}
              />
            </Field>
            <Field label="Password">
              <input
                className="form-input"
                type="password"
                placeholder="Your password"
                value={loginData.password}
                onChange={e => setLog('password', e.target.value)}
              />
            </Field>
            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ borderTopColor: 'var(--navy)' }} /> Signing in…
                </>
              ) : (
                'Sign In →'
              )}
            </button>
            <div
              style={{
                textAlign: 'center',
                marginTop: 14,
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              New student? Switch to{' '}
              <span
                style={{ color: 'var(--gold)', cursor: 'pointer' }}
                onClick={() => setTab('register')}
              >
                Register
              </span>
            </div>
          </form>
        )}

        {/* ── REGISTER ── */}
        {tab === 'register' && (
          <div>
            <StepProgress steps={STEPS} current={step} />

            {/* Step 1 */}
            {step === 1 && (
              <div>
                <div className="form-grid">
                  <Field label="Enrollment Number" dark={false}>
                    <input
                      className="form-input"
                      placeholder="0110CS211001"
                      value={regData.enrollmentNumber}
                      onChange={e => setReg('enrollmentNumber', e.target.value.toUpperCase())}
                      maxLength={14}
                    />
                  </Field>
                  <Field label="Department">
                    <select
                      className="form-input"
                      value={regData.department}
                      onChange={e => setReg('department', e.target.value)}
                    >
                      <option value="">Select Dept.</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Full Name" dark={false}>
                    <input
                      className="form-input"
                      placeholder="As per records"
                      value={regData.name}
                      onChange={e => setReg('name', e.target.value)}
                    />
                  </Field>
                  <Field label="Mobile Number">
                    <input
                      className="form-input"
                      placeholder="10-digit"
                      value={regData.mobileNumber}
                      onChange={e => setReg('mobileNumber', e.target.value)}
                      maxLength={10}
                    />
                  </Field>
                  <Field label="Date of Birth">
                    <input
                      className="form-input"
                      type="date"
                      value={regData.dateOfBirth}
                      onChange={e => setReg('dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </Field>
                  <Field label="Passing Year">
                    <select
                      className="form-input"
                      value={regData.passoutYear}
                      onChange={e => setReg('passoutYear', e.target.value)}
                    >
                      <option value="">Select Year</option>
                      {PASSOUT_YEARS.map(y => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="">
                  <div className="toggle-row" onClick={() => setHosteller(h => !h)}>
                    <div className={`toggle-switch ${hosteller ? 'on' : ''}`}>
                      <div className="toggle-knob" />
                    </div>
                    <div>
                      <div className="toggle-label">Are you a Hosteller?</div>
                      <div className="toggle-sub">
                        {hosteller ? 'Yes – hostel clearance required' : 'No – day scholar'}
                      </div>
                    </div>
                  </div>
                </Field>
                <button className="btn btn-gold btn-full" onClick={handleNext}>
                  Next: Security →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <Alert type="info">
                  Choose a strong password with at least 8 characters including numbers.
                </Alert>
                <Field label="Create Password">
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Min 8 characters"
                    value={regData.password}
                    onChange={e => setReg('password', e.target.value)}
                  />
                </Field>
                <Field label="Confirm Password">
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Re-enter password"
                    value={regData.confirmPassword}
                    onChange={e => setReg('confirmPassword', e.target.value)}
                  />
                </Field>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                  >
                    ← Back
                  </button>
                  <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleNext}>
                    Next: Confirm →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 – Review */}
            {step === 3 && (
              <div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 18,
                  }}
                >
                  {[
                    ['Enrollment', regData.enrollmentNumber],
                    ['Name', regData.name],
                    ['Mobile', regData.mobileNumber],
                    ['Department', regData.department],
                    ['Hostel', hosteller ? 'Yes' : 'No'],
                    ['Passing Year', regData.passoutYear],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                      <span style={{ color: 'white', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}
                >
                  <input
                    type="checkbox"
                    id="declare"
                    style={{ marginTop: 3, accentColor: 'var(--gold)' }}
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                  />
                  <label
                    htmlFor="declare"
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.6,
                      cursor: 'pointer',
                    }}
                  >
                    I confirm all information is accurate and I am an IEHE student eligible for
                    caution money refund.
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setStep(2);
                      setError('');
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-gold"
                    style={{ flex: 1 }}
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" style={{ borderTopColor: 'var(--navy)' }} />{' '}
                        Registering…
                      </>
                    ) : (
                      'Register & Continue →'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: 18,
            fontSize: 11,
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          🔒 Secured by 256-bit encryption · IEHE Bhopal
        </div>
      </div>
    </div>
  );
}
