import React, { createContext, useContext, useState, useEffect } from 'react';
import { BigSupplier } from '../types';
import { 
  getBigSuppliers as fetchBigSuppliers,
  addBigSupplier as createBigSupplier,
  deleteBigSupplier as deleteBigSupplierFromDb
} from '../firebase/services/bigSuppliers';

interface BigSupplierContextType {
  bigSuppliers: BigSupplier[];
  addBigSupplier: (supplier: Omit<BigSupplier, 'id' | 'createdAt' | 'time'>) => Promise<void>;
  deleteBigSupplier: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshBigSuppliers: () => Promise<void>;
}

const BigSupplierContext = createContext<BigSupplierContextType | undefined>(undefined);

export const BigSupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bigSuppliers, setBigSuppliers] = useState<BigSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBigSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSuppliers = await fetchBigSuppliers();
      setBigSuppliers(fetchedSuppliers);
    } catch (err: any) {
      console.error('Error loading big suppliers:', err);
      setError('Erreur lors du chargement des grands fournisseurs');
      setBigSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBigSuppliers();
  }, []);

  const addBigSupplier = async (supplierData: Omit<BigSupplier, 'id' | 'createdAt' | 'time'>) => {
    try {
      setLoading(true);
      setError(null);
      await createBigSupplier(supplierData);
      await loadBigSuppliers();
    } catch (err: any) {
      console.error('Error adding big supplier:', err);
      setError(err.message || 'Erreur lors de l\'ajout du grand fournisseur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBigSupplier = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteBigSupplierFromDb(id);
      await loadBigSuppliers();
    } catch (err: any) {
      console.error('Error deleting big supplier:', err);
      setError(err.message || 'Erreur lors de la suppression du grand fournisseur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshBigSuppliers = async () => {
    await loadBigSuppliers();
  };

  return (
    <BigSupplierContext.Provider value={{
      bigSuppliers,
      addBigSupplier,
      deleteBigSupplier,
      loading,
      error,
      refreshBigSuppliers
    }}>
      {children}
    </BigSupplierContext.Provider>
  );
};

export const useBigSuppliers = (): BigSupplierContextType => {
  const context = useContext(BigSupplierContext);
  if (context === undefined) {
    throw new Error('useBigSuppliers must be used within a BigSupplierProvider');
  }
  return context;
};