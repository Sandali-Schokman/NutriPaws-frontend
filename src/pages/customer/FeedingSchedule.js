// src/pages/customer/FeedingSchedule.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function FeedingSchedule({selectedDog}) {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const navigate = useNavigate();

  const fetchSchedule = async () => {
    try {
      console.log("dogId:", selectedDog.id);
      const res = await axios.get(
        `http://localhost:8080/api/dogs/feeding-schedule/${selectedDog.id}`);
      console.log("Feeding schedule response:", res.data);
      setSchedule(res.data || []);
    } catch (err) {
      console.error("Error fetching feeding schedule:", err);
      toast.error("Failed to fetch feeding schedule");
    }
  };

  useEffect(() => {
    fetchSchedule();

    // Refresh automatically if RecommendedProducts triggers update
    const handleUpdate = () => fetchSchedule();
    window.addEventListener("feedingScheduleUpdated", handleUpdate);

    return () => window.removeEventListener("feedingScheduleUpdated", handleUpdate);
  }, [selectedDog]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6 text-center">
        🐶 Feeding Schedule
      </h2>
      <button
  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
  onClick={() => navigate(`/customer/shopping-list/${selectedDog.id}`)}
>
  View Weekly Shopping List
</button>


      {schedule.length === 0 ? (
        <p className="text-center text-gray-500">No feeding schedule yet.</p>
      ) : (
        <div className="space-y-6">
          {schedule
            .sort((a, b) => a.mealNumber - b.mealNumber)
            .map((meal) => (
              <div key={meal.mealNumber} className="bg-white shadow rounded-lg p-4">
                <h3 className="text-xl font-semibold text-[#fe9f23] mb-3">
                  Meal {meal.mealNumber}
                </h3>
                {meal.items && meal.items.length > 0 ? (
                  <ul className="space-y-2">
                    {meal.items.map((item, i) => (
                      <li key={i} className="flex justify-between border-b pb-1">
                        <span>{item.productName}</span>
                        <span>{item.portionG} g</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No products in this meal.</p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default FeedingSchedule;
