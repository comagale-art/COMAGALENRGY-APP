import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
  counters: 'counters',
  barrels: 'barrels'
};

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { db, auth, isOnline };
export default app;
