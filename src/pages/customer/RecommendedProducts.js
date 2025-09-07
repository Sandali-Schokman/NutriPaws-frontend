// src/pages/customer/RecommendedProducts.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

function RecommendedProducts() {
  const { token } = useAuth();
  const { dogId } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const user = getAuth().currentUser;

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch dog info
  const fetchDog = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/dogs/${dogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedDog(res.data);
    } catch (err) {
      console.error("Error fetching dog:", err);
    }
  };

  // Fetch nutrition plan
  const fetchNutritionPlan = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/nutrition/plans/${dogId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNutritionPlan(res.data);
    } catch (err) {
      console.error("Error fetching nutrition plan:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDog();
    fetchNutritionPlan();
  }, [dogId]);

  // Filter recommended products
  useEffect(() => {
    if (!products.length || !selectedDog || !nutritionPlan) return;

    const dogAllergies = Array.isArray(selectedDog.allergies)
      ? selectedDog.allergies.map((a) => a.toLowerCase())
      : [];
    const dogHealthConditions = Array.isArray(selectedDog.healthConditions)
      ? selectedDog.healthConditions.map((h) => h.toLowerCase())
      : [];
    const dogDiet = selectedDog.dietPreference?.toLowerCase() || "";

    const filtered = products
      .filter((p) => {
        const dietType = (p.dietType || "").toLowerCase();
        if (dogDiet && dietType && dietType !== dogDiet) return false;

        const ingredients = Array.isArray(p.ingredients)
          ? p.ingredients.map((i) => i.toLowerCase())
          : [];

        if (dogAllergies.some((a) => ingredients.includes(a))) return false;
        if (dogHealthConditions.some((c) => ingredients.includes(c))) return false;

        return true;
      })
      .map((p) => {
        const caloriesPer100g = p.calories_per_100g || 0;
        const portionG =
          caloriesPer100g > 0
            ? Math.round((nutritionPlan.target_calories_per_day / caloriesPer100g) * 100)
            : 0;
        return { ...p, portionG };
      });

    setRecommended(filtered);
  }, [products, selectedDog, nutritionPlan]);

  // Add product to feeding schedule
  const addToFeedingSchedule = async (product) => {
    if (!selectedDog || !nutritionPlan) return;


    const caloriesPer100g = product.caloriesPer100g || 0;
    if (caloriesPer100g <= 0) {
      toast.error("Product calories not defined!");
      return;
    }

    const dailyPortion =
      (nutritionPlan[0].target_calories_per_day / caloriesPer100g) * 10;
    const meals = 3;
    const portionPerMeal = Math.round(dailyPortion / meals);

    try {
      await axios.post(
        `http://localhost:8080/api/dogs/feeding-schedule/${dogId}/add`,
        {
          productId: product.id,
          productName: product.name,
          portionG: portionPerMeal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        `${product.name} added to feeding schedule (${portionPerMeal}g x ${meals} meals)`
      );

      // Dispatch custom event so FeedingSchedule.js refreshes
      window.dispatchEvent(new Event("feedingScheduleUpdated"));
    } catch (err) {
      console.error("Failed to add product:", err);
      toast.error("Failed to add product to feeding schedule");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6 text-center">
        🐶 Recommended Products for {selectedDog?.name || "your dog"}
      </h2>

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-[#fe9f23] mb-3">Recommended</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {recommended.map((p) => (
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
                <p className="mt-1 font-semibold">Rs. {p.price}</p>
                <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                <p className="text-sm text-gray-500">Portion: {p.portionG} g/day</p>
                <button
                  onClick={() => addToFeedingSchedule(p)}
                  className="mt-3 w-full bg-[#31ab3a] hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Add to Feeding Schedule
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Products */}
      <h3 className="text-xl font-semibold text-[#31ab3a] mb-3">All Products</h3>
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
            <p className="mt-1 font-semibold">Rs. {p.price}</p>
            <p className="text-sm text-gray-500">Stock: {p.stock}</p>
            <button
              onClick={() => addToFeedingSchedule(p)}
              className="mt-3 w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg"
            >
              Add to Feeding Schedule
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedProducts;
