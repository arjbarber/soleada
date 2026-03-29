// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1tsbpx2dqzTaIOgJkfnIZAMxEZdWnSwk",
  authDomain: "soleada-ecd68.firebaseapp.com",
  projectId: "soleada-ecd68",
  storageBucket: "soleada-ecd68.firebasestorage.app",
  messagingSenderId: "913765711714",
  appId: "1:913765711714:web:b44fd6eb65e3915414f63b",
  measurementId: "G-D3JQMMMHP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);