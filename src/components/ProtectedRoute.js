// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { auth } from "../components/firebase";

function ProtectedRoute({ children, requiredRole }) {
//   const { role, loading } = useAuth();
  const currentUser = getAuth().currentUser;

  // Show loading until AuthContext finishes fetching user + role
//   if (loading) {
//     return <div>Loading...</div>;
//   }

  // If no user logged in → redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

//   // If role doesn't match requiredRole → block access
//   if (requiredRole && role !== requiredRole) {
//     return <Navigate to="/" replace />;
//   }


  // Role matches → allow access
  return children;
}

export default ProtectedRoute;
