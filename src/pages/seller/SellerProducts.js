// src/pages/seller/SellerProducts.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

function SellerProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const user = getAuth().currentUser;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/products/seller/${user.email}`);
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to fetch products");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`, {
        headers: { Email: user.email }
      });
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Error deleting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#31ab3a]">My Products</h2>
        <Link
          to="/seller/products/new"
          className="bg-[#fe9f23] hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Stock</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 border">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-200 text-gray-500 text-sm rounded">
                      No Image
                    </div>
                  )}
                </td>
                <td className="p-3 border">{p.name}</td>
                <td className="p-3 border">{p.type}</td>
                <td className="p-3 border">Rs. {p.price}</td>
                <td className="p-3 border">{p.stock}</td>
                <td className="p-3 border space-x-2">
                  <Link
                    to={`/seller/products/edit/${p.id}`}
                    state={{ product: p }}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/seller/inventory/${p.id}`}
                    state={{ product: p }}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    Stock
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerProducts;
