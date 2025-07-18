import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { config } from '@/config/config';

const firebaseConfig = {
  apiKey: config.FIREBASE_APIKEY ,
  authDomain: config.FIREBASE_AUTHDOMAIN ,
  projectId: config.FIREBASE_PROJECTID ,
  storageBucket: config.FIREBASE_STORAGEBUCKET ,
  messagingSenderId: config.FIREBASE_MESSAGINGSENDERID ,
  appId: config.FIREBASE_APPID ,
  measurementId: config.FIREBASE_MEASUREMENTID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;