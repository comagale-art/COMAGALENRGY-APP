import { 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  doc,
  query, 
  where,
  orderBy,
  Timestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config';
import { SupplierTransaction, SupplierPayment } from '../../types';
import { calculateKgQuantity } from '../../utils/calculations';

// Collection references
const trackedSuppliersCollection = collection(db, 'tracked_suppliers');
const transactionsCollection = collection(db, 'supplier_transactions');
const paymentsCollection = collection(db, 'supplier_payments');

export const addTrackedSupplier = async (name: string) => {
  try {
    const docRef = await addDoc(trackedSuppliersCollection, {
      name,
      isFavorite: false,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding tracked supplier:', error);
    throw error;
  }
};

export const getTrackedSuppliers = async () => {
  try {
    const q = query(trackedSuppliersCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isFavorite: doc.data().isFavorite || false,
      folderId: doc.data().folderId || null
    }));
  } catch (error) {
    console.error('Error getting tracked suppliers:', error);
    throw error;
  }
};

export const toggleSupplierFavorite = async (id: string, isFavorite: boolean) => {
  try {
    const supplierRef = doc(trackedSuppliersCollection, id);
    await updateDoc(supplierRef, { isFavorite });
  } catch (error) {
    console.error('Error toggling supplier favorite:', error);
    throw error;
  }
};

export const deleteTrackedSupplier = async (id: string) => {
  try {
    // Delete the supplier document
    await deleteDoc(doc(trackedSuppliersCollection, id));

    // Delete all related transactions
    const transactionsQuery = query(transactionsCollection, where('supplierId', '==', id));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    await Promise.all(transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

    // Delete all related payments
    const paymentsQuery = query(paymentsCollection, where('supplierId', '==', id));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    await Promise.all(paymentsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
  } catch (error) {
    console.error('Error deleting tracked supplier:', error);
    throw error;
  }
};

export const addSupplierTransaction = async (transaction: Omit<SupplierTransaction, 'id' | 'createdAt' | 'totalPrice'> & { kgPerBarrel?: number }) => {
  try {
    // Calculate total price based on quantity type
    let totalPrice = 0;
    const kgPerBarrel = transaction.kgPerBarrel || 185;
    
    if (transaction.quantityType === 'cm') {
      const kgQuantity = calculateKgQuantity(transaction.quantity / 0.75, kgPerBarrel);
      totalPrice = kgQuantity * transaction.pricePerKg;
    } else {
      totalPrice = transaction.quantity * transaction.pricePerKg;
    }

    // Remove kgPerBarrel from the data to be saved (it's only used for calculation)
    const { kgPerBarrel: _, ...transactionData } = transaction;

    const docRef = await addDoc(transactionsCollection, {
      ...transactionData,
      totalPrice,
      createdAt: Timestamp.now()
    });
    
    return {
      id: docRef.id,
      ...transactionData,
      totalPrice,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding supplier transaction:', error);
    throw error;
  }
};

export const getSupplierTransactions = async (supplierId: string) => {
  try {
    const q = query(
      transactionsCollection,
      where('supplierId', '==', supplierId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString()
    })) as SupplierTransaction[];
  } catch (error) {
    console.error('Error getting supplier transactions:', error);
    throw error;
  }
};

export const addSupplierPayment = async (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(paymentsCollection, {
      ...payment,
      createdAt: Timestamp.now()
    });
    
    return {
      id: docRef.id,
      ...payment,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding supplier payment:', error);
    throw error;
  }
};

export const getSupplierPayments = async (supplierId: string) => {
  try {
    const q = query(
      paymentsCollection,
      where('supplierId', '==', supplierId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString()
    })) as SupplierPayment[];
  } catch (error) {
    console.error('Error getting supplier payments:', error);
    throw error;
  }
};

export const deleteSupplierTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(transactionsCollection, id));
  } catch (error) {
    console.error('Error deleting supplier transaction:', error);
    throw error;
  }
};

export const deleteSupplierPayment = async (id: string) => {
  try {
    await deleteDoc(doc(paymentsCollection, id));
  } catch (error) {
    console.error('Error deleting supplier payment:', error);
    throw error;
  }
};