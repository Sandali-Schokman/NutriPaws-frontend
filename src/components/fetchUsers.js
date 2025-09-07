import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect } from "react";

function FetchProfile() {
  const { token, currentUser } = useAuth();

  useEffect(() => {
    if (!token || !currentUser) return;

    axios.get(`http://localhost:8080/api/users/${currentUser.email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => console.log("Profile:", res.data))
    .catch(err => console.error("Error:", err));
  }, [token, currentUser]);

  return <p>Check console for user profile</p>;
}
