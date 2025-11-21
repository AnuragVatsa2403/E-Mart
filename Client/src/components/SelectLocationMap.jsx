import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix broken default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationMarker = ({ position, onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return position ? <Marker position={position}></Marker> : null;
};

const SelectLocationMap = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Reverse Geocode
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Unknown location";
    }
  };

  const handleSelect = async (latlng) => {
    setPosition(latlng);
    const addr = await getAddressFromCoords(latlng.lat, latlng.lng);
    setAddress(addr);
    onLocationSelect({ lat: latlng.lat, lng: latlng.lng, address: addr });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation not supported by your browser.");

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        const addr = await getAddressFromCoords(latitude, longitude);
        setAddress(addr);
        onLocationSelect({ lat: latitude, lng: longitude, address: addr });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        alert("Failed to detect location. Please allow GPS permission.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Select Location</h3>
        <button
          onClick={useMyLocation}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          {loading ? "Detecting..." : "📍 Use My Location"}
        </button>
      </div>

      <div className="h-[350px] rounded-md overflow-hidden shadow">
        <MapContainer
          center={position ? [position.lat, position.lng] : [28.6139, 77.209]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onSelect={handleSelect} />
        </MapContainer>
      </div>

      {address && (
        <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">
          📍 <strong>{address}</strong>
        </div>
      )}
    </div>
  );
};

export default SelectLocationMap;
