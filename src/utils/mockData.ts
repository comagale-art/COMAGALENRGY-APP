import { Supplier, Tank, Order } from '../types';
import { format, subDays } from 'date-fns';

// Generate mock suppliers
const generateMockSuppliers = (): Supplier[] => {
  const today = new Date();
  const result: Supplier[] = [];
  let currentStock = 120;

  return result;
};

// Generate mock tanks
const generateMockTanks = (): Tank[] => {
  const today = new Date();
  const result: Tank[] = [];

  return result;
};

// Generate mock orders
const generateMockOrders = (): Order[] => {
  const today = new Date();
  const result: Order[] = [];

  return result;
};

// Calculate current stock level
const calculateCurrentStock = (suppliers: Supplier[]): number => {
  return suppliers.reduce((total, supplier) => total + supplier.quantity, 0);
};

// Generate stock history data
const generateStockHistory = (): { date: string; level: number }[] => {
  const today = new Date();
  const result = [];
  let level = 120;

  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i);
    const change = Math.random() * 20 - 5;
    level += change;
    level = Math.min(Math.max(level, 30), 190);
    
    result.push({
      date: format(date, 'yyyy-MM-dd'),
      level: parseFloat(level.toFixed(2))
    });
  }

  return result;
};

// Export mock data
export const mockSuppliers = generateMockSuppliers();
export const mockTanks = generateMockTanks();
export const mockOrders = generateMockOrders();
export const currentStockLevel = calculateCurrentStock(mockSuppliers);
export const stockHistory = generateStockHistory();
export const mockCredentials = {
  username: 'COMAGAL ENERGY',
  password: 'password'
};