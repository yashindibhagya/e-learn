// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; // ✅ Corrected function name
//import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwfZOVOTEIsmLkC8oFIzySsuAVN6UvpSs",
  authDomain: "elearn-94456.firebaseapp.com",
  projectId: "elearn-94456",
  storageBucket: "elearn-94456.firebasestorage.app",
  messagingSenderId: "253842926589",
  appId: "1:253842926589:web:f1574979dfb2354aa08794",
  measurementId: "G-D1C9WNMJ8G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Corrected `getReactNativePersistence`
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
const analytics = getAnalytics(app);
