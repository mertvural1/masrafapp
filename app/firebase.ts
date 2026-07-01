import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB9ZFVnQH6TGq234tGYIsw65DdXZCuV75Y",
  authDomain: "masraf-ec669.firebaseapp.com",
  databaseURL: "https://masraf-ec669-default-rtdb.firebaseio.com",
  projectId: "masraf-ec669",
  storageBucket: "masraf-ec669.firebasestorage.app",
  messagingSenderId: "544630420395",
  appId: "1:544630420395:web:e0792e2e8391caac5ed8ee",
  measurementId: "G-5ZCN6WYX0N"
};

const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const database = getDatabase(app);
