// src/pages/customer/RecommendedIngredients.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

function RecommendedIngredients() {
  const { token } = useAuth();
  const { dogId } = useParams();
  const [ingredients, setIngredients] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const user = getAuth().currentUser;

  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/ingredients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIngredients(res.data);
    } catch (err) {
      console.error("Error fetching ingredients:", err);
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
      setNutritionPlan(res.data[0]); // latest plan
    } catch (err) {
      console.error("Error fetching nutrition plan:", err);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchDog();
    fetchNutritionPlan();
  }, [dogId]);

  // Add ingredient to feeding schedule
  const addIngredientToSchedule = async (ingredient) => {
    if (!selectedDog || !nutritionPlan) return;

    const caloriesPer100g = ingredient.caloriesPer100g || 0;
    if (caloriesPer100g <= 0) {
      toast.error("Ingredient calories not defined!");
      return;
    }

    // Calculate portions
    const dailyPortion = (nutritionPlan.target_calories_per_day / caloriesPer100g) * 100;
    const meals = 3;
    const portionPerMeal = Math.round(dailyPortion / meals);

    try {
      await axios.post(
        `http://localhost:8080/api/dogs/feeding-schedule/${dogId}/add`,
        {
          productId: ingredient.id,
          productName: ingredient.name,
          portionG: portionPerMeal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        `${ingredient.name} added (${portionPerMeal}g x ${meals} meals)`
      );
      window.dispatchEvent(new Event("feedingScheduleUpdated"));
    } catch (err) {
      console.error("Failed to add ingredient:", err);
      toast.error("Failed to add ingredient to feeding schedule");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6 text-center">
        🥕 Recommended Ingredients for {selectedDog?.name || "your dog"}
      </h2>

      {ingredients.length === 0 ? (
        <p className="text-center text-gray-500">No ingredients available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ingredients.map((i) => (
            <div key={i.id} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-bold">{i.name}</h3>
              <p>Calories: {i.caloriesPer100g} /100g</p>
              <p>Protein: {i.proteinPer100g} g</p>
              <p>Fat: {i.fatPer100g} g</p>
              <p className="text-sm text-gray-500">
                Allergies: {i.forbiddenAllergies?.join(", ") || "None"}
              </p>
              <p className="text-sm text-gray-500">
                Conditions: {i.unsuitableHealthConditions?.join(", ") || "None"}
              </p>
              <button
                onClick={() => addIngredientToSchedule(i)}
                className="mt-3 w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg"
              >
                Add to Feeding Schedule
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendedIngredients;
