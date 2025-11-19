import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config';
import { TruckOilChange, TruckDocument, MaintenanceStatus } from '../../types';
import { differenceInDays } from 'date-fns';
import { getTruckConsumptionEntries } from './truckConsumption';

const oilChangeCollection = collection(db, 'truckOilChange');
const documentCollection = collection(db, 'truckDocument');

export const addTruckOilChange = async (data: Omit<TruckOilChange, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(oilChangeCollection, {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding oil change:', error);
    throw error;
  }
};

export const addTruckDocument = async (data: Omit<TruckDocument, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(documentCollection, {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const updateTruckDocument = async (id: string, data: Partial<TruckDocument>) => {
  try {
    await updateDoc(doc(documentCollection, id), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const getTruckOilChanges = async (truckId: string): Promise<TruckOilChange[]> => {
  try {
    const q = query(
      oilChangeCollection,
      where('truckId', '==', truckId),
      orderBy('dateVidange', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TruckOilChange[];
  } catch (error) {
    console.error('Error getting oil changes:', error);
    throw error;
  }
};

export const getTruckDocuments = async (truckId: string): Promise<TruckDocument[]> => {
  try {
    const q = query(
      documentCollection,
      where('truckId', '==', truckId),
      orderBy('dateExpiration', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TruckDocument[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const getTruckMaintenanceStatus = async (truckId: string) => {
  try {
    // Get latest oil change
    const oilChangeQuery = query(
      oilChangeCollection,
      where('truckId', '==', truckId),
      orderBy('dateVidange', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const oilChangeSnapshot = await getDocs(oilChangeQuery);
    const latestOilChange = oilChangeSnapshot.docs[0]?.data() as TruckOilChange;

    // Get latest consumption entry to get current kilometers
    const consumptionEntries = await getTruckConsumptionEntries(truckId);
    const currentKm = consumptionEntries.length > 0 ? consumptionEntries[0].currentKm : 0;

    // Get documents
    const documentQuery = query(
      documentCollection,
      where('truckId', '==', truckId),
      orderBy('dateExpiration', 'asc')
    );
    const documentSnapshot = await getDocs(documentQuery);
    const documents = documentSnapshot.docs.map(doc => doc.data() as TruckDocument);

    // Calculate oil change status
    let vidangeStatus: MaintenanceStatus = {
      status: 'pas_encore',
      kmRestants: 0
    };

    if (latestOilChange) {
      // Calculate remaining kilometers before next oil change
      const kmParcourus = currentKm - latestOilChange.kmActuel;
      const kmRestants = latestOilChange.intervalVidangeKm - kmParcourus;
      
      if (kmRestants <= 0) {
        vidangeStatus = { status: 'expire', kmRestants: 0 };
      } else if (kmRestants <= latestOilChange.intervalVidangeKm * 0.1) {
        vidangeStatus = { status: 'proche', kmRestants };
      } else {
        vidangeStatus = { status: 'pas_encore', kmRestants };
      }
    }

    // Calculate document status
    let documentStatus: MaintenanceStatus = {
      status: 'pas_encore',
      joursRestants: 0
    };

    if (documents.length > 0) {
      const closestExpiration = documents[0];
      const today = new Date();
      const expirationDate = new Date(closestExpiration.dateExpiration);
      const joursRestants = differenceInDays(expirationDate, today);

      if (joursRestants < 0) {
        documentStatus = { 
          status: 'expire', 
          joursRestants: 0,
          nomDocument: closestExpiration.nomDocument 
        };
      } else if (joursRestants <= 7) {
        documentStatus = { 
          status: 'proche', 
          joursRestants,
          nomDocument: closestExpiration.nomDocument 
        };
      } else {
        documentStatus = { 
          status: 'pas_encore', 
          joursRestants,
          nomDocument: closestExpiration.nomDocument 
        };
      }
    }

    return {
      vidange: vidangeStatus,
      documents: documentStatus
    };
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    throw error;
  }
};