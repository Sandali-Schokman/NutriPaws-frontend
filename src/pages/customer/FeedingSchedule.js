// src/pages/customer/FeedingSchedule.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

function FeedingSchedule() {
  const { token } = useAuth();
  const { dogId } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [dog, setDog] = useState(null);
  const user = getAuth().currentUser;

  // Fetch dog info
  const fetchDog = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/dogs/${dogId}`, {
        headers: { Email: user?.email || "" },
      });
      setDog(res.data);
    } catch (err) {
      console.error("Error fetching dog:", err);
      toast.error("Failed to fetch dog info");
    }
  };

  // Fetch feeding schedule
  const fetchSchedule = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/dogs/${dogId}/feeding-schedule`,
        { headers: { Email: user?.email || "" } }
      );
      setSchedule(res.data || []);
    } catch (err) {
      console.error("Error fetching feeding schedule:", err);
      toast.error("Failed to fetch feeding schedule");
    }
  };

  useEffect(() => {
    fetchDog();
    fetchSchedule();
  }, [dogId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#31ab3a] mb-6 text-center">
        🐶 Feeding Schedule for {dog?.name || "your dog"}
      </h2>

      {schedule.length === 0 ? (
        <p className="text-center text-gray-500">No feeding schedule yet.</p>
      ) : (
        <div className="space-y-6">
          {schedule.map((meal) => (
            <div key={meal.mealNumber} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold text-[#fe9f23] mb-3">
                Meal {meal.mealNumber}
              </h3>
              {meal.items.length === 0 ? (
                <p className="text-gray-500">No products added for this meal.</p>
              ) : (
                <div className="space-y-2">
                  {meal.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between border-b pb-1"
                    >
                      <span>{item.productName}</span>
                      <span>{item.portionG} g</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedingSchedule;
