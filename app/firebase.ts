import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, collection } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, User } from 'firebase/auth';
import { Analytics, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZq-nt2usN0sD0U8L-imbqKBVeXYXKlk4",
  authDomain: "antoine-finance-tracker.firebaseapp.com",
  projectId: "antoine-finance-tracker",
  storageBucket: "antoine-finance-tracker.appspot.com",
  messagingSenderId: "300085380263",
  appId: "1:300085380263:web:1c8a4a2e86983e9a374782",
  measurementId: "G-S6W22L3SBR"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics and export it if you need to use it elsewhere
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Add these helper functions
export const getUserDoc = (user: User) => doc(db, 'users', user.uid);
export const getUserTransactionsCollection = (user: User) => collection(db, 'users', user.uid, 'transactions');
export const getUserBudgetDoc = (user: User) => doc(db, 'users', user.uid, 'budget', 'current');