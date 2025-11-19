import { 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  doc,
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config';

const trucksCollection = collection(db, 'trucks');

export interface CustomTruck {
  id: string;
  name: string;
  logo: string;
  consumption: number;
  createdAt: string;
}

export async function getCustomTrucks(): Promise<CustomTruck[]> {
  try {
    const q = query(trucksCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CustomTruck));
  } catch (error) {
    console.error('Error getting custom trucks:', error);
    throw error;
  }
}

export async function addCustomTruck(truckData: Omit<CustomTruck, 'id' | 'createdAt'>): Promise<CustomTruck> {
  try {
    const now = new Date();
    const newTruck = {
      ...truckData,
      createdAt: now.toISOString()
    };
    
    const docRef = await addDoc(trucksCollection, newTruck);
    return {
      id: docRef.id,
      ...newTruck
    };
  } catch (error) {
    console.error('Error adding custom truck:', error);
    throw error;
  }
}

export async function deleteCustomTruck(id: string): Promise<void> {
  try {
    await deleteDoc(doc(trucksCollection, id));
  } catch (error) {
    console.error('Error deleting custom truck:', error);
    throw error;
  }
}