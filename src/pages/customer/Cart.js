/// src/pages/customer/Cart.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6">Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div className="bg-white shadow rounded-lg p-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price} each</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-16 border rounded p-1"
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  X
                </button>
              </div>
            </div>
          ))}
          <div className="text-right font-bold mt-4">Total: ${total.toFixed(2)}</div>
          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
