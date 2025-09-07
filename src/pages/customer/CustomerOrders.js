// src/pages/customer/CustomerOrders.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

function CustomerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const user = getAuth().currentUser;

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/orders/my", {
        headers: { Email: user.email },
      });
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-600 p-6 border border-dashed border-gray-300 rounded-lg bg-white shadow-sm">
          You have no orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-lg text-[#fe9f23]">
                  Order #{order.id}
                </h3>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    order.status === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <p>
                  <strong>Total:</strong>{" "}
                  ${order.totalPrice ? order.totalPrice.toFixed(2) : "0.00"}
                </p>
                <p>
                  <strong>Placed:</strong>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              {order.shippingAddress && (
                <p className="text-sm text-gray-600">
                  <strong>Shipping Address:</strong> {order.shippingAddress}
                </p>
              )}

              {order.notes && (
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {order.notes}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigate(`/customer/orders/${order.id}`)}
                  className="px-4 py-2 bg-[#31ab3a] hover:bg-green-700 text-white rounded transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;

