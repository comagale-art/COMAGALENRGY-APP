import React, { useState } from 'react';
import { Moon, Sun, LogOut, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ChangeCredentialsForm from '../components/settings/ChangeCredentialsForm';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos préférences d'application
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Apparence">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Mode d'affichage</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </Button>
          </div>
        </Card>
        
        <Card title="Compte">
          {user && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                <p className="text-gray-800 dark:text-white">{user.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-800 dark:text-white">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
                <p className="text-gray-800 dark:text-white">
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </p>
              </div>
              
              <div className="flex flex-col space-y-2 pt-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button variant="outline" onClick={() => setShowCredentialsForm(!showCredentialsForm)}>
                  <Key size={20} className="mr-2" />
                  {showCredentialsForm ? 'Masquer le formulaire' : 'Changer identifiants'}
                </Button>
                
                <Button variant="danger" onClick={logout}>
                  <LogOut size={20} className="mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        {showCredentialsForm && (
          <div className="md:col-span-2">
            <Card title="Changer les identifiants de connexion">
              <ChangeCredentialsForm />
            </Card>
          </div>
        )}
        
        <Card title="À propos">
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">Sarije COMAGAL ENERGY</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application de gestion des stocks et des fournisseurs pour COMAGAL ENERGY.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;