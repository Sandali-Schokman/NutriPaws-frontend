// src/pages/customer/CustomerProducts.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function CustomerProducts({ addToCart }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        setProducts(res.data);
      } catch (err) {
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6">Available Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-lg p-4">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-40 w-full object-cover rounded"
              />
            ) : (
              <div className="h-40 flex items-center justify-center bg-gray-200 text-gray-500 rounded">
                No Image
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.description}</p>
            <p className="mt-2 font-semibold">${p.price}</p>
            <p className="text-sm text-gray-500">Stock: {p.stock}</p>
            <button
              onClick={() => addToCart(p)}
              className="mt-3 w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerProducts;
