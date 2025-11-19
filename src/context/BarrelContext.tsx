import React, { createContext, useContext, useState, useEffect } from 'react';
import { Barrel } from '../types';
import {
  getBarrels as fetchBarrels,
  addBarrel as createBarrel,
  updateBarrel as updateBarrelInDb,
  deleteBarrel as deleteBarrelFromDb,
} from '../firebase/services/barrels';

interface BarrelContextType {
  barrels: Barrel[];
  addBarrel: (barrel: Omit<Barrel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBarrel: (id: string, barrel: Partial<Barrel>) => Promise<void>;
  deleteBarrel: (id: string) => Promise<void>;
  getBarrelById: (id: string) => Barrel | undefined;
  loading: boolean;
  error: string | null;
  refreshBarrels: () => Promise<void>;
}

const BarrelContext = createContext<BarrelContextType | undefined>(undefined);

export const BarrelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [barrels, setBarrels] = useState<Barrel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBarrels = await fetchBarrels();
      setBarrels(fetchedBarrels);
    } catch (err: any) {
      console.error('Error loading barrels:', err);
      setError('Erreur lors du chargement des barils');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshBarrels = async () => {
    await loadInitialData();
  };

  const addBarrel = async (barrelData: Omit<Barrel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);

      if (!barrelData.date) {
        throw new Error('La date est requise');
      }

      if (!barrelData.barrelNumber.trim()) {
        throw new Error('Le numéro de baril est requis');
      }

      if (!barrelData.product.trim()) {
        throw new Error('Le produit est requis');
      }

      if (!barrelData.supplier.trim()) {
        throw new Error('Le fournisseur est requis');
      }

      if (!barrelData.quantity) {
        throw new Error('La quantité est requise');
      }

      const newBarrel = await createBarrel(barrelData);
      setBarrels([newBarrel, ...barrels]);

      await refreshBarrels();
    } catch (err: any) {
      console.error('Error adding barrel:', err);
      setError(err.message || 'Erreur lors de l\'ajout du baril');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBarrel = async (id: string, barrelData: Partial<Barrel>) => {
    try {
      setLoading(true);
      setError(null);

      await updateBarrelInDb(id, barrelData);

      await refreshBarrels();
    } catch (err: any) {
      console.error('Error updating barrel:', err);
      setError(err.message || 'Erreur lors de la mise à jour du baril');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBarrel = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await deleteBarrelFromDb(id);
      setBarrels(barrels.filter(b => b.id !== id));

      await refreshBarrels();
    } catch (err: any) {
      console.error('Error deleting barrel:', err);
      setError(err.message || 'Erreur lors de la suppression du baril');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBarrelById = (id: string) => {
    return barrels.find(barrel => barrel.id === id);
  };

  return (
    <BarrelContext.Provider
      value={{
        barrels,
        addBarrel,
        updateBarrel,
        deleteBarrel,
        getBarrelById,
        loading,
        error,
        refreshBarrels,
      }}
    >
      {children}
    </BarrelContext.Provider>
  );
};

export const useBarrels = (): BarrelContextType => {
  const context = useContext(BarrelContext);
  if (context === undefined) {
    throw new Error('useBarrels must be used within a BarrelProvider');
  }
  return context;
};
