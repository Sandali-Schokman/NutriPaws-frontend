// src/pages/customer/ShoppingList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function ShoppingList() {
  const { token } = useAuth();
  const { dogId } = useParams();
  const [items, setItems] = useState([]);

  const fetchShoppingList = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/dogs/feeding-schedule/${dogId}/weekly-shopping`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching shopping list:", err);
      toast.error("Failed to fetch shopping list");
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, [dogId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6 text-center">
        🛒 Weekly Shopping List
      </h2>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">No shopping items yet.</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-right">Weekly (g)</th>
              <th className="p-3 text-right">Weekly (kg)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3">{i.name}</td>
                <td className="p-3 text-right">{i.weeklyQuantityG.toFixed(0)} g</td>
                <td className="p-3 text-right">{i.weeklyQuantityKg.toFixed(2)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ShoppingList;
