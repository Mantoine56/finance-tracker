import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZq-nt2usN0sD0U8L-imbqKBVeXYXKlk4",
  authDomain: "antoine-finance-tracker.firebaseapp.com",
  projectId: "antoine-finance-tracker",
  storageBucket: "antoine-finance-tracker.appspot.com",
  messagingSenderId: "300085380263",
  appId: "1:300085380263:web:1c8a4a2e86983e9a374782",
  measurementId: "G-S6W22L3SBR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics and export it if you need to use it elsewhere
export const analytics = getAnalytics(app);