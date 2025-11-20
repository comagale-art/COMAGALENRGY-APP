import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Accueil' },
      { path: '/suppliers', label: 'Fournisseurs' },
      { path: '/tanks', label: 'Citernes' },
      { path: '/calculator', label: 'Calculatrice' },
      { path: '/barrels', label: 'Baril' }
    ];

    if (user?.role === 'admin') {
      baseLinks.push(
        { path: '/invoices', label: 'Factures' },
        { path: '/client-data', label: 'Clients' },
        { path: '/supplier-tracking', label: 'Suivi Fournisseur' },
        { path: '/client-tracking', label: 'Suivi Client' },
        { path: '/truck-consumption', label: 'Suivi Camions' },
        { path: '/big-suppliers', label: 'Grand Fournisseur' },
        { path: '/orders', label: 'Commande' },
        { path: '/calendar', label: 'Calendrier' },
        { path: '/search', label: 'Recherche' },
        { path: '/settings', label: 'Paramètres' }
      );
    } else {
      baseLinks.push(
        { path: '/settings', label: 'Paramètres' }
      );
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();
  
  return (
    <header className="sticky top-0 z-10 bg-white shadow-md dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://comagale.com/wp-content/uploads/2025/01/logo-COMAGAL-ENERGY-300x300.png"
                alt="COMAGAL ENERGY Logo"
                className="h-8 w-8 rounded-full sm:h-10 sm:w-10"
              />
              <span className="ml-2 text-sm font-bold text-comagal-blue dark:text-white sm:ml-3 sm:text-xl">
                Gestion COMAGAL ENERGY
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-comagal-blue dark:hover:text-comagal-light-blue ${
                      isActive(link.path)
                        ? 'text-comagal-blue dark:text-comagal-light-blue'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user && (
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
            
            <button
              onClick={toggleMenu}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-comagal-blue bg-opacity-10 text-comagal-blue dark:bg-opacity-20 dark:text-comagal-light-blue'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;