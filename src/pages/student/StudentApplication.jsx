import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Sidebar, Topbar } from '../../components/common/Sidebar';
import { Field, Alert, StepProgress, Spinner } from '../../components/common';
import api from '../../utils/api';

const STEPS = ['Personal Info', 'Bank Details', 'Declaration', 'Submit'];

export default function StudentApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(null);

  const [form, setForm] = useState({
    passoutYear: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
    },
    declaration: false,
  });

  useEffect(() => {
    api
      .get('/application/my')
      .then(r => setExisting(r.data.application))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setBank = (k, v) => setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, [k]: v } }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.passoutYear) return 'Please select your passing year.';
    }
    if (step === 2) {
      const b = form.bankDetails;
      if (!b.accountHolderName) return 'Account holder name is required.';
      if (!b.accountNumber || b.accountNumber.length < 9) return 'Enter a valid account number.';
      if (b.accountNumber !== b.confirmAccountNumber) return 'Account numbers do not match.';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(b.ifscCode))
        return 'Enter a valid IFSC code (e.g. SBIN0001234).';
      if (!b.bankName) return 'Bank name is required.';
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

  const handleSubmit = async () => {
    if (!form.declaration) {
      setError('You must agree to the declaration.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        passoutYear: form.passoutYear,
        declaration: true,
        bankDetails: {
          accountHolderName: form.bankDetails.accountHolderName,
          accountNumber: form.bankDetails.accountNumber,
          ifscCode: form.bankDetails.ifscCode.toUpperCase(),
          bankName: form.bankDetails.bankName,
          branchName: form.bankDetails.branchName,
        },
      };
      await api.post('/application/submit', payload);
      toast.success('Application submitted successfully! 🎉');
      navigate('/student/status');
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed.';
      if (err.response?.status === 409) {
        toast.success('Application already exists. Redirecting…');
        navigate('/student/status');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="dash-layout">
        <Sidebar type="student" />
        <div className="main-area">
          <Topbar title="Submit Application" />
          <Spinner />
        </div>
      </div>
    );

  if (existing)
    return (
      <div className="dash-layout">
        <Sidebar type="student" />
        <div className="main-area">
          <Topbar title="Submit Application" />
          <div className="page-content">
            <Alert type="info">
              You have already submitted an application (<strong>{existing.applicationId}</strong>).
              &nbsp;
              <span
                style={{ color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/student/status')}
              >
                View Status →
              </span>
            </Alert>
          </div>
        </div>
      </div>
    );

  return (
    <div className="dash-layout">
      <Sidebar type="student" />
      <div className="main-area">
        <Topbar title="Caution Money Application" />
        <div className="page-content">
          <div className="page-header">
            <h2>Refund Application</h2>
            <p>Fill in the details below to apply for your ₹5,000 caution money refund.</p>
          </div>

          <div className="card">
            <StepProgress steps={STEPS} current={step} />
            {error && <Alert type="danger">{error}</Alert>}

            {/* Step 1 – Personal */}
            {step === 1 && (
              <div>
                <div className="card-title" style={{ fontSize: 17 }}>
                  Personal Information
                </div>
                <div className="card-sub">
                  Verify your details below (pre-filled from your profile).
                </div>
                <div className="form-grid">
                  {[
                    ['Enrollment Number', user?.enrollmentNumber],
                    ['Full Name', user?.name],
                    ['Mobile Number', user?.mobileNumber],
                    ['Department', user?.department],
                    ['Hosteller', user?.isHosteller ? 'Yes' : 'No'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '12px 14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '.5px',
                          marginBottom: 4,
                        }}
                      >
                        {k}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{v}</div>
                    </div>
                  ))}
                  <div>
                    <Field label="Passing Year *" dark>
                      <select
                        className="form-input dark"
                        value={form.passoutYear}
                        onChange={e => setForm(p => ({ ...p, passoutYear: e.target.value }))}
                      >
                        <option value="">Select Year</option>
                        {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-gold" onClick={handleNext}>
                    Next: Bank Details →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 – Bank */}
            {step === 2 && (
              <div>
                <div className="card-title" style={{ fontSize: 17 }}>
                  Bank Account Details
                </div>
                <div className="card-sub">
                  The ₹5,000 refund will be credited to this account. Verify carefully.
                </div>
                <Alert type="warning">
                  🔒 Your bank details are encrypted and used only for processing this refund.
                </Alert>
                <div className="form-grid">
                  <Field label="Account Holder Name *" dark>
                    <input
                      className="form-input dark"
                      placeholder="As per passbook"
                      value={form.bankDetails.accountHolderName}
                      onChange={e => setBank('accountHolderName', e.target.value)}
                    />
                  </Field>
                  <Field label="Bank Name *" dark>
                    <input
                      className="form-input dark"
                      placeholder="e.g. State Bank of India"
                      value={form.bankDetails.bankName}
                      onChange={e => setBank('bankName', e.target.value)}
                    />
                  </Field>
                  <Field label="Account Number *" dark>
                    <input
                      className="form-input dark"
                      placeholder="Bank account number"
                      value={form.bankDetails.accountNumber}
                      onChange={e => setBank('accountNumber', e.target.value)}
                      maxLength={18}
                    />
                  </Field>
                  <Field label="Confirm Account Number *" dark>
                    <input
                      className="form-input dark"
                      placeholder="Re-enter account number"
                      value={form.bankDetails.confirmAccountNumber}
                      onChange={e => setBank('confirmAccountNumber', e.target.value)}
                      maxLength={18}
                    />
                  </Field>
                  <Field label="IFSC Code *" dark>
                    <input
                      className="form-input dark"
                      placeholder="e.g. SBIN0001234"
                      value={form.bankDetails.ifscCode}
                      onChange={e => setBank('ifscCode', e.target.value.toUpperCase())}
                      maxLength={11}
                    />
                  </Field>
                  <Field label="Branch Name" dark>
                    <input
                      className="form-input dark"
                      placeholder="Branch city / locality"
                      value={form.bankDetails.branchName}
                      onChange={e => setBank('branchName', e.target.value)}
                    />
                  </Field>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-outline"
                    style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                  >
                    ← Back
                  </button>
                  <button className="btn btn-gold" onClick={handleNext}>
                    Next: Declaration →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 – Declaration */}
            {step === 3 && (
              <div>
                <div className="card-title" style={{ fontSize: 17 }}>
                  Declaration
                </div>
                <div className="card-sub">Read carefully before submitting.</div>
                <div
                  style={{
                    background: 'var(--bg)',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                    fontSize: 13,
                    color: 'var(--muted)',
                    lineHeight: 1.8,
                  }}
                >
                  <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: 10 }}>
                    Declaration Statement
                  </strong>
                  I hereby solemnly declare that:
                  <ol style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>
                      All information provided by me in this application is true and correct to the
                      best of my knowledge.
                    </li>
                    <li>
                      I have cleared all dues to the college and I am eligible for the caution money
                      refund of ₹5,000.
                    </li>
                    <li>
                      The bank account details provided are correct, and I take full responsibility
                      for any errors.
                    </li>
                    <li>
                      I have not claimed or received this caution money refund previously through
                      any other channel.
                    </li>
                    <li>
                      I understand that submitting false information may lead to rejection and
                      disciplinary action.
                    </li>
                  </ol>
                </div>

                {/* Review summary */}
                <div
                  style={{
                    background: 'var(--gold-pale)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--navy)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 10,
                    }}
                  >
                    Application Summary
                  </div>
                  {[
                    ['Student', user?.name],
                    ['Enrollment', user?.enrollmentNumber],
                    ['Department', user?.department],
                    ['Passing Year', form.passoutYear],
                    ['Bank', form.bankDetails.bankName],
                    ['IFSC', form.bankDetails.ifscCode],
                    ['Refund Amount', '₹5,000'],
                  ].map(([k, v]) => (
                    <div className="bank-row" key={k}>
                      <span className="bank-key">{k}</span>
                      <span className="bank-val">{v}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}
                >
                  <input
                    type="checkbox"
                    id="dec"
                    style={{ marginTop: 3, accentColor: 'var(--gold)', width: 16, height: 16 }}
                    checked={form.declaration}
                    onChange={e => setForm(p => ({ ...p, declaration: e.target.checked }))}
                  />
                  <label
                    htmlFor="dec"
                    style={{
                      fontSize: 14,
                      color: 'var(--text)',
                      lineHeight: 1.6,
                      cursor: 'pointer',
                    }}
                  >
                    I have read and agree to the declaration above. I confirm all information is
                    accurate.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-outline"
                    style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                    onClick={() => {
                      setStep(2);
                      setError('');
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-gold"
                    onClick={handleSubmit}
                    disabled={submitting || !form.declaration}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ borderTopColor: 'var(--navy)' }} />{' '}
                        Submitting…
                      </>
                    ) : (
                      'Submit Application ✓'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
