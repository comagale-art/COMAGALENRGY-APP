import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { DieselConsumption } from '../../types';

const COLLECTION_NAME = 'diesel_consumption';

export const addDieselConsumption = async (
  consumption: Omit<DieselConsumption, 'id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...consumption,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding diesel consumption:', error);
    throw error;
  }
};

export const updateDieselConsumption = async (
  id: string,
  consumption: Partial<DieselConsumption>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...consumption,
      updated_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating diesel consumption:', error);
    throw error;
  }
};

export const deleteDieselConsumption = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting diesel consumption:', error);
    throw error;
  }
};

export const getDieselConsumptions = async (): Promise<DieselConsumption[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date,
        vehicle_type: data.vehicle_type,
        vehicle_name: data.vehicle_name,
        amount_dh: data.amount_dh,
        price_per_liter: data.price_per_liter,
        liters_calculated: data.liters_calculated,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
      } as DieselConsumption;
    });
  } catch (error) {
    console.error('Error fetching diesel consumptions:', error);
    throw error;
  }
};
