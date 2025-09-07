// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [dogs, setDogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    passwordHash: "",
    phone: "",
    address: ""
  });
  const auth = getAuth();
  const user = getAuth().currentUser;

  // === Fetch All Data ===
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchDogs = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/dogs/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDogs(res.data);
    } catch (err) {
      console.error("Error fetching dogs:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/orders", {
        headers: { Email: user.email },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // === User Actions ===
  const handleRoleChange = async (email, newRole) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/users/${email}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleDelete = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleCreateSeller = async (e) => {
    e.preventDefault();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, sellerForm.email, sellerForm.passwordHash);
      await axios.post(
        "http://localhost:8080/api/admin/create-seller",
        sellerForm,
        { headers: { Authorization: `Bearer ${25}` } }
      );
      toast("Seller created successfully!");
      setSellerForm({ name: "", email: "", passwordHash: "" });
      fetchUsers();
    } catch (err) {
      console.error("Error creating seller:", err);
      toast("Failed to create seller");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchDogs();
    fetchOrders();
  }, []);

  // === Compute Sales Data for Chart ===
  const salesData = orders.map((o) => ({
    date: o.createdAt
      ? new Date(o.createdAt.seconds * 1000).toLocaleDateString()
      : "N/A",
    total: o.totalPrice || 0,
  }));

  const totalCommission = orders.reduce(
    (acc, o) => acc + (o.totalCommission || 0),
    0
  );

  const activeSellers = [
    ...new Set(orders.map((o) => o.sellerEmails).flat().filter(Boolean)),
  ].length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-[#31ab3a]">Admin Dashboard</h2>

      {/* === Stats Overview === */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-2xl">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl">{orders.length}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Platform Commission</h3>
          <p className="text-2xl">Rs. {totalCommission.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Active Sellers</h3>
          <p className="text-2xl">{activeSellers}</p>
        </div>
      </div>

      {/* === Sales Trend Chart === */}
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">
          Sales Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#31ab3a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === Create Seller Form === */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">
          Create Seller Account
        </h3>
        <form
          onSubmit={handleCreateSeller}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={sellerForm.name}
            onChange={(e) =>
              setSellerForm({ ...sellerForm, name: e.target.value })
            }
            className="border rounded p-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={sellerForm.email}
            onChange={(e) =>
              setSellerForm({ ...sellerForm, email: e.target.value })
            }
            className="border rounded p-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={sellerForm.passwordHash}
            onChange={(e) =>
              setSellerForm({ ...sellerForm, passwordHash: e.target.value })
            }
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={sellerForm.phone}
            onChange={(e) =>
              setSellerForm({ ...sellerForm, phone: e.target.value })
            }
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={sellerForm.address}
            onChange={(e) =>
                setSellerForm({ ...sellerForm, address: e.target.value })
            }
            className="border rounded p-2 sm:col-span-2"
            required
            />
          <button
            type="submit"
            className="col-span-1 sm:col-span-3 bg-gradient-to-r from-[#31ab3a] to-[#fe9f23] text-white py-2 rounded"
          >
            Create Seller
          </button>
        </form>
      </div>

      {/* === User Management === */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">
          User Management
        </h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="text-center">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.phone || "N/A"}</td>
                <td className="p-2 border">{u.address || "N/A"}</td>
                <td className="p-2 border">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.email, e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDelete(u.email)}
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Dog Overview === */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">
          Dog Overview
        </h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Dog Name</th>
              <th className="p-2 border">Breed</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Weight (kg)</th>
              <th className="p-2 border">Activity</th>
              <th className="p-2 border">Diet</th>
            </tr>
          </thead>
          <tbody>
            {dogs.map((dog) => (
              <tr key={dog.id} className="text-center">
                <td className="p-2 border">{dog.name}</td>
                <td className="p-2 border">{dog.breed}</td>
                <td className="p-2 border">{dog.age}</td>
                <td className="p-2 border">{dog.weight}</td>
                <td className="p-2 border">{dog.activityLevel}</td>
                <td className="p-2 border">{dog.dietPreference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
