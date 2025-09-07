// src/pages/Home.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
  const { currentUser, role, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    brand: "",
    minProtein: "",
    maxFat: "",
    minCalories: "",
    maxCalories: "",
    allergy: "",
    healthCondition: "",
  });
  const [sortBy, setSortBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [brands, setBrands] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); 

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = res.data;
      setProducts(data);

      setBrands([...new Set(data.map((p) => p.brand).filter(Boolean))]);
      setAllergies([...new Set(data.flatMap((p) => p.forbiddenAllergies || []))]);
      setHealthConditions([...new Set(data.flatMap((p) => p.allowedHealthConditions || []))]);
    } catch (err) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // === Apply filters ===
  let filteredProducts = products.filter((p) => {
    if (filters.brand && p.brand !== filters.brand) return false;
    if (filters.minProtein && p.proteinPer100g < parseFloat(filters.minProtein)) return false;
    if (filters.maxFat && p.fatPer100g > parseFloat(filters.maxFat)) return false;
    if (filters.minCalories && p.caloriesPer100g < parseFloat(filters.minCalories)) return false;
    if (filters.maxCalories && p.caloriesPer100g > parseFloat(filters.maxCalories)) return false;
    if (filters.allergy && p.forbiddenAllergies?.includes(filters.allergy)) return false;
    if (filters.healthCondition && !p.allowedHealthConditions?.includes(filters.healthCondition)) return false;
    return true;
  });

  // === Apply search filter ===
  if (searchQuery.trim() !== "") {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // === Apply sorting ===
  if (sortBy) {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "priceLow": return a.price - b.price;
        case "priceHigh": return b.price - a.price;
        case "proteinHigh": return b.proteinPer100g - a.proteinPer100g;
        case "fatLow": return a.fatPer100g - b.fatPer100g;
        case "caloriesLow": return a.caloriesPer100g - b.caloriesPer100g;
        case "caloriesHigh": return b.caloriesPer100g - a.caloriesPer100g;
        default: return 0;
      }
    });
  }

  const handleAddToCart = (product) => {
    if (!currentUser || role !== "CUSTOMER") {
      toast.info("Please login/register as a customer to add items to cart.");
      navigate("/login");
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const clearFilters = () => {
    setFilters({
      brand: "",
      minProtein: "",
      maxFat: "",
      minCalories: "",
      maxCalories: "",
      allergy: "",
      healthCondition: "",
    });
    setSortBy("");
    setSearchQuery("");
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/home.jpg')" }} >

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#31ab3a] mb-4">
          Welcome to NutriPaws 🐾
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your trusted pet nutrition platform. Find the best products tailored
          for your dog’s health, diet preferences, and lifestyle.
        </p>
      </div>

      {/* Filters + Sorting */}
      <div className="bg-white p-4 rounded-lg shadow mb-8 grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by Name or Description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded col-span-2"
        />

        {/* Brand */}
        <select
          value={filters.brand}
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Protein / Fat */}
        <input type="number" placeholder="Min Protein" value={filters.minProtein}
          onChange={(e) => setFilters({ ...filters, minProtein: e.target.value })}
          className="border p-2 rounded" />
        <input type="number" placeholder="Max Fat" value={filters.maxFat}
          onChange={(e) => setFilters({ ...filters, maxFat: e.target.value })}
          className="border p-2 rounded" />

        {/* Calories */}
        <input type="number" placeholder="Min Calories" value={filters.minCalories}
          onChange={(e) => setFilters({ ...filters, minCalories: e.target.value })}
          className="border p-2 rounded" />
        <input type="number" placeholder="Max Calories" value={filters.maxCalories}
          onChange={(e) => setFilters({ ...filters, maxCalories: e.target.value })}
          className="border p-2 rounded" />

        {/* Allergy */}
        <select
          value={filters.allergy}
          onChange={(e) => setFilters({ ...filters, allergy: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Ignore Allergies</option>
          {allergies.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Health Condition */}
        <select
          value={filters.healthCondition}
          onChange={(e) => setFilters({ ...filters, healthCondition: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Any Health Condition</option>
          {healthConditions.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="proteinHigh">Protein: High → Low</option>
          <option value="fatLow">Fat: Low → High</option>
          <option value="caloriesLow">Calories: Low → High</option>
          <option value="caloriesHigh">Calories: High → Low</option>
        </select>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
        >
          Clear
        </button>
      </div>

      {/* Products */}
      <h2 className="text-2xl text-center font-bold text-[#fe9f23] mb-6">Available Products</h2>
      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white shadow rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="w-full h-500 bg-gray-200 rounded-md mb-2">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-md mb-2" />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-md mb-2"></div>
                )}
                </div>
                <h3 className="text-lg font-semibold text-[#31ab3a]">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{p.brand}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>

                <div className="mt-3 text-sm text-gray-700">
                  <p><strong>Price:</strong> Rs. {p.price.toFixed(2)}</p>
                  <p><strong>Protein:</strong> {p.proteinPer100g} g/100g</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={!p.available || p.stock <= 0}
                  className={`flex-1 py-2 rounded-lg text-white ${
                    p.available && p.stock > 0
                      ? "bg-[#fe9f23] hover:bg-orange-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {p.available && p.stock > 0 ? "Add" : "Out"}
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* === Product Details Modal === */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold text-[#31ab3a] mb-2">{selectedProduct.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedProduct.brand}</p>
            <p className="text-gray-700 mb-4">{selectedProduct.description}</p>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>Price:</strong> ${selectedProduct.price.toFixed(2)}</p>
              <p><strong>Calories:</strong> {selectedProduct.caloriesPer100g} kcal/100g</p>
              <p><strong>Protein:</strong> {selectedProduct.proteinPer100g} g/100g</p>
              <p><strong>Fat:</strong> {selectedProduct.fatPer100g} g/100g</p>
            </div>

            {selectedProduct.forbiddenAllergies?.length > 0 && (
              <p className="mt-3 text-sm text-red-600">
                ⚠ Allergens: {selectedProduct.forbiddenAllergies.join(", ")}
              </p>
            )}
            {selectedProduct.allowedHealthConditions?.length > 0 && (
              <p className="mt-1 text-sm text-green-600">
                Suitable for: {selectedProduct.allowedHealthConditions.join(", ")}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                disabled={!selectedProduct.available || selectedProduct.stock <= 0}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedProduct.available && selectedProduct.stock > 0
                    ? "bg-[#fe9f23] hover:bg-orange-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;



