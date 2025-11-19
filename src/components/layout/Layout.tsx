import React from 'react';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-6">
        {children}
      </main>
      <footer className="bg-white py-4 text-center text-sm text-gray-600 shadow-inner dark:bg-gray-800 dark:text-gray-400">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Sarije COMAGAL ENERGY. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Layout;