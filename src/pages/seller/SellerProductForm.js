// src/pages/seller/SellerProductForm.js
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function SellerProductForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();

  const editing = !!productId;
  const productData = location.state?.product || {};

  const [form, setForm] = useState({
    name: productData.name || "",
    brand: productData.brand || "",
    description: productData.description || "",
    type: productData.type || "",
    price: productData.price || "",
    stock: productData.stock || "",
    available: productData.available ?? true,
    caloriesPer100g: productData.caloriesPer100g || "",
    proteinPer100g: productData.proteinPer100g || "",
    fatPer100g: productData.fatPer100g || "",
    allowedHealthConditions: productData.allowedHealthConditions?.join(", ") || "",
    forbiddenAllergies: productData.forbiddenAllergies?.join(", ") || ""
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = useAuth().currentUser;
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImageUpload = async () => {
  if (!file) return;
  setUploading(true);
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post("http://localhost:8080/api/products/upload-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    console.log("Image upload response:", res.data);
    setForm((prev) => ({ ...prev, imageUrl: res.data }));
    toast.success("Image uploaded!");
  } catch (err) {
    toast.error("Image upload failed");
  } finally {
    setUploading(false);
  }
};


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    console.log("Submitting form:", form);
    e.preventDefault();

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      caloriesPer100g: form.caloriesPer100g ? parseFloat(form.caloriesPer100g) : null,
      proteinPer100g: form.proteinPer100g ? parseFloat(form.proteinPer100g) : null,
      fatPer100g: form.fatPer100g ? parseFloat(form.fatPer100g) : null,
      allowedHealthConditions: form.allowedHealthConditions
        ? form.allowedHealthConditions.split(",").map((s) => s.trim())
        : [],
      forbiddenAllergies: form.forbiddenAllergies
        ? form.forbiddenAllergies.split(",").map((s) => s.trim())
        : []
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:8080/api/products/${productId}`, payload, {
          headers: { Email: user.email }
        });
        toast.success("Product updated!");
      } else {
        await axios.post("http://localhost:8080/api/products", payload, {
          headers: { Email: user.email }
        });
        toast.success("Product created!");
      }
      navigate("/seller/products");
    } catch (err) {
      toast.error("Error saving product");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-lg">
        <h2 className="text-2xl font-bold text-[#31ab3a] mb-4">
          {editing ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="w-full border p-2 rounded" required />
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" className="w-full border p-2 rounded" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
          <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded" required>
            <option value="">Select Type</option>
            <option value="Dry">Dry</option>
            <option value="Raw">Raw</option>
            <option value="Wet">Wet</option>
            <option value="Home-cooked">Home-cooked</option>
            <option value="Supplement">Supplement</option>
          </select>
          <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded" required />
          <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" className="w-full border p-2 rounded" required />
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            <span>Available</span>
          </label>

          <input type="number" name="caloriesPer100g" value={form.caloriesPer100g} onChange={handleChange} placeholder="Calories per 100g" className="w-full border p-2 rounded" />
          <input type="number" name="proteinPer100g" value={form.proteinPer100g} onChange={handleChange} placeholder="Protein per 100g" className="w-full border p-2 rounded" />
          <input type="number" name="fatPer100g" value={form.fatPer100g} onChange={handleChange} placeholder="Fat per 100g" className="w-full border p-2 rounded" />

          <input name="allowedHealthConditions" value={form.allowedHealthConditions} onChange={handleChange} placeholder="Allowed Health Conditions (comma separated)" className="w-full border p-2 rounded" />
          <input name="forbiddenAllergies" value={form.forbiddenAllergies} onChange={handleChange} placeholder="Forbidden Allergies (comma separated)" className="w-full border p-2 rounded" />

          <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded" />
<button
  type="button"
  onClick={handleImageUpload}
  disabled={uploading}
  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
>
  {uploading ? "Uploading..." : "Upload Image"}
</button>

{form.imageUrl && (
  <img src={form.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded mt-4" />
)}


          <button type="submit" className="w-full bg-[#fe9f23] hover:bg-orange-600 text-white py-2 rounded-lg">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SellerProductForm;
