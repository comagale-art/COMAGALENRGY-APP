import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '../types';
import { 
  getClients as fetchClients,
  addClient as createClient,
  deleteClient as deleteClientFromDb
} from '../firebase/services';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedClients = await fetchClients();
      setClients(fetchedClients);
    } catch (err: any) {
      console.error('Error loading clients:', err);
      setError('Erreur lors du chargement des clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const newClient = {
        ...clientData,
        createdAt: now.toISOString()
      };

      await createClient(newClient);
      await loadClients();
    } catch (err: any) {
      console.error('Error adding client:', err);
      setError(err.message || 'Erreur lors de l\'ajout du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteClientFromDb(id);
      await loadClients();
    } catch (err: any) {
      console.error('Error deleting client:', err);
      setError(err.message || 'Erreur lors de la suppression du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshClients = async () => {
    await loadClients();
  };

  return (
    <ClientContext.Provider value={{
      clients,
      addClient,
      deleteClient,
      loading,
      error,
      refreshClients
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};