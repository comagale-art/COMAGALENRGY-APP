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
import { Tank } from '../../types';
import { findDocByCustomId, getNextId, initializeCollections } from '../services';

const tanksCollection = collection(db, 'tanks');

export async function getTanks(): Promise<Tank[]> {
  try {
    await initializeCollections();
    const q = query(tanksCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as Tank));
  } catch (error) {
    console.error('Error getting tanks:', error);
    throw error;
  }
}

export async function addTank(tankData: Omit<Tank, 'id' | 'time'>): Promise<Tank> {
  try {
    await initializeCollections();
    const nextId = await getNextId('tanks');
    const now = new Date();
    
    const newTank = {
      ...tankData,
      id: `tank-${nextId}`,
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    await addDoc(tanksCollection, newTank);
    return newTank;
  } catch (error) {
    console.error('Error adding tank:', error);
    throw error;
  }
}

export async function updateTank(id: string, tankData: Partial<Tank>): Promise<void> {
  try {
    const tank = await findDocByCustomId(tanksCollection, id);
    if (!tank) {
      throw new Error('Tank not found');
    }
    await updateDoc(doc(tanksCollection, tank.id), tankData);
  } catch (error) {
    console.error('Error updating tank:', error);
    throw error;
  }
}

export async function deleteTank(id: string): Promise<void> {
  try {
    const tank = await findDocByCustomId(tanksCollection, id);
    if (!tank) {
      throw new Error('Tank not found');
    }
    await deleteDoc(doc(tanksCollection, tank.id));
  } catch (error) {
    console.error('Error deleting tank:', error);
    throw error;
  }
}