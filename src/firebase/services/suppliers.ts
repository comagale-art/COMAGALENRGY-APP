import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config';
import { Supplier } from '../../types';
import { calculateBarrels, calculateKgQuantity } from '../../utils/calculations';
import { findDocByCustomId, getNextId, initializeCollections } from '../services';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  try {
    await initializeCollections();
    const q = query(suppliersCollection, orderBy('deliveryDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as Supplier));
  } catch (error) {
    console.error('Error getting suppliers:', error);
    throw error;
  }
}

export async function addSupplier(supplierData: Omit<Supplier, 'id' | 'barrels' | 'kgQuantity' | 'createdAt' | 'deliveryTime' | 'stockLevel'> & { kgPerBarrel?: number }): Promise<Supplier> {
  try {
    await initializeCollections();
    const nextId = await getNextId('suppliers');
    
    const kgPerBarrel = supplierData.kgPerBarrel || 185;
    const barrels = calculateBarrels(supplierData.quantity);
    const kgQuantity = calculateKgQuantity(barrels, kgPerBarrel);
    const now = new Date();
    const deliveryTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Remove kgPerBarrel from the data to be saved
    const { kgPerBarrel: _, ...cleanSupplierData } = supplierData;
    
    const newSupplier = {
      ...cleanSupplierData,
      id: `sup-${nextId}`,
      barrels,
      kgQuantity,
      deliveryTime,
      stockLevel: 0, // Will be calculated after adding
      createdAt: now.toISOString()
    };
    
    await addDoc(suppliersCollection, newSupplier);
    return newSupplier;
  } catch (error) {
    console.error('Error adding supplier:', error);
    throw error;
  }
}

export async function updateSupplier(id: string, supplierData: Partial<Supplier> & { kgPerBarrel?: number }): Promise<void> {
  try {
    const supplier = await findDocByCustomId(suppliersCollection, id);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    let updatedData = { ...supplierData };
    
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
    
    await updateDoc(doc(suppliersCollection, supplier.id), updatedData);
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  try {
    const supplier = await findDocByCustomId(suppliersCollection, id);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    await deleteDoc(doc(suppliersCollection, supplier.id));
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
}

export async function filterSuppliers(query: string, startDate?: string, endDate?: string): Promise<Supplier[]> {
  try {
    const suppliers = await getSuppliers();
    return suppliers.filter(supplier => {
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
  } catch (error) {
    console.error('Error filtering suppliers:', error);
    throw error;
  }
}