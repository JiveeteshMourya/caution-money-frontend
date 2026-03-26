import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/common';

const centerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
};

export default function RequireStudent({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div style={centerStyle}>
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/student/login" replace />;
  if (user.role !== 'student') return <Navigate to="/admin/dashboard" replace />;
  return children;
}
