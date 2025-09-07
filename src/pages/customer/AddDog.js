import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function AddDog() {
  const { token } = useAuth();
  const [dog, setDog] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    activityLevel: "",
    neutered: false,
    healthConditions: "",
    allergies: "",
    dietPreference: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDog((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
        ...dog,
        allergies: dog.allergies
          ? dog.allergies.split(",").map((s) => s.trim())
          : [],
        healthConditions: dog.healthConditions
          ? dog.healthConditions.split(",").map((s) => s.trim())
          : []
      };

      await axios.post("http://localhost:8080/api/dogs/add", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`🐶 ${dog.name}'s profile added successfully!`);
        // Reset form after successful submission
      setDog({
        name: "",
        breed: "",
        age: "",
        weight: "",
        activityLevel: "",
        neutered: false,
        healthConditions: "",
        allergies: "",
        dietPreference: ""
      });
    } catch (err) {
      toast.error("❌ Failed to add dog profile. Please try again.");
      console.error("Error adding dog:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}
    className="space-y-4 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-[#31ab3a]">Add Dog Profile</h2>
       <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="name"
        placeholder="Name"
        value={dog.name}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="breed"
        placeholder="Breed"
        value={dog.breed}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="age"
        type="number"
        placeholder="Age"
        value={dog.age}
        onChange={handleChange}
        required
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="weight"
        type="number"
        placeholder="Weight (kg)"
        value={dog.weight}
        onChange={handleChange}
        required
      />
      <select
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="activityLevel"
        value={dog.activityLevel}
        onChange={handleChange}
        required
      >
        <option value="">Select Activity</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="neutered"
          checked={dog.neutered}
          onChange={handleChange}
          className="h-4 w-4 text-[#31ab3a] focus:ring-[#31ab3a] border-gray-300 rounded"
        />
        <span>Neutered</span>
      </label>

      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#fe9f23]"
        name="healthConditions"
        placeholder="Health Conditions (comma separated)"
        value={dog.healthConditions}
        onChange={handleChange}
      />
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#fe9f23]"
        name="allergies"
        placeholder="Allergies (comma separated)"
        value={dog.allergies}
        onChange={handleChange}
      />

      <select
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#31ab3a]"
        name="dietPreference"
        value={dog.dietPreference}
        onChange={handleChange}
        required
      >
        <option value="">Select Diet</option>
        <option value="Dry">Dry</option>
        <option value="Raw">Raw</option>
        <option value="Home-cooked">Home-cooked</option>
      </select>

      <button
        type="submit"
        className="w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg shadow"
      >
        Add Dog
      </button>
    </form>
  );
}

export default AddDog;
