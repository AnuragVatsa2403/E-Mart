import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/apiConfig";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify"; // ⭐ Toast added

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const AddDeliveryAddress = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "", // ⭐ NEW FIELD
    city: "",
    state: "",
    zip: "",
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await res.json();
      setAddress(data?.display_name || "Unknown location");
    } catch (err) {
      setAddress("Unable to detect address, please enter manually.");
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return position ? <Marker position={position}></Marker> : null;
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported!");

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        setLoading(false);
        toast.success("📍 Location detected!");
      },
      () => {
        toast.error("Failed to get GPS location");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!position) return toast.error("Please select a location on the map.");

    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/auth/add-address",
        {
          ...form,
          address,
          location: {
            latitude: position.lat,
            longitude: position.lng,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Address saved successfully!");
      navigate("/select-address");
    } catch (err) {
      toast.error("Failed to save address.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6 flex justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-yellow-200 w-full max-w-lg">
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Add Delivery Address
        </h2>

        {/* MAP */}
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={13}
          style={{ height: "320px", width: "100%" }}
          className="rounded-xl border-2 border-yellow-200 shadow-md"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>

        {/* LOCATION INFO */}
        <div className="mt-3 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          {position ? (
            <>
              <p><strong>Lat:</strong> {position.lat.toFixed(4)}</p>
              <p><strong>Lng:</strong> {position.lng.toFixed(4)}</p>
              <p className="mt-2"><strong>Address:</strong> {address}</p>
            </>
          ) : (
            <p className="text-gray-500">Tap the map or use GPS</p>
          )}
        </div>

        <button
          onClick={useMyLocation}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white font-semibold hover:scale-[1.03] transition shadow-lg mt-4"
        >
          {loading ? "Detecting..." : "Use My Location"}
        </button>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Full Name */}
          <input
            name="name"
            placeholder="Full Name"
            className="input-field"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* Phone */}
          <input
            name="phone"
            placeholder="Phone Number"
            className="input-field"
            value={form.phone}
            onChange={handleChange}
            required
          />

          {/* ⭐ Full Address Textbox */}
          <textarea
            name="fullAddress"
            placeholder="House No, Street, Landmark (Full Address)"
            className="input-field h-20"
            value={form.fullAddress}
            onChange={handleChange}
            required
          />

          {/* City */}
          <input
            name="city"
            placeholder="City"
            className="input-field"
            value={form.city}
            onChange={handleChange}
          />

          {/* State */}
          <input
            name="state"
            placeholder="State"
            className="input-field"
            value={form.state}
            onChange={handleChange}
          />

          {/* ZIP */}
          <input
            name="zip"
            placeholder="ZIP Code"
            className="input-field"
            value={form.zip}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
          >
            Save Address
          </button>
        </form>

        <style>{`
          .input-field {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1.5px solid #e5e7eb;
            background: white;
            transition: 0.2s;
          }
          .input-field:focus {
            border-color: #f59e0b;
            box-shadow: 0 0 0 3px #f59e0b33;
            outline: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddDeliveryAddress;
