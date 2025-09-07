// src/pages/seller/SellerDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { getAuth } from "firebase/auth";

function SellerDashboard() {
  const { token, currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const user = getAuth().currentUser;

  // === Fetch seller-specific data ===
  const fetchSellerData = async () => {
    try {
      // Get seller orders
      const ordersRes = await axios.get("http://localhost:8080/api/seller-orders/my", {
        headers: { Email: user.email },
      });
      setOrders(ordersRes.data);

      // Get seller products
      const productsRes = await axios.get(`http://localhost:8080/api/products/seller/${user.email}`, {
        headers: { Email: user.email },
      });
      setProducts(productsRes.data);

    } catch (err) {
      console.error("Error fetching seller data:", err);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  // === Prepare stats ===
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const totalCommission = orders.reduce((acc, o) => acc + (o.totalCommission || 0), 0);

  // Sales trend chart
  const salesData = orders.map((o) => ({
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A",

    revenue: o.totalPrice || 0,
  }));

  // Product sales distribution
  const productSales = products.map((p) => ({
    name: p.name,
    sales: orders
      .flatMap((o) => o.items || [])
      .filter((item) => item.productId === p.id)
      .reduce((sum, item) => sum + item.quantity, 0),
  }));

  const COLORS = ["#31ab3a", "#fe9f23", "#ff4d4d", "#007bff", "#6f42c1"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-[#31ab3a]">Seller Dashboard</h2>

      {/* === Stats === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl">{orders.length}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-2xl">Rs. {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h3 className="text-lg font-semibold">Commission Paid</h3>
          <p className="text-2xl">Rs. {totalCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* === Sales Trend === */}
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#31ab3a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === Revenue Breakdown (Bar) === */}
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">Revenue by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productSales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#31ab3a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === Product Sales Pie === */}
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">Product Sales Share</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={productSales}
              dataKey="sales"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {productSales.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* === Recent Orders === */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">Recent Orders</h3>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="text-center">
                <td className="p-2 border">{o.id}</td>
                <td className="p-2 border">
                  {o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                </td>
                <td className="p-2 border">Rs. {o.totalPrice}</td>
                <td className="p-2 border">{o.status || "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerDashboard;

