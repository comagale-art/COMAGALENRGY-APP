import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config';
import { BigSupplier } from '../../types';
import { findDocByCustomId, getNextId, initializeCollections } from '../services';

const bigSuppliersCollection = collection(db, 'bigSuppliers');

export async function getBigSuppliers(): Promise<BigSupplier[]> {
  try {
    await initializeCollections();
    const q = query(bigSuppliersCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as BigSupplier));
  } catch (error) {
    console.error('Error getting big suppliers:', error);
    throw error;
  }
}

export async function addBigSupplier(supplierData: Omit<BigSupplier, 'id' | 'createdAt' | 'time'>): Promise<BigSupplier> {
  try {
    await initializeCollections();
    const nextId = await getNextId('bigSuppliers');
    const now = new Date();
    
    const newSupplier = {
      ...supplierData,
      id: `big-sup-${nextId}`,
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString()
    };
    
    await addDoc(bigSuppliersCollection, newSupplier);
    return newSupplier;
  } catch (error) {
    console.error('Error adding big supplier:', error);
    throw error;
  }
}

export async function deleteBigSupplier(id: string): Promise<void> {
  try {
    const supplier = await findDocByCustomId(bigSuppliersCollection, id);
    if (!supplier) {
      throw new Error('Big supplier not found');
    }
    await deleteDoc(doc(bigSuppliersCollection, supplier.id));
  } catch (error) {
    console.error('Error deleting big supplier:', error);
    throw error;
  }
}