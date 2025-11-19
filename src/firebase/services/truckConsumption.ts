import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../config';

const truckConsumptionCollection = collection(db, 'truckConsumption');

export interface TruckConsumptionEntry {
  id?: string;
  truckId: string;
  date: string;
  fuelMoney: number;
  fuelPrice: number;
  consumption: number;
  previousKm: number;
  currentKm: number;
  distance: number;
  initialFuel: number;
  consumedFuel: number;
  remainingFuel: number;
  totalDistance: number;
  remainingDistance: number;
  createdAt?: Timestamp;
}

export const addTruckConsumptionEntry = async (entry: Omit<TruckConsumptionEntry, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(truckConsumptionCollection, {
      ...entry,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding truck consumption entry:', error);
    throw error;
  }
};

export const getTruckConsumptionEntries = async (truckId: string) => {
  try {
    const q = query(
      truckConsumptionCollection,
      where('truckId', '==', truckId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TruckConsumptionEntry[];
  } catch (error) {
    console.error('Error getting truck consumption entries:', error);
    throw error;
  }
};

export const deleteTruckConsumptionEntry = async (id: string) => {
  try {
    await deleteDoc(doc(truckConsumptionCollection, id));
  } catch (error) {
    console.error('Error deleting truck consumption entry:', error);
    throw error;
  }
};