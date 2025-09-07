import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { token, currentUser } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!token || !currentUser) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/users/${currentUser.email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchData();
  }, [token, currentUser]);

  return (
    <div>
      <h2>Dashboard</h2>
      {userData ? (
        <pre>{JSON.stringify(userData, null, 2)}</pre>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default Dashboard;
