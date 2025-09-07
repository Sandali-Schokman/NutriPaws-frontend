// src/pages/admin/AdminIngredients.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function AdminIngredients() {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState([]);

  const fetchIngredients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/ingredients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIngredients(res.data);
    } catch (err) {
      toast.error("Failed to fetch ingredients");
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/ingredients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Deleted ingredient");
      fetchIngredients();
    } catch (err) {
      toast.error("Failed to delete ingredient");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#31ab3a]">Ingredients</h2>
        <Link
          to="/admin/ingredients/new"
          className="bg-[#fe9f23] text-white px-4 py-2 rounded"
        >
          Add Ingredient
        </Link>
      </div>

      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        {ingredients.length === 0 ? (
          <p>No ingredients found</p>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Calories/100g</th>
                <th className="p-2 border">Protein/100g</th>
                <th className="p-2 border">Fat/100g</th>
                <th className="p-2 border">Forbidden Allergies</th>
                <th className="p-2 border">Unsuitable Conditions</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((i) => (
                <tr key={i.id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border font-semibold">{i.name}</td>
                  <td className="p-2 border">{i.caloriesPer100g}</td>
                  <td className="p-2 border">{i.proteinPer100g}</td>
                  <td className="p-2 border">{i.fatPer100g}</td>
                  <td className="p-2 border text-red-600">
                    {i.forbiddenAllergies?.length > 0
                      ? i.forbiddenAllergies.join(", ")
                      : "—"}
                  </td>
                  <td className="p-2 border text-orange-600">
                    {i.unsuitableHealthConditions?.length > 0
                      ? i.unsuitableHealthConditions.join(", ")
                      : "—"}
                  </td>
                  <td className="p-2 border space-x-2">
                    <Link
                      to={`/admin/ingredients/edit/${i.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(i.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminIngredients;

