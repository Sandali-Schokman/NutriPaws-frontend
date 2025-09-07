// src/pages/customer/CustomerProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function CustomerProfile() {
  const { currentUser, token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/users/${currentUser.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setForm(res.data);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email && token) {
      fetchProfile();
    }
  }, [currentUser, token]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:8080/api/users/${currentUser.email}`,
        {
          name: form.name,
          email: form.email, 
          phone: form.phone,
          address: form.address
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="max-w-xl w-full bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-[#31ab3a] mb-6">My Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email - read-only */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#fe9f23] text-white py-3 rounded-lg hover:bg-orange-600 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerProfile;
