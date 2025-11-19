import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJk1-Ji-f0nK7Jp8yaLXrxtjpfTcE6fnU",
  authDomain: "comagal-energy-sarije.firebaseapp.com",
  projectId: "comagal-energy-sarije",
  storageBucket: "comagal-energy-sarije.appspot.com",
  messagingSenderId: "204874937719",
  appId: "1:204874937719:web:ffe293eb183d77a9795d72",
  measurementId: "G-VETPTL0XQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Network status handling
let isOnline = navigator.onLine;

window.addEventListener('online', async () => {
  console.log('Reconnected to network');
  isOnline = true;
  try {
    await enableNetwork(db);
    console.log('Firestore network connection restored');
  } catch (error) {
    console.error('Error enabling Firestore network:', error);
  }
});

window.addEventListener('offline', async () => {
  console.log('Lost network connection');
  isOnline = false;
  try {
    await disableNetwork(db);
    console.log('Firestore network connection disabled');
  } catch (error) {
    console.error('Error disabling Firestore network:', error);
  }
});

// Enable offline persistence
try {
  enableIndexedDbPersistence(db, {
    synchronizeTabs: true
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support offline persistence.');
    }
  });
} catch (err) {
  console.warn('Error enabling persistence:', err);
}

// Collection names
export const collections = {
  suppliers: 'suppliers',
  stock: 'stock',
  credentials: 'credentials',
  tanks: 'tanks',
  orders: 'orders',
  tankOrders: 'tankOrders',
  counters: 'counters'
};

export { db, auth, isOnline };
export default app;