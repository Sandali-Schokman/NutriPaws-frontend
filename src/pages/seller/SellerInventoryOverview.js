// src/pages/seller/SellerInventoryOverview.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function SellerInventoryOverview() {
  const { token, currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [dirty, setDirty] = useState(false); // track unsaved changes
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/products/seller/${currentUser.email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(res.data);
      setDirty(false);
    } catch (err) {
      toast.error("Failed to load inventory");
    }
  };

  const handleRowUpdate = async (productId, newStock, newAvailable) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/products/${productId}`,
        { stock: newStock, available: newAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Inventory updated!");
      fetchProducts();
    } catch (err) {
      toast.error("Error updating inventory");
    }
  };

  const handleBulkUpdate = async () => {
    try {
      await Promise.all(
        products.map((p) =>
          axios.patch(
            `http://localhost:8080/api/products/${p.id}`,
            { stock: p.stock, available: p.available },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      toast.success("All inventory changes saved!");
      fetchProducts();
    } catch (err) {
      toast.error("Error saving bulk changes");
    }
  };

  useEffect(() => {
    if (currentUser) fetchProducts();
  }, [currentUser]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#31ab3a]">
          Inventory Overview
        </h2>
        {dirty && (
          <button
            onClick={handleBulkUpdate}
            className="bg-[#31ab3a] text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            Save All Changes
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Product</th>
                <th className="p-3 border">Stock</th>
                <th className="p-3 border">Available</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-3 border font-semibold text-[#fe9f23]">
                    {product.name}
                  </td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => {
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === product.id
                              ? { ...p, stock: parseInt(e.target.value, 10) }
                              : p
                          )
                        );
                        setDirty(true);
                      }}
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-3 border text-center">
                    <input
                      type="checkbox"
                      checked={product.available}
                      onChange={(e) => {
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === product.id
                              ? { ...p, available: e.target.checked }
                              : p
                          )
                        );
                        setDirty(true);
                      }}
                    />
                  </td>
                  <td className="p-3 border text-center space-x-2">
                    <button
                      onClick={() =>
                        handleRowUpdate(product.id, product.stock, product.available)
                      }
                      className="bg-[#31ab3a] text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/seller/inventory/${product.id}`, {
                          state: { product },
                        })
                      }
                      className="bg-[#fe9f23] text-white px-3 py-1 rounded hover:bg-orange-600"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellerInventoryOverview;
