import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DieselConsumption, DieselSummary } from '../types';
import {
  getDieselConsumptions,
  addDieselConsumption,
  updateDieselConsumption,
  deleteDieselConsumption
} from '../firebase/services/dieselConsumption';

interface DieselContextType {
  consumptions: DieselConsumption[];
  loading: boolean;
  addConsumption: (consumption: Omit<DieselConsumption, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateConsumption: (id: string, consumption: Partial<DieselConsumption>) => Promise<void>;
  deleteConsumption: (id: string) => Promise<void>;
  getSummary: (startDate?: string, endDate?: string) => DieselSummary;
  fetchConsumptions: () => Promise<void>;
}

const DieselContext = createContext<DieselContextType | undefined>(undefined);

export const useDiesel = () => {
  const context = useContext(DieselContext);
  if (!context) {
    throw new Error('useDiesel must be used within a DieselProvider');
  }
  return context;
};

interface DieselProviderProps {
  children: ReactNode;
}

export const DieselProvider: React.FC<DieselProviderProps> = ({ children }) => {
  const [consumptions, setConsumptions] = useState<DieselConsumption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsumptions = async () => {
    try {
      setLoading(true);
      const data = await getDieselConsumptions();
      setConsumptions(data);
    } catch (error) {
      console.error('Error fetching diesel consumptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumptions();
  }, []);

  const addConsumption = async (consumption: Omit<DieselConsumption, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addDieselConsumption(consumption);
      await fetchConsumptions();
    } catch (error) {
      console.error('Error adding diesel consumption:', error);
      throw error;
    }
  };

  const updateConsumption = async (id: string, consumption: Partial<DieselConsumption>) => {
    try {
      await updateDieselConsumption(id, consumption);
      await fetchConsumptions();
    } catch (error) {
      console.error('Error updating diesel consumption:', error);
      throw error;
    }
  };

  const deleteConsumption = async (id: string) => {
    try {
      await deleteDieselConsumption(id);
      await fetchConsumptions();
    } catch (error) {
      console.error('Error deleting diesel consumption:', error);
      throw error;
    }
  };

  const getSummary = (startDate?: string, endDate?: string): DieselSummary => {
    let filtered = consumptions;

    if (startDate) {
      filtered = filtered.filter(c => c.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(c => c.date <= endDate);
    }

    return filtered.reduce(
      (acc, curr) => ({
        totalAmount: acc.totalAmount + Number(curr.amount_dh),
        totalLiters: acc.totalLiters + Number(curr.liters_calculated),
      }),
      { totalAmount: 0, totalLiters: 0 }
    );
  };

  const value: DieselContextType = {
    consumptions,
    loading,
    addConsumption,
    updateConsumption,
    deleteConsumption,
    getSummary,
    fetchConsumptions,
  };

  return <DieselContext.Provider value={value}>{children}</DieselContext.Provider>;
};
