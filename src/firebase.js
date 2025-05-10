import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlDmaVQVHRBJAJUp43Yq9K6v76DaIQmzs",
  authDomain: "reactsocialmedia-575b8.firebaseapp.com",
  projectId: "reactsocialmedia-575b8",
  storageBucket: "reactsocialmedia-575b8.firebasestorage.app",
  messagingSenderId: "842580066172",
  appId: "1:842580066172:web:eac7e638940509e25faef9",
  measurementId: "G-5RY8JX86SR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 