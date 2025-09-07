// src/pages/seller/SellerOrders.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

function SellerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const user = getAuth().currentUser;

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/seller-orders/my", {
        headers: { Email: user.email },
      });
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch seller orders");
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/seller-orders/${orderId}/status`,
        JSON.stringify(newStatus),
        {
          headers: {
            Email: user.email,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#31ab3a]">My Customer Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white shadow rounded-lg p-6 border border-gray-200 cursor-pointer"
              onClick={() => navigate(`/seller/orders/${o.id}`)}
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-lg text-[#fe9f23]">
                  Order #{o.id}
                </h3>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    o.status === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : o.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                <strong>Buyer:</strong> {o.buyerEmail}
              </p>

              <table className="w-full border text-left mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items &&
                    o.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border">{item.productName}</td>
                        <td className="p-2 border">{item.quantity}</td>
                        <td className="p-2 border">${item.price.toFixed(2)}</td>
                        <td className="p-2 border">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-gray-700 space-y-1">
                  <p>Subtotal: ${o.subtotal?.toFixed(2)}</p>
                  <p>Commission: ${o.commission?.toFixed(2)}</p>
                  <p className="text-[#31ab3a]">Earnings: ${o.sellerEarnings?.toFixed(2)}</p>
                </div>

                <div className="space-x-2">
                  {o.status === "PENDING" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(o.id, "CONFIRMED");
                      }}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      Confirm
                    </button>
                  )}
                  {["PENDING", "CONFIRMED"].includes(o.status) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(o.id, "SHIPPED");
                      }}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                    >
                      Ship
                    </button>
                  )}
                  {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(o.id, "CANCELLED");
                      }}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
