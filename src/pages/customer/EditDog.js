import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function EditDog({ dog, onUpdated, onCancel }) {
  const { token } = useAuth();
  const [updatedDog, setUpdatedDog] = useState({
    ...dog,
    neutered: Boolean(dog.neutered), // ensure boolean
    healthConditions: dog.healthConditions ? dog.healthConditions.join(", ") : "",
    allergies: dog.allergies ? dog.allergies.join(", ") : ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedDog((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
        ...updatedDog,
        allergies: updatedDog.allergies
          ? updatedDog.allergies.split(",").map((s) => s.trim())
          : [],
        healthConditions: updatedDog.healthConditions
          ? updatedDog.healthConditions.split(",").map((s) => s.trim())
          : []
      };

      await axios.put(`http://localhost:8080/api/dogs/${dog.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${dog.name}'s profile updated successfully!`);
      onUpdated();
    } catch (err) {
      toast.error("Failed to update dog profile. Please try again.");
      console.error("Error updating dog:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}
    className="space-y-4 bg-gray-50 p-6 rounded-2xl shadow-md border">
      <h3 className="text-xl font-bold text-[#31ab3a]">Edit Dog</h3>
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="name"
        value={updatedDog.name}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="breed"
        value={updatedDog.breed}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="age"
        type="number"
        value={updatedDog.age}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="weight"
        type="number"
        value={updatedDog.weight}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="activityLevel"
        value={updatedDog.activityLevel}
        onChange={handleChange}
        required
      />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="neutered"
          checked={!!updatedDog.neutered}
          onChange={handleChange}
          className="h-4 w-4 text-[#31ab3a] focus:ring-[#31ab3a] border-gray-300 rounded"
        />
        <span>Neutered</span>
      </label>

      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#fe9f23]"
        name="healthConditions"
        placeholder="Health Conditions (comma separated)"
        value={updatedDog.healthConditions}
        onChange={handleChange}
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#fe9f23]"
        name="allergies"
        placeholder="Allergies (comma separated)"
        value={updatedDog.allergies}
        onChange={handleChange}
      />

      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="dietPreference"
        value={updatedDog.dietPreference}
        onChange={handleChange}
        required
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-[#31ab3a] hover:bg-green-700 text-white py-2 rounded-lg shadow"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-400 hover:bg-gray-600 text-white py-2 rounded-lg shadow"
        >
          Cancel
        </button>
        </div>
    </form>
  );
}

export default EditDog;
