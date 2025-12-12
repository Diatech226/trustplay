// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'blog-414108.firebaseapp.com',
  databaseURL: 'https://blog-414108-default-rtdb.firebaseio.com',
  projectId: 'blog-414108',
  storageBucket: 'blog-414108.firebasestorage.app',
  messagingSenderId: '543888429541',
  appId: '1:543888429541:web:6f18f561bc889f2b53df0c',
  measurementId: 'G-83WQ3B0VFF',
};

// Initialize Firebase (reuse an existing app to avoid duplicate-app errors in HMR/tests)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
