import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import FeedingSchedule from "./FeedingSchedule";
import FeedingReminders from "./FeedingReminders";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom"; 

function NutritionPlanner() {
  const { token } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    breed: "",
    age: "",
    weight: "",
    activityLevel: "",
    neutered: false,
    health: "",
    allergy: "",
    dietPreferred: ""
  });

  // Fetch dogs
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/dogs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDogs(res.data);
      } catch (err) {
        console.error("Error fetching dogs:", err);
      }
    };
    fetchDogs();
  }, [token]);

  const handleDogSelect = (dogId) => {
    const dog = dogs.find((d) => d.id === dogId);
    if (dog) {
      setSelectedDog(dog);
      setFormData({
        breed: dog.breed || "",
        age: dog.age || "",
        weight: dog.weight || "",
        activityLevel: dog.activityLevel || "",
        neutered: dog.neutered || false,
        health: dog.healthConditions?.join(", ") || "",
        allergy: dog.allergies?.join(", ") || "",
        dietPreferred: dog.dietPreference || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    try {
      // Generate plan via Flask
      const res = await axios.post(
        "http://localhost:8080/api/nutrition/plan",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      const generatedPlan = res.data;
      setPlan(generatedPlan);

      // Save into Firestore under selected dog
      if (selectedDog?.id) {
        await axios.post(
          `http://localhost:8080/api/nutrition/save/${selectedDog.id}`,
          generatedPlan,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log("Nutrition plan saved for dog:", selectedDog.name);
      }
    } catch (err) {
      console.error("Error generating nutrition plan:", err);
      alert("Failed to generate nutrition plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-[#31ab3a] mb-6 text-center">
          🍲 Nutrition Planner
        </h2>

        {/* Dog Selector */}
        <select
  className="w-full border rounded-lg p-2 mb-4"
  onChange={(e) => handleDogSelect(e.target.value)}
  value={selectedDog?.id || ""}
>
  <option value="" disabled>
    Select a Dog
  </option>
  {dogs.map((dog) => (
    <option key={dog.id} value={dog.id}>
      {dog.name} ({dog.breed})
    </option>
  ))}
</select>

        {/* Form */}
        {selectedDog && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <input
              name="breed"
              placeholder="Breed"
              value={formData.breed}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
            <input
              name="age"
              type="number"
              placeholder="Age (years)"
              value={formData.age}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
            <input
              name="weight"
              type="number"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            >
              <option value="">Select Activity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <label className="flex items-center space-x-2 sm:col-span-2">
              <input
                type="checkbox"
                name="neutered"
                checked={formData.neutered}
                onChange={handleChange}
              />
              <span>Neutered</span>
            </label>
            <input
              name="health"
              placeholder="Health Conditions"
              value={formData.health}
              onChange={handleChange}
              className="border rounded-lg p-2 sm:col-span-2"
            />
            <input
              name="allergy"
              placeholder="Allergies"
              value={formData.allergy}
              onChange={handleChange}
              className="border rounded-lg p-2 sm:col-span-2"
            />
            <select
              name="dietPreferred"
              value={formData.dietPreferred}
              onChange={handleChange}
              className="border rounded-lg p-2 sm:col-span-2"
              required
            >
              <option value="">Select Diet</option>
              <option value="Dry">Dry</option>
              <option value="Raw">Raw</option>
              <option value="Home-cooked">Home-cooked</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="col-span-2 bg-gradient-to-r from-[#31ab3a] to-[#fe9f23] text-white font-semibold py-2 rounded-lg"
            >
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </form>
        )}
      

        {/* Nutrition Plan Display */}
        {plan && (
          <>
          <div className="mt-6 p-6 bg-gray-100 rounded-xl">
            <h3 className="text-xl font-semibold text-[#fe9f23] mb-3">
              Predicted Nutrition Plan
            </h3>
            <p>
              <strong>Calories:</strong> {plan.target_calories_per_day} kcal
            </p>
            <p>
              <strong>Protein:</strong> {plan.target_protein_g} g
            </p>
            <p>
              <strong>Fat:</strong> {plan.target_fat_g} g
            </p>
            <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                onClick={() =>
                  navigate(`/customer/recommended/${selectedDog.id}`, {
                    state: { selectedDog, nutritionPlan: plan },
                  })
                }
              >
                View Recommended Products
              </button>
          </div>
          {/* Feeding Schedule */}
          <FeedingSchedule selectedDog={selectedDog} plan={plan} />
          <FeedingReminders selectedDog={selectedDog} />
          </>
        )}
      </div>
    </div>
  );
}

export default NutritionPlanner;

