import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config';
import { TankOrder } from '../../types';
import { findDocByCustomId, getNextId, initializeCollections } from '../services';

const tankOrdersCollection = collection(db, 'tankOrders');

export async function getTankOrders(tankId: string): Promise<TankOrder[]> {
  try {
    await initializeCollections();
    const q = query(
      tankOrdersCollection,
      where('tankId', '==', tankId),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as TankOrder));
  } catch (error) {
    console.error('Error getting tank orders:', error);
    throw error;
  }
}

export async function addTankOrder(orderData: Omit<TankOrder, 'id' | 'time' | 'createdAt'>): Promise<void> {
  try {
    await initializeCollections();
    const nextId = await getNextId('tankOrders');
    const now = new Date();
    
    const newOrder = {
      id: `order-${nextId}`,
      ...orderData,
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString()
    };
    
    await addDoc(tankOrdersCollection, newOrder);
  } catch (error) {
    console.error('Error adding tank order:', error);
    throw error;
  }
}

export async function deleteTankOrder(orderId: string): Promise<void> {
  try {
    const order = await findDocByCustomId(tankOrdersCollection, orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    await deleteDoc(doc(tankOrdersCollection, order.id));
  } catch (error) {
    console.error('Error deleting tank order:', error);
    throw error;
  }
}