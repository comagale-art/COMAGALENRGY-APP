import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice } from '../types';
import { 
  getInvoices as fetchInvoices,
  addInvoice as createInvoice,
  deleteInvoice as deleteInvoiceFromDb
} from '../firebase/services/invoices';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshInvoices: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedInvoices = await fetchInvoices();
      setInvoices(fetchedInvoices);
    } catch (err: any) {
      console.error('Error loading invoices:', err);
      setError('Erreur lors du chargement des factures');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => {
    try {
      setLoading(true);
      setError(null);
      await createInvoice(invoiceData);
      await loadInvoices();
    } catch (err: any) {
      console.error('Error adding invoice:', err);
      setError(err.message || 'Erreur lors de la création de la facture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteInvoiceFromDb(id);
      await loadInvoices();
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      setError(err.message || 'Erreur lors de la suppression de la facture');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshInvoices = async () => {
    await loadInvoices();
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      addInvoice,
      deleteInvoice,
      loading,
      error,
      refreshInvoices
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};