import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config';
import { Invoice } from '../../types';
import { findDocByCustomId, initializeCollections } from '../services';

const invoicesCollection = collection(db, 'invoices');
const invoiceCountersCollection = collection(db, 'invoiceCounters');

// Get next invoice ID for a specific year
const getNextInvoiceId = async (year: number): Promise<number> => {
  const counterRef = doc(invoiceCountersCollection, year.toString());
  const counterDoc = await getDoc(counterRef);
  
  let nextId = 1;
  if (counterDoc.exists()) {
    nextId = counterDoc.data().value + 1;
  }
  
  await setDoc(counterRef, { value: nextId });
  return nextId;
};
export async function getInvoices(): Promise<Invoice[]> {
  try {
    await initializeCollections();
    const q = query(invoicesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      ...doc.data()
    } as Invoice));
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
}

export async function addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>): Promise<Invoice> {
  try {
    await initializeCollections();
    const now = new Date();
    const year = now.getFullYear();
    const nextId = await getNextInvoiceId(year);
    
    // Generate invoice number (format: NNNN/YYYY)
    const invoiceNumber = `${nextId.toString().padStart(4, '0')}/${year}`;
    
    const newInvoice = {
      ...invoiceData,
      id: `invoice-${nextId}`,
      invoiceNumber,
      createdAt: now.toISOString()
    };
    
    await addDoc(invoicesCollection, newInvoice);
    return newInvoice as Invoice;
  } catch (error) {
    console.error('Error adding invoice:', error);
    throw error;
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    const invoice = await findDocByCustomId(invoicesCollection, id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    await deleteDoc(doc(invoicesCollection, invoice.id));
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}