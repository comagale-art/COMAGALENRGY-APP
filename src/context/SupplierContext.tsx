import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier } from '../types';
import { mockSuppliers, currentStockLevel } from '../utils/mockData';
import { calculateBarrels, calculateKgQuantity } from '../utils/calculations';
import { 
  getSuppliers as fetchSuppliers,
  addSupplier as createSupplier,
  updateSupplier as updateSupplierInDb,
  deleteSupplier as deleteSupplierFromDb,
  filterSuppliers as filterSuppliersInDb,
  getCurrentStock as fetchCurrentStock
} from '../firebase/services';

interface SupplierContextType {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'barrels' | 'kgQuantity' | 'createdAt' | 'deliveryTime' | 'stockLevel'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  currentStock: number;
  getSupplierById: (id: string) => Supplier | undefined;
  filterSuppliers: (query: string, startDate?: string, endDate?: string) => Promise<Supplier[]>;
  loading: boolean;
  error: string | null;
  refreshSuppliers: () => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFirebase, setUseFirebase] = useState(true);

  const calculateStockLevels = (suppliersList: Supplier[]): Supplier[] => {
    // Sort suppliers by date and time in ascending order
    const sortedSuppliers = [...suppliersList].sort((a, b) => {
      const dateTimeA = new Date(`${a.deliveryDate}T${a.deliveryTime}`).getTime();
      const dateTimeB = new Date(`${b.deliveryDate}T${b.deliveryTime}`).getTime();
      return dateTimeA - dateTimeB;
    });

    // Calculate cumulative stock level
    let runningTotal = 0;
    return sortedSuppliers.map(supplier => {
      runningTotal += supplier.quantity;
      return {
        ...supplier,
        stockLevel: Number(runningTotal.toFixed(2))
      };
    });
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (useFirebase) {
        const fetchedSuppliers = await fetchSuppliers();
        const updatedSuppliers = calculateStockLevels(fetchedSuppliers);
        const totalStock = updatedSuppliers.length > 0 
          ? updatedSuppliers[updatedSuppliers.length - 1].stockLevel 
          : 0;

        setSuppliers(updatedSuppliers);
        setCurrentStock(totalStock);
      } else {
        const mockData = calculateStockLevels(mockSuppliers);
        setSuppliers(mockData);
        setCurrentStock(mockData.length > 0 ? mockData[mockData.length - 1].stockLevel : 0);
      }
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError('Erreur lors du chargement des données. Utilisation des données locales.');
      setUseFirebase(false);
      const mockData = calculateStockLevels(mockSuppliers);
      setSuppliers(mockData);
      setCurrentStock(mockData.length > 0 ? mockData[mockData.length - 1].stockLevel : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const validateSupplierData = (data: Partial<Supplier>) => {
    if (!data) {
      throw new Error('Les données du fournisseur sont requises');
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Le nom du fournisseur est requis');
    }

    if (data.deliveryDate !== undefined && !data.deliveryDate) {
      throw new Error('La date de livraison est requise');
    }

    if (data.quantity !== undefined) {
      if (typeof data.quantity !== 'number' || isNaN(data.quantity)) {
        throw new Error('La quantité doit être un nombre valide');
      }
    }
  };

  const refreshSuppliers = async () => {
    await loadInitialData();
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'barrels' | 'kgQuantity' | 'createdAt' | 'deliveryTime' | 'stockLevel'> & { kgPerBarrel?: number }) => {
    try {
      setLoading(true);
      setError(null);
      
      validateSupplierData(supplierData);
      
      const kgPerBarrel = supplierData.kgPerBarrel || 185;
      const barrels = calculateBarrels(supplierData.quantity);
      const kgQuantity = calculateKgQuantity(barrels, kgPerBarrel);
      const now = new Date();
      const deliveryTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Remove kgPerBarrel from the data to be saved
      const { kgPerBarrel: _, ...cleanSupplierData } = supplierData;
      
      const newSupplier = {
        ...cleanSupplierData,
        barrels,
        kgQuantity,
        deliveryTime,
        stockLevel: 0, // This will be calculated properly when we update the list
        createdAt: now.toISOString()
      };
      
      if (useFirebase) {
        await createSupplier(newSupplier);
      } else {
        const localSupplier: Supplier = {
          id: `sup-${Date.now()}`,
          ...newSupplier
        };
        const updatedSuppliers = calculateStockLevels([...suppliers, localSupplier]);
        setSuppliers(updatedSuppliers);
        setCurrentStock(updatedSuppliers[updatedSuppliers.length - 1].stockLevel);
      }
      
      await refreshSuppliers();
    } catch (err: any) {
      console.error('Error adding supplier:', err);
      setError(err.message || 'Erreur lors de l\'ajout du fournisseur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier> & { kgPerBarrel?: number }) => {
    try {
      setLoading(true);
      setError(null);

      validateSupplierData(supplierData);

      let updatedData: any = { ...supplierData };

      if (supplierData.quantity !== undefined) {
        const kgPerBarrel = supplierData.kgPerBarrel || 185;
        const barrels = calculateBarrels(supplierData.quantity);
        const kgQuantity = calculateKgQuantity(barrels, kgPerBarrel);
        updatedData = {
          ...updatedData,
          barrels,
          kgQuantity
        };
        // Remove kgPerBarrel from the data to be saved
        delete updatedData.kgPerBarrel;
      }

      if (useFirebase) {
        await updateSupplierInDb(id, updatedData);
      } else {
        const updatedSuppliers = suppliers.map(supplier => 
          supplier.id === id ? { ...supplier, ...updatedData } : supplier
        );
        const recalculatedSuppliers = calculateStockLevels(updatedSuppliers);
        setSuppliers(recalculatedSuppliers);
        setCurrentStock(recalculatedSuppliers[recalculatedSuppliers.length - 1].stockLevel);
      }

      await refreshSuppliers();
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      setError(err.message || 'Erreur lors de la mise à jour du fournisseur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useFirebase) {
        await deleteSupplierFromDb(id);
      } else {
        const updatedSuppliers = suppliers.filter(s => s.id !== id);
        const recalculatedSuppliers = calculateStockLevels(updatedSuppliers);
        setSuppliers(recalculatedSuppliers);
        setCurrentStock(recalculatedSuppliers.length > 0 
          ? recalculatedSuppliers[recalculatedSuppliers.length - 1].stockLevel 
          : 0
        );
      }
      
      await refreshSuppliers();
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      setError(err.message || 'Erreur lors de la suppression du fournisseur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupplierById = (id: string) => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const filterSuppliers = async (query: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useFirebase) {
        const filteredSuppliers = await filterSuppliersInDb(query, startDate, endDate);
        return calculateStockLevels(filteredSuppliers);
      } else {
        const filtered = suppliers.filter(supplier => {
          const matchesQuery = query 
            ? supplier.name.toLowerCase().includes(query.toLowerCase())
            : true;
          
          const matchesDateRange = startDate && endDate
            ? supplier.deliveryDate >= startDate && supplier.deliveryDate <= endDate
            : startDate 
              ? supplier.deliveryDate >= startDate
              : endDate
                ? supplier.deliveryDate <= endDate
                : true;
          
          return matchesQuery && matchesDateRange;
        });
        return calculateStockLevels(filtered);
      }
    } catch (err: any) {
      console.error('Error filtering suppliers:', err);
      setError(err.message || 'Erreur lors de la recherche');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupplierContext.Provider 
      value={{ 
        suppliers, 
        addSupplier, 
        updateSupplier, 
        deleteSupplier, 
        currentStock,
        getSupplierById,
        filterSuppliers,
        loading,
        error,
        refreshSuppliers
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = (): SupplierContextType => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};