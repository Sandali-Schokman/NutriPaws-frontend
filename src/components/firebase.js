import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZhU6sdy1AZ7NimyC-xuTI5zYTWzi3Th0",
  authDomain: "nutripaws-db.firebaseapp.com",
  projectId: "nutripaws-db",
  storageBucket: "nutripaws-db.firebasestorage.app",
  messagingSenderId: "497086883715",
  appId: "1:497086883715:web:1f59fe06fab51d22cb38b6",
  measurementId: "G-S1F11JESH0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
