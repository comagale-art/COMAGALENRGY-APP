import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../config';
import { initializeCollections } from '../services';

const stockCollection = collection(db, 'stock');
const stockHistoryCollection = collection(db, 'stockHistory');

export async function getCurrentStock(): Promise<number> {
  try {
    await initializeCollections();
    const stockDoc = await getDoc(doc(stockCollection, 'current'));
    if (!stockDoc.exists()) {
      await setDoc(doc(stockCollection, 'current'), { level: 0 });
      return 0;
    }
    return stockDoc.data().level;
  } catch (error) {
    console.error('Error getting current stock:', error);
    throw error;
  }
}

export async function updateStockLevel(quantityChange: number): Promise<void> {
  try {
    const stockRef = doc(stockCollection, 'current');
    const stockDoc = await getDoc(stockRef);
    
    let newLevel = quantityChange;
    if (stockDoc.exists()) {
      const currentLevel = stockDoc.data().level;
      newLevel = currentLevel + quantityChange;
    }
    
    const now = new Date();
    
    // Update current stock level
    await setDoc(stockRef, { 
      level: newLevel,
      updatedAt: now.toISOString()
    });
    
    // Add entry to stock history
    await addDoc(stockHistoryCollection, {
      date: now.toISOString().split('T')[0],
      level: newLevel,
      change: quantityChange,
      updatedAt: now.toISOString()
    });
  } catch (error) {
    console.error('Error updating stock level:', error);
    throw error;
  }
}

export async function getStockHistory(days: number = 30): Promise<{ date: string; level: number }[]> {
  try {
    const q = query(stockHistoryCollection, orderBy('date', 'desc'), limit(days));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      const currentStock = await getCurrentStock();
      const today = new Date();
      
      await addDoc(stockHistoryCollection, {
        level: currentStock,
        change: 0,
        date: today.toISOString()
      });
      
      return [{ date: today.toISOString().split('T')[0], level: currentStock }];
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.date.split('T')[0],
        level: data.level
      };
    });
  } catch (error) {
    console.error('Error getting stock history:', error);
    throw error;
  }
}