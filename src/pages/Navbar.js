import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../components/firebase";
import { Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

function Navbar() {
  const { currentUser, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-[#fe9f23] to-[#31ab3a] shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-30">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/NutriPaws Logo.png"
              alt="NutriPaws Logo"
              className="h-40 w-50"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 font-semibold text-white">
            <Link to="/" className="hover:text-gray-100">Home</Link>

            {!currentUser && (
              <>
                <Link to="/login" className="hover:text-gray-100">Login</Link>
                <Link to="/register" className="hover:text-gray-100">Register</Link>
              </>
            )}

            {currentUser && role === "CUSTOMER" && (
              <>
                <Link to="/customer/dashboard" className="hover:text-gray-100">
                  Pet Profile Manager
                </Link>
                <Link to="/customer/nutrition-planner" className="hover:text-gray-100">
                  Nutrition Planner
                </Link>
                <Link to="/customer/orders" className="hover:text-gray-100">
                My Orders
                </Link>
                <Link to="/cart" className="relative flex items-center">
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <Link to="/customer/profile" className="hover:text-gray-100">My Profile</Link>
              </>
            )}

            {currentUser && role === "SELLER" && (
              <>
                <Link to="/seller/dashboard" className="hover:text-gray-100">Seller Dashboard</Link>
                <Link to="/seller/orders" className="hover:text-gray-100">Orders</Link>
                <Link to="/seller/products" className="hover:text-gray-100">Products</Link>
                <Link to="/seller/inventory" className="hover:text-gray-100">Inventory</Link>
              </>
            )}

            {currentUser && role === "ADMIN" && (
              <>
                <Link to="/admin/dashboard" className="hover:text-gray-100">Admin Dashboard</Link>
                <Link to="/admin/orders" className="hover:text-gray-100">Orders</Link>
                <Link to="/admin/ingredients" className="hover:text-gray-100">Ingredients</Link>
                <Link to="/admin/settings" className="hover:text-gray-100">Settings</Link>
              </>
            )}

            {currentUser && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-white text-[#31ab3a] px-4 py-1 rounded-lg shadow hover:bg-gray-100 transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="shadow-lg px-6 py-4 space-y-4 font-semibold text-gray-700">
          <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Home</Link>

          {!currentUser && (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Register</Link>
            </>
          )}

          {currentUser && role === "CUSTOMER" && (
            <>
              <Link to="/customer/dashboard" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Customer Dashboard</Link>
              <Link to="/customer/nutrition-planner" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Nutrition Planner</Link>
              <Link to="/customer/orders" onClick={() => setIsOpen(false)} className="hover:text-gray-100">My Orders</Link>
              <Link to="/cart" onClick={() => setIsOpen(false)} className="relative flex items-center hover:text-gray-100">
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {currentUser && role === "SELLER" && (
            <>
              <Link to="/seller/dashboard" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Seller Dashboard</Link>
              <Link to="/seller/orders" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Orders</Link>
              <Link to="/seller/products" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Products</Link>
            </>
          )}

          {currentUser && role === "ADMIN" && (
            <>
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Admin Dashboard</Link>
              <Link to="/admin/orders" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Orders</Link>
              <Link to="/admin/ingredients" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Ingredients</Link>
              <Link to="/admin/settings" onClick={() => setIsOpen(false)} className="hover:text-gray-100">Settings</Link>
            </>
          )}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="block w-full bg-[#31ab3a] text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

