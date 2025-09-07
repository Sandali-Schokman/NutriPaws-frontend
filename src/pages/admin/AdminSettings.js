// src/pages/admin/AdminSettings.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function AdminSettings() {
  const { token } = useAuth();
  const [rate, setRate] = useState(0.1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch commission rate
  const fetchRate = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/settings/commission", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRate(res.data.rate);
    } catch (err) {
      toast.error("❌ Failed to load commission rate");
    } finally {
      setLoading(false);
    }
  };

  // Update commission rate
  const updateRate = async () => {
    if (isNaN(rate) || rate <= 0 || rate >= 1) {
      toast.error("Commission rate must be between 1% and 99%");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        "http://localhost:8080/api/settings/commission",
        { rate: parseFloat(rate) },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      toast.success("✅ Commission rate updated successfully");
    } catch (err) {
      toast.error("❌ Failed to update commission rate");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  if (loading) return <p className="p-6">Loading settings...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-[#31ab3a]">Admin Settings</h2>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 w-full max-w-md">
        <label className="block text-gray-700 font-medium mb-2">
          Platform Commission Rate
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.1"
            min="1"
            max="99"
            value={(rate * 100).toFixed(1)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) setRate(val / 100);
            }}
            className="border rounded px-3 py-2 w-32 text-center"
          />
          <span className="text-gray-700 font-semibold">%</span>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Current Rate: {(rate * 100).toFixed(1)}%
        </p>

        <button
          onClick={updateRate}
          disabled={saving}
          className={`mt-4 px-4 py-2 rounded text-white transition ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#31ab3a] hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}

export default AdminSettings;
