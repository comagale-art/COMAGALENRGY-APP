import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../types';
import { 
  getOrders as fetchOrders,
  addOrder as createOrder,
  deleteOrder as deleteOrderFromDb
} from '../firebase/services';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'time'>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Erreur lors du chargement des commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'time'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const newOrder = {
        ...orderData,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: now.toISOString()
      };

      await createOrder(newOrder);
      await loadOrders();
    } catch (err: any) {
      console.error('Error adding order:', err);
      setError(err.message || 'Erreur lors de l\'ajout de la commande');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteOrderFromDb(id);
      await loadOrders();
    } catch (err: any) {
      console.error('Error deleting order:', err);
      setError(err.message || 'Erreur lors de la suppression de la commande');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      deleteOrder,
      loading,
      error,
      refreshOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};