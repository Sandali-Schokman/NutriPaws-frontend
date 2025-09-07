// src/pages/customer/Checkout.js
import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cart, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Shipping address is required.");
      return;
    }
    try {
      const orderData = {
        items: cart.map((c) => ({
          productId: c.id,
          productName: c.name,
          quantity: c.quantity,
          price: c.price,
          productSnapshot: {
            name: c.name,
            price: c.price,
            sellerEmail: c.sellerEmail,
          },
        })),
        totalPrice: total,
        shippingAddress,
        notes,
      };

      await axios.post("http://localhost:8080/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/customer/orders");
    } catch (err) {
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#31ab3a]">Checkout</h2>
      <div className="bg-white p-6 rounded shadow max-w-lg mx-auto">
        <h3 className="font-semibold mb-2">Shipping Info</h3>
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Enter shipping address"
          className="w-full border rounded p-2 mb-4"
          required
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full border rounded p-2 mb-4"
        />

        <h3 className="font-semibold mb-2">Order Summary</h3>
        {cart.map((item) => (
          <p key={item.id}>
            {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
        <p className="mt-2 font-bold">Total: ${total.toFixed(2)}</p>

        <button
          onClick={placeOrder}
          className="w-full mt-4 bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

export default Checkout;
