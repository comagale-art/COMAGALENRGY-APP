import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { Barrel } from '../../types';

const barrelsCollection = collection(db, 'barrels');

export const getBarrels = async (): Promise<Barrel[]> => {
  try {
    const q = query(barrelsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const barrels: Barrel[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      barrels.push({
        id: docSnapshot.id,
        userId: data.userId || '',
        date: data.date,
        barrelNumber: data.barrelNumber,
        product: data.product,
        supplier: data.supplier,
        quantity: data.quantity,
        status: data.status,
        quantitySold: data.quantitySold,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    return barrels;
  } catch (error) {
    console.error('Error fetching barrels:', error);
    throw error;
  }
};

export const addBarrel = async (
  barrel: Omit<Barrel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Barrel> => {
  try {
    const now = new Date();
    const barrelData = {
      userId: '',
      date: barrel.date,
      barrelNumber: barrel.barrelNumber,
      product: barrel.product,
      supplier: barrel.supplier,
      quantity: barrel.quantity,
      status: barrel.status,
      quantitySold: barrel.quantitySold || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(barrelsCollection, barrelData);

    return {
      id: docRef.id,
      userId: '',
      date: barrel.date,
      barrelNumber: barrel.barrelNumber,
      product: barrel.product,
      supplier: barrel.supplier,
      quantity: barrel.quantity,
      status: barrel.status,
      quantitySold: barrel.quantitySold,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  } catch (error) {
    console.error('Error adding barrel:', error);
    throw error;
  }
};

export const updateBarrel = async (
  id: string,
  updates: Partial<Barrel>
): Promise<Barrel> => {
  try {
    const barrelRef = doc(db, 'barrels', id);

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.barrelNumber !== undefined) updateData.barrelNumber = updates.barrelNumber;
    if (updates.product !== undefined) updateData.product = updates.product;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.quantitySold !== undefined) updateData.quantitySold = updates.quantitySold;

    await updateDoc(barrelRef, updateData);

    return {
      id,
      userId: '',
      date: updates.date || '',
      barrelNumber: updates.barrelNumber || '',
      product: updates.product || '',
      supplier: updates.supplier || '',
      quantity: updates.quantity || '',
      status: updates.status || 'Stock',
      quantitySold: updates.quantitySold,
      createdAt: updates.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error updating barrel:', error);
    throw error;
  }
};

export const deleteBarrel = async (id: string): Promise<void> => {
  try {
    const barrelRef = doc(db, 'barrels', id);
    await deleteDoc(barrelRef);
  } catch (error) {
    console.error('Error deleting barrel:', error);
    throw error;
  }
};
