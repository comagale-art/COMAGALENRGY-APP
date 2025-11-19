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
import { ClientTransaction, ClientPayment } from '../../types';

const clientTransactionsCollection = collection(db, 'clientTransactions');
const clientPaymentsCollection = collection(db, 'clientPayments');
const trackedClientsCollection = collection(db, 'tracked_clients');

export const getTrackedClients = async () => {
  try {
    const q = query(trackedClientsCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isFavorite: doc.data().isFavorite || false
    }));
  } catch (error) {
    console.error('Error getting tracked clients:', error);
    throw error;
  }
};

export const toggleClientFavorite = async (id: string, isFavorite: boolean) => {
  try {
    const clientRef = doc(trackedClientsCollection, id);
    await updateDoc(clientRef, { isFavorite });
  } catch (error) {
    console.error('Error toggling client favorite:', error);
    throw error;
  }
};

export const getClientTransactions = async (): Promise<ClientTransaction[]> => {
  try {
    const q = query(
      clientTransactionsCollection,
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClientTransaction));
  } catch (error) {
    console.error('Error getting client transactions:', error);
    throw error;
  }
};

export const addClientTransaction = async (data: Omit<ClientTransaction, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(clientTransactionsCollection, {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding client transaction:', error);
    throw error;
  }
};

export const deleteClientTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(clientTransactionsCollection, id));
  } catch (error) {
    console.error('Error deleting client transaction:', error);
    throw error;
  }
};

export const getClientPayments = async (): Promise<ClientPayment[]> => {
  try {
    const q = query(
      clientPaymentsCollection,
      orderBy('paymentDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClientPayment));
  } catch (error) {
    console.error('Error getting client payments:', error);
    throw error;
  }
};

export const addClientPayment = async (data: Omit<ClientPayment, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(clientPaymentsCollection, {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding client payment:', error);
    throw error;
  }
};

export const deleteClientPayment = async (id: string) => {
  try {
    await deleteDoc(doc(clientPaymentsCollection, id));
  } catch (error) {
    console.error('Error deleting client payment:', error);
    throw error;
  }
};