
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAQQdtrmlIaiDx7d6jaiOodC6sVMdT63ms",
  authDomain: "web-chat-1264c.firebaseapp.com",
  projectId: "web-chat-1264c",
  storageBucket: "web-chat-1264c.firebasestorage.app",
  messagingSenderId: "120732995463",
  appId: "1:120732995463:web:d2ebe0d9b1e1d9b7b5cd22",
  measurementId: "G-WE3F1K828G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };