import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientTransaction, ClientPayment } from '../types';
import { 
  getClientTransactions,
  addClientTransaction,
  deleteClientTransaction,
  getClientPayments,
  addClientPayment,
  deleteClientPayment
} from '../firebase/services/clientTracking';

interface ClientTrackingContextType {
  transactions: ClientTransaction[];
  payments: ClientPayment[];
  addTransaction: (data: Omit<ClientTransaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPayment: (data: Omit<ClientPayment, 'id' | 'createdAt'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const ClientTrackingContext = createContext<ClientTrackingContextType | undefined>(undefined);

export const ClientTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedTransactions, fetchedPayments] = await Promise.all([
        getClientTransactions(),
        getClientPayments()
      ]);
      setTransactions(fetchedTransactions);
      setPayments(fetchedPayments);
    } catch (err) {
      console.error('Error loading client tracking data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addTransaction = async (data: Omit<ClientTransaction, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      await addClientTransaction(data);
      await loadData();
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError(null);
      await deleteClientTransaction(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const addPayment = async (data: Omit<ClientPayment, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      await addClientPayment(data);
      await loadData();
    } catch (err) {
      console.error('Error adding payment:', err);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      setError(null);
      await deleteClientPayment(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  return (
    <ClientTrackingContext.Provider value={{
      transactions,
      payments,
      addTransaction,
      deleteTransaction,
      addPayment,
      deletePayment,
      loading,
      error,
      refreshData: loadData
    }}>
      {children}
    </ClientTrackingContext.Provider>
  );
};

export const useClientTracking = (): ClientTrackingContextType => {
  const context = useContext(ClientTrackingContext);
  if (context === undefined) {
    throw new Error('useClientTracking must be used within a ClientTrackingProvider');
  }
  return context;
};