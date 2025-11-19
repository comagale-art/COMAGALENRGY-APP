import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientData } from '../types';
import { 
  getClientData as fetchClientData,
  addClientData as createClientData,
  deleteClientData as deleteClientDataFromDb
} from '../firebase/services';

interface ClientDataContextType {
  clientData: ClientData[];
  addClientData: (clientData: Omit<ClientData, 'id' | 'createdAt'>) => Promise<void>;
  deleteClientData: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshClientData: () => Promise<void>;
}

const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

export const ClientDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedClientData = await fetchClientData();
      setClientData(fetchedClientData);
    } catch (err: any) {
      console.error('Error loading client data:', err);
      setError('Erreur lors du chargement des clients');
      setClientData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, []);

  const addClientData = async (clientDataInput: Omit<ClientData, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const newClientData = {
        ...clientDataInput,
        createdAt: now.toISOString()
      };

      await createClientData(newClientData);
      await loadClientData();
    } catch (err: any) {
      console.error('Error adding client data:', err);
      setError(err.message || 'Erreur lors de l\'ajout du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteClientData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteClientDataFromDb(id);
      await loadClientData();
    } catch (err: any) {
      console.error('Error deleting client data:', err);
      setError(err.message || 'Erreur lors de la suppression du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshClientData = async () => {
    await loadClientData();
  };

  return (
    <ClientDataContext.Provider value={{
      clientData,
      addClientData,
      deleteClientData,
      loading,
      error,
      refreshClientData
    }}>
      {children}
    </ClientDataContext.Provider>
  );
};

export const useClientData = (): ClientDataContextType => {
  const context = useContext(ClientDataContext);
  if (context === undefined) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  return context;
};