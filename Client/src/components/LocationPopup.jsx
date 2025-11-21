import React, { useState } from "react";
import SelectLocationMap from "./SelectLocationMap";
import { API } from "../lib/apiConfig";

const LocationPopup = ({ onClose, onSave }) => {
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
        alert("Please log in first");
        return;
        }

        // This must match backend route
        const res = await API.post(
        "/auth/add-address",
        {
            name,
            phone,
            address,
            city,
            state,
            zip,
            location: { latitude, longitude },
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
        );

        alert("✅ Address added successfully!");
        onSave({
        lat: latitude,
        lng: longitude,
        address,
        });

        onClose();
    } catch (err) {
        console.error("❌ Location save failed:", err);
        alert("Failed to save location. Please try again.");
    }
};


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <h2 className="text-xl font-bold mb-4 text-center">
          Choose Your Delivery Location
        </h2>

        <SelectLocationMap onLocationSelect={setLocation} />

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {saving ? "Saving..." : "Confirm Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPopup;
