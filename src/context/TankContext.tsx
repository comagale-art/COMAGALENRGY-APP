import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tank } from '../types';
import { 
  getTanks as fetchTanks,
  addTank as createTank,
  updateTank as updateTankInDb,
  deleteTank as deleteTankFromDb
} from '../firebase/services';

interface TankContextType {
  tanks: Tank[];
  addTank: (tank: Omit<Tank, 'id' | 'time'>) => Promise<void>;
  updateTank: (id: string, tank: Partial<Tank>) => Promise<void>;
  deleteTank: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshTanks: () => Promise<void>;
}

const TankContext = createContext<TankContextType | undefined>(undefined);

export const TankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTanks = await fetchTanks();
      const sortedTanks = fetchedTanks.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      setTanks(sortedTanks);
    } catch (err: any) {
      console.error('Error loading tanks:', err);
      setError(err.message || 'Erreur lors du chargement des citernes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTanks();
  }, []);

  const validateTankData = (data: Partial<Tank>) => {
    if (!data) {
      throw new Error('Les données de la citerne sont requises');
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Le nom de la citerne est requis');
    }

    if (data.productType !== undefined && !data.productType.trim()) {
      throw new Error('Le type de produit est requis');
    }

    if (data.date !== undefined && !data.date) {
      throw new Error('La date est requise');
    }

    if (data.quantity !== undefined) {
      if (typeof data.quantity !== 'number' || isNaN(data.quantity)) {
        throw new Error('La quantité doit être un nombre valide');
      }
    }
  };

  const addTank = async (tankData: Omit<Tank, 'id' | 'time'>) => {
    try {
      setLoading(true);
      setError(null);
      validateTankData(tankData);
      await createTank(tankData);
      await loadTanks();
    } catch (err: any) {
      console.error('Error adding tank:', err);
      setError(err.message || 'Erreur lors de l\'ajout de la citerne');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTank = async (id: string, tankData: Partial<Tank>) => {
    try {
      setLoading(true);
      setError(null);
      validateTankData(tankData);
      await updateTankInDb(id, tankData);
      await loadTanks();
    } catch (err: any) {
      console.error('Error updating tank:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la citerne');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTank = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteTankFromDb(id);
      await loadTanks();
    } catch (err: any) {
      console.error('Error deleting tank:', err);
      setError(err.message || 'Erreur lors de la suppression de la citerne');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshTanks = async () => {
    await loadTanks();
  };

  return (
    <TankContext.Provider value={{
      tanks,
      addTank,
      updateTank,
      deleteTank,
      loading,
      error,
      refreshTanks
    }}>
      {children}
    </TankContext.Provider>
  );
};

export const useTanks = (): TankContextType => {
  const context = useContext(TankContext);
  if (context === undefined) {
    throw new Error('useTanks must be used within a TankProvider');
  }
  return context;
};