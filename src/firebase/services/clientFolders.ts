import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config';

export interface ClientFolder {
  id: string;
  name: string;
  createdAt: Date;
}

const FOLDERS_COLLECTION = 'clientFolders';

export const getClientFolders = async (): Promise<ClientFolder[]> => {
  const q = query(
    collection(db, FOLDERS_COLLECTION),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    createdAt: doc.data().createdAt?.toDate() || new Date()
  }));
};

export const createClientFolder = async (name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, FOLDERS_COLLECTION), {
    name,
    createdAt: Timestamp.now()
  });

  return docRef.id;
};

export const updateClientFolder = async (id: string, name: string): Promise<void> => {
  const docRef = doc(db, FOLDERS_COLLECTION, id);
  await updateDoc(docRef, { name });
};

export const deleteClientFolder = async (id: string): Promise<void> => {
  // Remove folder assignment from all clients
  const clientsQuery = query(
    collection(db, 'clients'),
    where('folderId', '==', id)
  );

  const clientsSnapshot = await getDocs(clientsQuery);
  const batch = writeBatch(db);

  clientsSnapshot.docs.forEach(clientDoc => {
    batch.update(clientDoc.ref, { folderId: null });
  });

  // Delete the folder
  const folderRef = doc(db, FOLDERS_COLLECTION, id);
  batch.delete(folderRef);

  await batch.commit();
};

export const getClientsInFolder = async (folderId: string) => {
  const q = query(
    collection(db, 'clients'),
    where('folderId', '==', folderId),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    folderId: doc.data().folderId || null,
    isFavorite: doc.data().isFavorite || false
  }));
};

export const getUnassignedClients = async () => {
  const q = query(
    collection(db, 'clients'),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      folderId: doc.data().folderId || null,
      isFavorite: doc.data().isFavorite || false
    }))
    .filter(client => !client.folderId);
};

export const assignClientToFolder = async (clientId: string, folderId: string | null): Promise<void> => {
  // Find the actual Firestore document by custom ID
  const clientsCollection = collection(db, 'clients');
  const q = query(clientsCollection, where('id', '==', clientId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Client not found');
  }

  const clientDocRef = doc(db, 'clients', snapshot.docs[0].id);
  await updateDoc(clientDocRef, { folderId });
};
