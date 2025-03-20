import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.AIzaSyCP31iUMLECna2_MPPgSavBUwqF2m40Zu4,
  authDomain: import.meta.env.blooddonationapp-bf4a7.firebaseapp.com,
  projectId: import.meta.env.blooddonationapp-bf4a7,
  storageBucket: import.meta.env.blooddonationapp-bf4a7.firebasestorage.app,
  messagingSenderId: "import.meta.env.750800522146",
  appId: "import.meta.env.1:750800522146:web:c462ed36b2f72df40d80fb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);