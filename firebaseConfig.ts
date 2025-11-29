// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyCtKCHcLuOR1Nt9nS4vSVveGw__a7Wh9Ps",
  authDomain: "smart-madrasa-pro.firebaseapp.com",
  projectId: "smart-madrasa-pro",
  storageBucket: "smart-madrasa-pro.firebasestorage.app",
  messagingSenderId: "1040941024088",
  appId: "1:1040941024088:web:4010abd89a03e6ab489b2d",
  measurementId: "G-K5767PC59V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);