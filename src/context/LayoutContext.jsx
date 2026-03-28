import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <LayoutContext.Provider value={{ mobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
