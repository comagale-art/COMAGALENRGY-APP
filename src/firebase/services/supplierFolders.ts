import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config';

const supplierFoldersCollection = collection(db, 'supplier_folders');
const trackedSuppliersCollection = collection(db, 'tracked_suppliers');

export interface SupplierFolder {
  id: string;
  name: string;
  year: string;
  createdAt: string;
}

export const createSupplierFolder = async (name: string, year: string) => {
  try {
    const docRef = await addDoc(supplierFoldersCollection, {
      name,
      year,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating supplier folder:', error);
    throw error;
  }
};

export const getSupplierFolders = async () => {
  try {
    const q = query(supplierFoldersCollection, orderBy('year', 'desc'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      year: doc.data().year,
      createdAt: doc.data().createdAt.toDate().toISOString()
    })) as SupplierFolder[];
  } catch (error) {
    console.error('Error getting supplier folders:', error);
    throw error;
  }
};

export const deleteSupplierFolder = async (id: string) => {
  try {
    // Remove folder reference from all suppliers
    const q = query(trackedSuppliersCollection, where('folderId', '==', id));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(doc =>
      updateDoc(doc.ref, { folderId: null })
    ));

    // Delete the folder
    await deleteDoc(doc(supplierFoldersCollection, id));
  } catch (error) {
    console.error('Error deleting supplier folder:', error);
    throw error;
  }
};

export const updateSupplierFolder = async (id: string, name: string, year: string) => {
  try {
    const folderRef = doc(supplierFoldersCollection, id);
    await updateDoc(folderRef, { name, year });
  } catch (error) {
    console.error('Error updating supplier folder:', error);
    throw error;
  }
};

export const assignSupplierToFolder = async (supplierId: string, folderId: string | null) => {
  try {
    const supplierRef = doc(trackedSuppliersCollection, supplierId);
    await updateDoc(supplierRef, { folderId });
  } catch (error) {
    console.error('Error assigning supplier to folder:', error);
    throw error;
  }
};

export const getSuppliersInFolder = async (folderId: string) => {
  try {
    const q = query(trackedSuppliersCollection, where('folderId', '==', folderId), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isFavorite: doc.data().isFavorite || false,
      folderId: doc.data().folderId
    }));
  } catch (error) {
    console.error('Error getting suppliers in folder:', error);
    throw error;
  }
};

export const getUnassignedSuppliers = async () => {
  try {
    const snapshot = await getDocs(trackedSuppliersCollection);
    const suppliers = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isFavorite: doc.data().isFavorite || false,
      folderId: doc.data().folderId
    }));

    // Filter suppliers without folderId or with null/undefined folderId
    return suppliers.filter(s => !s.folderId);
  } catch (error) {
    console.error('Error getting unassigned suppliers:', error);
    throw error;
  }
};
