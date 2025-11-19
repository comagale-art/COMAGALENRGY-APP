import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ChangeCredentialsData } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  changeCredentials: (data: ChangeCredentialsData) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users
const USERS = {
  standard: {
    id: 'user-1',
    username: 'Comagal energy',
    password: '121118',
    name: 'Utilisateur COMAGAL',
    email: 'user@comagal-energy.com',
    role: 'user' as const
  },
  admin: {
    id: 'admin-1',
    username: 'Comagal admin',
    password: '121118',
    name: 'Admin COMAGAL',
    email: 'admin@comagal-energy.com',
    role: 'admin' as const
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Check for saved auth state
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Check standard user credentials
      if (username === USERS.standard.username && password === USERS.standard.password) {
        const standardUser: User = {
          id: USERS.standard.id,
          name: USERS.standard.name,
          email: USERS.standard.email,
          role: USERS.standard.role
        };
        setUser(standardUser);
        localStorage.setItem('user', JSON.stringify(standardUser));
        return true;
      }
      
      // Check admin credentials
      if (username === USERS.admin.username && password === USERS.admin.password) {
        const adminUser: User = {
          id: USERS.admin.id,
          name: USERS.admin.name,
          email: USERS.admin.email,
          role: USERS.admin.role
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  const changeCredentials = async (data: ChangeCredentialsData): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: 'La modification des identifiants est désactivée pour cette version.'
    };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      loading,
      changeCredentials 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};