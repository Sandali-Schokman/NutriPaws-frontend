// src/pages/seller/SellerInventory.js
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";

function SellerInventory() {
  const { token } = useAuth();
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [stock, setStock] = useState(product?.stock || 0);
  const [available, setAvailable] = useState(product?.available ?? true);
  const user = getAuth().currentUser;

  const handleSave = async () => {
    try {
      await axios.patch(
        `http://localhost:8080/api/products/${productId}`,
        { stock, available },
        { headers: { Email: user.email } }
      );
      toast.success("Inventory updated!");
      navigate("/seller/products");
    } catch (err) {
      toast.error("Error updating inventory");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-bold text-[#31ab3a] mb-4">Inventory Management</h2>
        <p className="mb-2"><strong>Product:</strong> {product?.name}</p>
        <input type="number" value={stock} onChange={(e) => setStock(e.target.valueAsNumber)} className="w-full border p-2 rounded mb-4" placeholder="Stock" />
        <label className="flex items-center space-x-2 mb-4">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          <span>Available</span>
        </label>
        <button onClick={handleSave} className="w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
}

export default SellerInventory;