import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  setDoc,
  QuerySnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db } from './config';
import { Supplier, Tank, TankOrder, Order, Client } from '../types';
import { calculateBarrels, calculateKgQuantity } from '../utils/calculations';

// Collection references
const suppliersCollection = collection(db, 'suppliers');
const stockCollection = collection(db, 'stock');
const credentialsCollection = collection(db, 'credentials');
const tanksCollection = collection(db, 'tanks');
const tankOrdersCollection = collection(db, 'tankOrders');
const ordersCollection = collection(db, 'orders');
const counterCollection = collection(db, 'counters');
const clientsCollection = collection(db, 'clients');
const clientDataCollection = collection(db, 'clientData');

// Initialize collections with default data if they don't exist
export const initializeCollections = async () => {
  try {
    // Initialize counters
    const counters = ['suppliers', 'tanks', 'tankOrders', 'orders', 'clients', 'clientData'];
    for (const counter of counters) {
      const counterRef = doc(counterCollection, counter);
      const counterDoc = await getDoc(counterRef);
      
      if (!counterDoc.exists()) {
        await setDoc(counterRef, { value: 0 });
      }
    }

    // Initialize stock if it doesn't exist
    const stockRef = doc(stockCollection, 'current');
    const stockDoc = await getDoc(stockRef);
    if (!stockDoc.exists()) {
      await setDoc(stockRef, { 
        level: 0,
        updatedAt: new Date().toISOString()
      });
    }

    // Initialize orders collection if it doesn't exist
    const ordersRef = doc(ordersCollection, 'initial');
    const ordersDoc = await getDoc(ordersRef);
    if (!ordersDoc.exists()) {
      await setDoc(ordersRef, {
        id: 'order-0',
        createdAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error initializing collections:', error);
    throw error;
  }
};

// Get next ID from counter
export const getNextId = async (counterName: string): Promise<number> => {
  const counterRef = doc(counterCollection, counterName);
  const counterDoc = await getDoc(counterRef);
  
  let nextId = 1;
  if (counterDoc.exists()) {
    nextId = counterDoc.data().value + 1;
  }
  
  await setDoc(counterRef, { value: nextId });
  return nextId;
};

// Find document by custom ID field
export const findDocByCustomId = async (
  collectionRef: any,
  customId: string
): Promise<{ id: string; data: DocumentData } | null> => {
  try {
    const q = query(collectionRef, where('id', '==', customId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      data: doc.data()
    };
  } catch (error) {
    console.error('Error finding document:', error);
    throw error;
  }
};

// Client Data services
export async function getClientData(): Promise<ClientData[]> {
  try {
    await initializeCollections();
    const q = query(clientDataCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as ClientData));
  } catch (error) {
    console.error('Error getting client data:', error);
    throw error;
  }
}

export async function addClientData(clientData: Omit<ClientData, 'id' | 'createdAt'>): Promise<ClientData> {
  try {
    await initializeCollections();
    const nextId = await getNextId('clientData');
    const now = new Date();
    
    const newClientData = {
      id: `client-data-${nextId}`,
      ...clientData,
      createdAt: now.toISOString()
    };
    
    await addDoc(clientDataCollection, newClientData);
    return newClientData as ClientData;
  } catch (error) {
    console.error('Error adding client data:', error);
    throw error;
  }
}

export async function deleteClientData(id: string): Promise<void> {
  try {
    const clientData = await findDocByCustomId(clientDataCollection, id);
    if (!clientData) {
      throw new Error('Client data not found');
    }
    await deleteDoc(doc(clientDataCollection, clientData.id));
  } catch (error) {
    console.error('Error deleting client data:', error);
    throw error;
  }
}

// Client services
export async function getClients(): Promise<Client[]> {
  try {
    await initializeCollections();
    const q = query(clientsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as Client));
  } catch (error) {
    console.error('Error getting clients:', error);
    throw error;
  }
}

export async function addClient(clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  try {
    await initializeCollections();
    const nextId = await getNextId('clients');
    const now = new Date();
    
    const newClient = {
      id: `client-${nextId}`,
      ...clientData,
      createdAt: now.toISOString()
    };
    
    await addDoc(clientsCollection, newClient);
    return newClient as Client;
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    const client = await findDocByCustomId(clientsCollection, id);
    if (!client) {
      throw new Error('Client not found');
    }
    await deleteDoc(doc(clientsCollection, client.id));
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

// Order services
export async function getOrders(): Promise<Order[]> {
  try {
    await initializeCollections();
    const q = query(ordersCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function addOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'time'>): Promise<Order> {
  try {
    await initializeCollections();
    const nextId = await getNextId('orders');
    const now = new Date();
    
    // Clean and validate the data before sending to Firebase
    const newOrder = {
      id: `order-${nextId}`,
      date: orderData.date,
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      clientName: orderData.clientName,
      deliveryAddress: orderData.deliveryAddress || '',
      product: orderData.product,
      quantity: Number(orderData.quantity),
      pricePerKg: Number(orderData.pricePerKg),
      totalPriceExclTax: Number(orderData.totalPriceExclTax),
      totalPriceInclTax: Number(orderData.totalPriceInclTax),
      vatRate: Number(orderData.vatRate),
      cargoPlacement: orderData.cargoPlacement,
      blNumber: orderData.blNumber,
      createdAt: now.toISOString()
    };

    // Add optional fields only if they exist
    if (orderData.quantityCm !== undefined) {
      newOrder['quantityCm'] = Number(orderData.quantityCm);
    }
    if (orderData.tankName) {
      newOrder['tankName'] = orderData.tankName;
    }
    if (orderData.tankQuantity !== undefined) {
      newOrder['tankQuantity'] = Number(orderData.tankQuantity);
    }
    
    await addDoc(ordersCollection, newOrder);
    return newOrder as Order;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const order = await findDocByCustomId(ordersCollection, id);
    if (!order) {
      throw new Error('Order not found');
    }
    await deleteDoc(doc(ordersCollection, order.id));
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// Export other services
export * from './services/suppliers';
export * from './services/tanks';
export * from './services/tankOrders';
export * from './services/stock';
export * from './services/invoices';

// Initialize collections when the module loads
initializeCollections().catch(console.error);