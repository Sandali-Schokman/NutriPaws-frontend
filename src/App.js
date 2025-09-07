import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import NutritionPlanner from "./pages/customer/NutritionPlanner";
import Checkout from "./pages/customer/Checkout";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerProductForm from "./pages/seller/SellerProductForm";
import SellerInventory from "./pages/seller/SellerInventory";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerOrderDetails from "./pages/customer/CustomerOrderDetails";
import CustomerProfile from "./pages/customer/CustomerProfile";
import SellerOrderDetails from "./pages/seller/SellerOrderDetails";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerInventoryOverview from "./pages/seller/SellerInventoryOverview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminIngredients from "./pages/admin/AdminIngredients";
import AdminIngredientForm from "./pages/admin/AdminIngredientForm";
import Cart from "./pages/customer/Cart";
import RecommendedProducts from "./pages/customer/RecommendedProducts";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Role-based Redirect */}
          <Route
            path="/"
            element={
              role === "ADMIN" ? <Navigate to="/admin/dashboard" /> :
              role === "SELLER" ? <Navigate to="/seller/dashboard" /> :
              role === "CUSTOMER" ? <Navigate to="/customer/dashboard" /> :
              <Navigate to="/login" />
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/nutrition-planner"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <NutritionPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/customer/recommended/:dogId" 
          element=
          {
            <ProtectedRoute requiredRole="CUSTOMER">
              <RecommendedProducts />
            </ProtectedRoute>
          }
          />

          {/* Seller Routes */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders/:orderId"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/edit/:productId"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory/:productId"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerInventoryOverview />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ingredients"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminIngredients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ingredients/new"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminIngredientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ingredients/edit/:id"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminIngredientForm />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
