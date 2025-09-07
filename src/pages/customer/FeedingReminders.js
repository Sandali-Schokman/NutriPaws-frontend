// src/pages/customer/FeedingReminders.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function FeedingReminders({ selectedDog, plan }) {
  // Default schedule
  const [reminders, setReminders] = useState([
    { time: "08:00", label: "Morning", enabled: true, portion: {} },
    { time: "13:00", label: "Afternoon", enabled: true, portion: {} },
    { time: "19:00", label: "Evening", enabled: true, portion: {} },
  ]);

  // Split plan macros into 3 equal meals by default
  useEffect(() => {
    if (plan) {
      const splitCalories = (plan.target_calories_per_day / 3).toFixed(0);
      const splitProtein = (plan.target_protein_g / 3).toFixed(1);
      const splitFat = (plan.target_fat_g / 3).toFixed(1);

      setReminders((prev) =>
        prev.map((r) => ({
          ...r,
          portion: {
            calories: splitCalories,
            protein: splitProtein,
            fat: splitFat,
          },
        }))
      );
    }
  }, [plan]);

  const handleToggle = (index) => {
    setReminders((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const handleTimeChange = (index, newTime) => {
    setReminders((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, time: newTime } : r
      )
    );
  };

  const saveReminders = () => {
    localStorage.setItem(
      `${selectedDog?.id}_feedingReminders`,
      JSON.stringify(reminders)
    );
    toast.success("Feeding reminders saved!");
  };

  return (
    <div className="mt-6 p-6 bg-white shadow rounded-xl">
      <h3 className="text-xl font-bold text-[#31ab3a] mb-4">
        Feeding Reminders for {selectedDog?.name}
      </h3>

      <div className="space-y-4">
        {reminders.map((reminder, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3"
          >
            {/* Time + Label */}
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="border rounded px-3 py-1"
              />
              <span className="font-medium text-gray-700">{reminder.label}</span>
            </div>

            {/* Portion Info */}
            {plan && (
              <div className="text-sm text-gray-600 flex space-x-4">
                <span>🍖 {reminder.portion.calories} kcal</span>
                <span>🥩 {reminder.portion.protein} g protein</span>
                <span>🥓 {reminder.portion.fat} g fat</span>
              </div>
            )}

            {/* Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reminder.enabled}
                onChange={() => handleToggle(index)}
              />
              <span className="text-sm text-gray-600">Enable</span>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={saveReminders}
        className="mt-4 bg-[#fe9f23] hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow"
      >
        Save Reminders
      </button>
    </div>
  );
}

export default FeedingReminders;
