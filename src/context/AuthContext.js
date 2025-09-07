import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../components/firebase";
import { onAuthStateChanged,getAuth } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = getAuth().currentUser;

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken(true);

      setCurrentUser(user);
      setToken(idToken);

      try {
        const res = await axios.get(
          `http://localhost:8080/api/users/${user.email}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        console.log("Fetched profile:", res.data);

        // 🔑 Normalize role for frontend
        let normalizedRole = res.data.role;
        if (typeof normalizedRole === "string") {
          normalizedRole = normalizedRole.replace("Role.", "").toUpperCase();
        }
        setRole(normalizedRole || "CUSTOMER");
      } catch (err) {
        console.error("Failed to fetch role:", err);
        setRole("CUSTOMER");
      }
    } else {
      setCurrentUser(null);
      setToken(null);
      setRole(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);


  const value = { currentUser, token, role, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
