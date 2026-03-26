import { Routes, Route, Navigate } from 'react-router-dom';
import RequireStudent from '@/router/RequireStudent';
import RequireAdmin from '@/router/RequireAdmin';
import Landing from '@/pages/Landing';
import StudentAuth from '@/pages/student/StudentAuth';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentApplication from '@/pages/student/StudentApplication';
import StudentStatus from '@/pages/student/StudentStatus';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminApplicationDetail from '@/pages/admin/AdminApplicationDetail';
import AdminClearances from '@/pages/admin/AdminClearances';
import AdminRefunds from '@/pages/admin/AdminRefunds';

export default function AppRoutes() {
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
