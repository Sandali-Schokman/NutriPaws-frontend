// src/pages/admin/AdminIngredientForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

function AdminIngredientForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    caloriesPer100g: "",
    proteinPer100g: "",
    fatPer100g: "",
    forbiddenAllergies: "",
    unsuitableHealthConditions: ""
  });

  // Prefill form if editing
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8080/api/ingredients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const ing = res.data;
          setForm({
            name: ing.name,
            caloriesPer100g: ing.caloriesPer100g,
            proteinPer100g: ing.proteinPer100g,
            fatPer100g: ing.fatPer100g,
            forbiddenAllergies: ing.forbiddenAllergies?.join(", ") || "",
            unsuitableHealthConditions: ing.unsuitableHealthConditions?.join(", ") || "",
          });
        })
        .catch(() => toast.error("Failed to load ingredient"));
    }
  }, [id, token]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      caloriesPer100g: parseFloat(form.caloriesPer100g) || 0,
      proteinPer100g: parseFloat(form.proteinPer100g) || 0,
      fatPer100g: parseFloat(form.fatPer100g) || 0,
      forbiddenAllergies: form.forbiddenAllergies
        ? form.forbiddenAllergies.split(",").map((s) => s.trim())
        : [],
      unsuitableHealthConditions: form.unsuitableHealthConditions
        ? form.unsuitableHealthConditions.split(",").map((s) => s.trim())
        : []
    };

    try {
      if (id) {
        // Update
        await axios.put(`http://localhost:8080/api/ingredients/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ingredient updated!");
      } else {
        // Add new
        await axios.post("http://localhost:8080/api/ingredients", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ingredient added!");
      }
      navigate("/admin/ingredients");
    } catch (err) {
      toast.error("Failed to save ingredient");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold text-[#31ab3a] mb-4">
            {id ? "Edit Ingredient" : "Add Ingredient"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Ingredient Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            step="0.1"
            name="caloriesPer100g"
            placeholder="Calories per 100g"
            value={form.caloriesPer100g}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            step="0.1"
            name="proteinPer100g"
            placeholder="Protein per 100g"
            value={form.proteinPer100g}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            step="0.1"
            name="fatPer100g"
            placeholder="Fat per 100g"
            value={form.fatPer100g}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="forbiddenAllergies"
            placeholder="Forbidden Allergies (comma separated)"
            value={form.forbiddenAllergies}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            name="unsuitableHealthConditions"
            placeholder="Unsuitable Health Conditions (comma separated)"
            value={form.unsuitableHealthConditions}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            className="w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded"
          >
            {id ? "Update Ingredient" : "Save Ingredient"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminIngredientForm;
