import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Spinner } from './components/common';

// Pages
import Landing from './pages/Landing';
import StudentAuth from './pages/student/StudentAuth';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentApplication from './pages/student/StudentApplication';
import StudentStatus from './pages/student/StudentStatus';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail';
import { AdminClearances, AdminRefunds } from './pages/admin/AdminClearancesAndRefunds';

// ── Protected Route Guards ────────────────────────────────────────
const RequireStudent = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/student/login" replace />;
  if (user.role !== 'student') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const RequireAdmin = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// ── App Routes ────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/student/login" element={<StudentAuth />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Student */}
      <Route
        path="/student/dashboard"
        element={
          <RequireStudent>
            <StudentDashboard />
          </RequireStudent>
        }
      />
      <Route
        path="/student/application"
        element={
          <RequireStudent>
            <StudentApplication />
          </RequireStudent>
        }
      />
      <Route
        path="/student/status"
        element={
          <RequireStudent>
            <StudentStatus />
          </RequireStudent>
        }
      />
      <Route
        path="/student/profile"
        element={
          <RequireStudent>
            <StudentDashboard />
          </RequireStudent>
        }
      />

      {/* Admin — all roles */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <RequireAdmin>
            <AdminApplications />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/application/:id"
        element={
          <RequireAdmin>
            <AdminApplicationDetail />
          </RequireAdmin>
        }
      />

      {/* Dept-specific */}
      <Route
        path="/admin/clearances"
        element={
          <RequireAdmin roles={['library', 'sports', 'hostel', 'department', 'superadmin']}>
            <AdminClearances />
          </RequireAdmin>
        }
      />

      {/* Accounts + superadmin */}
      <Route
        path="/admin/refunds"
        element={
          <RequireAdmin roles={['accounts', 'superadmin']}>
            <AdminRefunds />
          </RequireAdmin>
        }
      />

      {/* Fallbacks */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'DM Sans', fontSize: 14, borderRadius: 12, padding: '12px 18px' },
            success: { iconTheme: { primary: '#c9a84c', secondary: '#0a1628' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
