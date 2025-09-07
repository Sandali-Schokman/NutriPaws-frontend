import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AddDog from "./AddDog";
import EditDog from "./EditDog";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CustomerDashboard() {
  const { token } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [editingDog, setEditingDog] = useState(null);
  const [nutritionPlans, setNutritionPlans] = useState({}); // store per-dog nutrition
  const [planHistory, setPlanHistory] = useState({}); // store all plans per-dog
  const [expandedDog, setExpandedDog] = useState(null); // toggle history view

  // Modal state
  const [confirmDeleteDogId, setConfirmDeleteDogId] = useState(null);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(null); // { dogId, planId }
  const [confirmDeleteAllDogId, setConfirmDeleteAllDogId] = useState(null);

  const fetchDogs = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/dogs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDogs(res.data);
    } catch (err) {
      toast.error("Failed to load dogs.");
      console.error("Error fetching dogs:", err);
    }
  };

  const handleDeleteDogConfirmed = async () => {
    if (!confirmDeleteDogId) return;
    try {
      await axios.delete(`http://localhost:8080/api/dogs/${confirmDeleteDogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDogs();
      toast.success("Dog deleted successfully.");
      setConfirmDeleteDogId(null);
    } catch (err) {
      console.error("Error deleting dog:", err);
      toast.error("Failed to delete dog.");
    }
  };

  const handleViewNutrition = async (dog) => {
    try {
      // 1. Generate plan via Spring → Flask ML
      const res = await axios.post(
        "http://localhost:8080/api/nutrition/plan",
        {
          breed: dog.breed,
          age: dog.age,
          weight: dog.weight,
          activityLevel: dog.activityLevel,
          neutered: dog.neutered,
          health: dog.healthConditions?.join(", ") || "",
          allergy: dog.allergies?.join(", ") || "",
          dietPreferred: dog.dietPreference
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const plan = res.data;

      // 2. Save plan
      await axios.post(
        `http://localhost:8080/api/nutrition/save/${dog.id}`,
        plan,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Update UI (latest plan only)
      setNutritionPlans((prev) => ({ ...prev, [dog.id]: plan }));

      // 4. Refresh history
      fetchPlanHistory(dog.id);
      toast.success("Nutrition plan generated & saved!");
    } catch (err) {
      console.error("Error fetching nutrition plan:", err);
      toast.error("Failed to fetch nutrition plan for " + dog.name);
    }
  };

  // Fetch all saved plans for a dog
  const fetchPlanHistory = async (dogId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/nutrition/plans/${dogId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlanHistory((prev) => ({ ...prev, [dogId]: res.data }));
    } catch (err) {
      toast.error("Failed to load plan history.");
      console.error("Error fetching plan history:", err);
    }
  };

  // Delete single plan
  const handleDeletePlanConfirmed = async () => {
    if (!confirmDeletePlan) return;
    const { dogId, planId } = confirmDeletePlan;
    try {
      await axios.delete(
        `http://localhost:8080/api/nutrition/plans/${dogId}/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPlanHistory(dogId);
      toast.success("Plan deleted successfully.");
      setConfirmDeletePlan(null);
    } catch (err) {
      console.error("Error deleting plan:", err);
      toast.error("Failed to delete plan.");
    }
  };

  const handleConfirmDeleteAllPlans = async () => {
    if (!confirmDeleteAllDogId) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/nutrition/plans/${confirmDeleteAllDogId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPlanHistory(confirmDeleteAllDogId);
      toast.success("All plans deleted successfully.");
      setConfirmDeleteAllDogId(null);
    } catch (err) {
      toast.error("Failed to delete all plans.");
      console.error("Error deleting all plans:", err);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [token]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 className="text-3xl font-bold mb-6 text-[#31ab3a]">Pet Profile Manager</h2>

      {/* Link to standalone Nutrition Planner page */}
      <Link to="/customer/nutrition-planner">
        <button className="mb-6 bg-[#fe9f23] hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow">
          Go to Full Nutrition Planner
        </button>
      </Link>

      {/* Add Dog Form */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">Add a Dog</h3>
        <AddDog />
      </div>

      {/* Your Dogs Section */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-[#fe9f23]">Your Dogs</h3>
        {editingDog ? (
          <EditDog
            dog={editingDog}
            onUpdated={() => {
              setEditingDog(null);
              fetchDogs();
            }}
            onCancel={() => setEditingDog(null)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <div key={dog.id} className="card">
                <h4 className="text-lg text-brandGreen">{dog.name}</h4>
                <p>{dog.breed} • {dog.age} yrs • {dog.weight}kg</p>
                <p>Activity: {dog.activityLevel}</p>
                <p>Neutered: {dog.neutered ? "✅ Yes" : "❌ No"}</p>
                <p>Diet: {dog.dietPreference}</p>

                {dog.allergies?.length > 0 && <p>Allergies: {dog.allergies.join(", ")}</p>}
                {dog.healthConditions?.length > 0 && <p>Health: {dog.healthConditions.join(", ")}</p>}

                <div className="mt-3 flex gap-2">
                  <button className="btn-green" onClick={() => setEditingDog(dog)}>Edit</button>
                  <button
                    className="btn-orange"
                    onClick={() => setConfirmDeleteDogId(dog.id)}
                  >
                    Delete
                  </button>
                  <button className="bg-gray-700 text-white" onClick={() => handleViewNutrition(dog)}>Nutrition</button>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setExpandedDog(expandedDog === dog.id ? null : dog.id);
                      console.log("Expanded Dog:", expandedDog === dog.id ? null : dog.id);
                      if (expandedDog !== dog.id) fetchPlanHistory(dog.id);
                    }}
                  >
                    {expandedDog === dog.id ? "Hide Plans" : "View Plans"}
                  </button>
                </div>

                {nutritionPlans[dog.id] && (
                  <div className="mt-3 bg-gray-100 p-3 rounded-lg">
                    <h5 className="font-semibold">Nutrition Plan</h5>
                    <p>Calories: {Number(nutritionPlans[dog.id].target_calories_per_day).toFixed(2)} kcal</p>
                    <p>Protein: {Number(nutritionPlans[dog.id].target_protein_g).toFixed(2)} g</p>
                    <p>Fat: {Number(nutritionPlans[dog.id].target_fat_g).toFixed(2)} g</p>
                  </div>
                )}

                {expandedDog === dog.id && planHistory[dog.id] && (
                  <div className="mt-3 bg-gray-50 border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold mb-2">Plan History</h5>
                    <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => setConfirmDeleteAllDogId(dog.id)}
                    >
                      Delete All Plans
                    </button>
                    </div>
                    {planHistory[dog.id].map((plan) => (
                      <div key={plan.id} className="mb-2 p-2 bg-white rounded shadow-sm">
                        <p><strong>Calories:</strong> {plan.target_calories_per_day} kcal</p>
                        <p><strong>Protein:</strong> {plan.target_protein_g} g</p>
                        <p><strong>Fat:</strong> {plan.target_fat_g} g</p>
                        {plan.createdAt && (
                          <p className="text-xs text-gray-500">
                            Created: {new Date(plan.createdAt.seconds * 1000).toLocaleString()}
                          </p>
                        )}

                        {/* Delete Button */}
                        <button
                          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => setConfirmDeletePlan({ dogId: dog.id, planId: plan.id })}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Confirm Delete Dog Modal */}
      {confirmDeleteDogId && (
        <ConfirmModal
          title="Delete Dog"
          message="Are you sure you want to delete this dog profile? This cannot be undone."
          onCancel={() => setConfirmDeleteDogId(null)}
          onConfirm={handleDeleteDogConfirmed}
        />
      )}

      {/* Confirm Delete Single Plan */}
      {confirmDeletePlan && (
        <ConfirmModal
          title="Delete Nutrition Plan"
          message="Are you sure you want to delete this nutrition plan?"
          onCancel={() => setConfirmDeletePlan(null)}
          onConfirm={handleDeletePlanConfirmed}
        />
      )}

      {/* Confirm Delete All Plans */}
      {confirmDeleteAllDogId && (
        <ConfirmModal
          title="Delete All Plans"
          message="Are you sure you want to delete ALL nutrition plans for this dog?"
          onCancel={() => setConfirmDeleteAllDogId(null)}
          onConfirm={handleConfirmDeleteAllPlans}
        />
      )}
    </div>
  );
}

// Reusable modal component
function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4 text-red-600">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;

