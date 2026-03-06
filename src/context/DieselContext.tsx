import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DieselConsumption, DieselSummary, DieselVehicleSummary } from '../types';
import { supabase } from '../firebase/config';

interface DieselContextType {
  consumptions: DieselConsumption[];
  loading: boolean;
  addConsumption: (consumption: Omit<DieselConsumption, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateConsumption: (id: string, consumption: Partial<DieselConsumption>) => Promise<void>;
  deleteConsumption: (id: string) => Promise<void>;
  getSummary: (startDate?: string, endDate?: string) => DieselSummary;
  getVehicleSummary: (startDate?: string, endDate?: string) => DieselVehicleSummary[];
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
      const { data, error } = await supabase
        .from('diesel_consumption')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setConsumptions(data || []);
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
      const { data, error } = await supabase
        .from('diesel_consumption')
        .insert([consumption])
        .select()
        .single();

      if (error) throw error;
      setConsumptions(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding diesel consumption:', error);
      throw error;
    }
  };

  const updateConsumption = async (id: string, consumption: Partial<DieselConsumption>) => {
    try {
      const { data, error } = await supabase
        .from('diesel_consumption')
        .update({ ...consumption, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setConsumptions(prev => prev.map(c => c.id === id ? data : c));
    } catch (error) {
      console.error('Error updating diesel consumption:', error);
      throw error;
    }
  };

  const deleteConsumption = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diesel_consumption')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConsumptions(prev => prev.filter(c => c.id !== id));
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

  const getVehicleSummary = (startDate?: string, endDate?: string): DieselVehicleSummary[] => {
    let filtered = consumptions;

    if (startDate) {
      filtered = filtered.filter(c => c.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(c => c.date <= endDate);
    }

    const summaryMap = new Map<string, DieselVehicleSummary>();

    filtered.forEach(consumption => {
      const existing = summaryMap.get(consumption.vehicle_name) || {
        vehicle_name: consumption.vehicle_name,
        totalAmount: 0,
        totalLiters: 0,
      };

      existing.totalAmount += Number(consumption.amount_dh);
      existing.totalLiters += Number(consumption.liters_calculated);

      summaryMap.set(consumption.vehicle_name, existing);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const value: DieselContextType = {
    consumptions,
    loading,
    addConsumption,
    updateConsumption,
    deleteConsumption,
    getSummary,
    getVehicleSummary,
    fetchConsumptions,
  };

  return <DieselContext.Provider value={value}>{children}</DieselContext.Provider>;
};
