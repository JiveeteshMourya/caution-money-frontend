import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { getInitials } from '@/utils/formatters';
import { ROLE_LABELS } from '@/config/constants';

const StudentSidebar = ({ user }) => {
  const links = [
    { to: '/student/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/student/application', icon: '📋', label: 'My Application' },
    { to: '/student/status', icon: '🔍', label: 'Clearance Status' },
    { to: '/student/profile', icon: '👤', label: 'My Profile' },
  ];
  return (
    <nav className="sidebar-nav">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
};

const AdminSidebar = ({ user }) => {
  const role = user?.role;
  const allLinks = [
    {
      to: '/admin/dashboard',
      icon: '📊',
      label: 'Dashboard',
      roles: ['superadmin', 'library', 'sports', 'hostel', 'department', 'accounts'],
    },
    {
      to: '/admin/applications',
      icon: '📋',
      label: 'Applications',
      roles: ['superadmin', 'library', 'sports', 'hostel', 'department', 'accounts'],
    },
    {
      to: '/admin/clearances',
      icon: '✅',
      label: 'My Clearances',
      roles: ['library', 'sports', 'hostel', 'department'],
    },
    { to: '/admin/refunds', icon: '💰', label: 'Refund Queue', roles: ['accounts', 'superadmin'] },
  ];
  const links = allLinks.filter(l => l.roles.includes(role));
  return (
    <nav className="sidebar-nav">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
};

export const Sidebar = ({ type = 'student' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mobileMenuOpen, closeMobileMenu } = useLayout();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = type === 'student' ? 'Student Portal' : ROLE_LABELS[user?.role] || 'Admin';

  return (
    <>
      <div
        className={`sidebar-overlay${mobileMenuOpen ? ' visible' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />
      <aside className={`sidebar${mobileMenuOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="seal">IE</div>
          <h2>IEHE Bhopal</h2>
          <p>Caution Money Portal</p>
        </div>

        <div className="sidebar-role">
          <div className="rl">Logged in as</div>
          <div className="rn">{roleLabel}</div>
        </div>

        {type === 'student' ? <StudentSidebar user={user} /> : <AdminSidebar user={user} />}

        <div className="sidebar-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              marginBottom: 10,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
            }}
          >
            <div className="user-av" style={{ width: 32, height: 32, fontSize: 12 }}>
              {getInitials(user?.name || user?.enrollmentNumber || 'U')}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  color: 'white',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name || user?.enrollmentNumber}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                {type === 'student' ? user?.department : user?.email}
              </div>
            </div>
          </div>
          <button className="btn-logout" style={{ width: '100%' }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const Topbar = ({ title }) => {
  const { user } = useAuth();
  const { toggleMobileMenu } = useLayout();
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle navigation">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-right">
        <div className="user-chip">
          <div className="user-av">{getInitials(user?.name || 'U')}</div>
          <span>{user?.name?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
    </div>
  );
};
