import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { LayoutProvider } from '@/context/LayoutContext';
import AppRoutes from '@/router/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'DM Sans',
                fontSize: 14,
                borderRadius: 12,
                padding: '12px 18px',
              },
              success: { iconTheme: { primary: '#c9a84c', secondary: '#0a1628' } },
            }}
          />
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
