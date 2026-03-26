import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/router/AppRoutes';

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
