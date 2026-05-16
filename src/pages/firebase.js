import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// You can find this in your Firebase Console: Project settings -> General -> Your apps -> select your web app -> "Config" button
const firebaseConfig = {
  apiKey: "AIzaSyDnJEKsyEvr57O8e2m7otQWf9xwWzvI-wY", // Replace with your actual API Key
  authDomain: "conecta-11ed1.firebaseapp.com", // This should be your auth domain
  projectId: "conecta-11ed1", // Your project ID
  storageBucket: "conecta-11ed1.appspot.com", // Your storage bucket
  messagingSenderId: "182515030623", // Replace with your sender ID
  appId: "1:182515030623:web:4396df22caaffa634ed9ea" // Replace with your App ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);