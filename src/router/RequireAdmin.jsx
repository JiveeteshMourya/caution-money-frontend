import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/common';

const centerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
};

export default function RequireAdmin({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div style={centerStyle}>
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
