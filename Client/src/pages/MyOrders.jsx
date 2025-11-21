import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { API } from "../lib/apiConfig";

const MyOrders = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const boxIcon = "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/boxIcon.svg";

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      if (!token) {
        console.warn("No token found");
        setOrders([]);
        return;
      }
      
      // Use API instance from apiConfig which handles auth headers automatically
      const res = await API.get("/orders/my");
      
      const data = res.data;
      setOrders(Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        console.warn("Unauthorized - please login again");
      } else if (err.response?.status === 404) {
        console.error("Route not found - server may need restart");
      }
      setOrders([]);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Please login to view your orders.</h2>
      </div>
    );
  }

  return (
    <div className="md:p-10 p-4 space-y-4">
      <h2 className="text-lg font-medium">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        orders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-5 p-5 max-w-4xl rounded-md border border-gray-300 text-gray-800"
          >
            <div className="flex gap-5">
              <img
                className="w-12 h-12 object-cover opacity-60"
                src={boxIcon}
                alt="boxIcon"
              />
              <div>
                {order.items.map((item, idx) => (
                  <p key={idx} className="font-medium">
                    {item.product?.name || "Product"}
                    <span
                      className={`text-indigo-500 ${
                        item.quantity < 2 && "hidden"
                      }`}
                    >
                      {" "}
                      x {item.quantity}
                    </span>
                  </p>
                ))}
              </div>
            </div>

            <div className="text-sm">
              <p className="font-medium mb-1">
                {order.address?.name || "N/A"}
              </p>
              <p>
                {order.address?.address}, {order.address?.city},{" "}
                {order.address?.state}, {order.address?.zip}
              </p>
            </div>

            <p className="font-medium text-base my-auto text-black/70">
              Rs.{order.total}
            </p>

            <div className="flex flex-col text-sm">
              <p>Method: {order.paymentMethod}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Status: {order.status}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
