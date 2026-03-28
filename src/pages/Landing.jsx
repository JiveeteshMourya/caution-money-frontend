import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard', {
        replace: true,
      });
    }
  }, [user, navigate]);

  return (
    <div className="landing-page">
      <div className="land-bg-mesh" />
      <div className="land-circle" style={{ width: 600, height: 600, top: -200, right: -100 }} />
      <div className="land-circle" style={{ width: 400, height: 400, bottom: -100, left: -50 }} />

      <nav className="land-nav">
        <div className="land-logo">
          <div className="land-logo-seal">IE</div>
          <div className="land-logo-text">
            <h1>IEHE Bhopal</h1>
            <p>Institute for Excellence in Higher Education, Bhopal</p>
          </div>
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          Portal Active · 2026
        </div>
      </nav>

      <div className="land-hero">
        <div className="land-eyebrow">✦ Digital Clearance System</div>
        <h1 className="land-title">
          Caution Money
          <br />
          <span className="gold">Refund Portal</span>
        </h1>
        <p className="land-sub">
          A fully digital, end-to-end no-dues clearance and refund system for IEHE graduating
          students — no physical visits required.
        </p>

        <div className="portal-cards">
          <div
            className="portal-card"
            onClick={() => navigate('/student/login')}
            role="button"
            tabIndex={0}
          >
            <div className="portal-card-icon">🎓</div>
            <h3>Student Portal</h3>
            <p>
              Apply for your ₹5,000 caution money refund, track clearance status, and receive your
              refund digitally.
            </p>
            <div className="card-arrow">Enter Portal →</div>
          </div>

          <div
            className="portal-card"
            onClick={() => navigate('/admin/login')}
            role="button"
            tabIndex={0}
          >
            <div className="portal-card-icon">🏛️</div>
            <h3>Admin Portal</h3>
            <p>
              For Library, Sports, Hostel, Department & Accounts staff — manage clearances and
              process refunds.
            </p>
            <div className="card-arrow">Admin Login →</div>
          </div>
        </div>
      </div>

      <div className="land-steps">
        {[
          'Register & Login',
          'Fill Refund Form',
          'Dept. Clearances',
          'Accounts Review',
          '₹5000 Refunded',
        ].map((s, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="step-item">
              <div className="step-num">{i + 1}</div>
              <div className="step-text">{s}</div>
            </div>
            {i < arr.length - 1 && <div className="step-arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
