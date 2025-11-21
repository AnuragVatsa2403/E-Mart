// src/pages/Shopkeeper/ShopkeeperOrderDetails.jsx
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { API } from "../../lib/apiConfig";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ShopkeeperOrderDetails({ order, onStatusUpdate  }) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  // ---- LOCATIONS ----
  const userLocation = order.user?.location?.coordinates
    ? [order.user.location.coordinates[1], order.user.location.coordinates[0]]
    : null;

  const shopLocation = order.shopkeeper?.location?.coordinates
    ? [order.shopkeeper.location.coordinates[1], order.shopkeeper.location.coordinates[0]]
    : null;

  // ---- MAP ----
  useEffect(() => {
    if (!userLocation || !shopLocation) return;

    const map = L.map("orderMap").setView(shopLocation, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker(shopLocation).addTo(map).bindPopup("Shop Location");
    L.marker(userLocation).addTo(map).bindPopup("Customer Location");

    L.Routing.control({
      waypoints: [L.latLng(...shopLocation), L.latLng(...userLocation)],
      routeWhileDragging: false,
    }).addTo(map);

    return () => map.remove(); // cleanup map
  }, [order]);

  // ---- UPDATE ORDER STATUS ----
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await API.put(`/orders/${order._id}`, { status: newStatus });

      const updatedOrder = res.data.order;

      setStatus(updatedOrder.status);

      // notify parent (Orders.jsx)
      if (onStatusUpdate) onStatusUpdate(updatedOrder);

      alert("Order Updated Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };


  if (!order) return <p>Select an order</p>;

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">Order #{order._id.slice(-6)}</h2>

      <p><strong>Customer:</strong> {order.user.username}</p>
      <p><strong>Address:</strong> {order.address.address}</p>
      <p><strong>Total:</strong> ₹{order.total}</p>
      <p className="mt-1"><strong>Status:</strong> 
        <span className="ml-2 font-bold text-green-700">{status}</span>
      </p>

      {/* Status Buttons */}
      <div className="flex gap-2 mt-4">
        {["Confirmed", "Out for Delivery", "Delivered", "Cancelled"].map((s) => (
          <button
            key={s}
            disabled={updating || status === s}
            onClick={() => updateStatus(s)}
            className={`px-3 py-1 rounded text-white 
              ${status === s ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}
            `}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <h3 className="font-semibold mb-2">Delivery Route:</h3>
        <div id="orderMap" style={{ height: "400px", width: "100%" }}></div>
      </div>
    </div>
  );
}
