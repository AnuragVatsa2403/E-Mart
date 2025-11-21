import { useEffect, useState, useCallback } from "react";
import { API } from "../../lib/apiConfig";
import ShopkeeperOrderDetails from "./ShopkeeperOrderDetails";
import { boxicon } from "../../assets/assets";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("/orders/my-shop-orders");
      const orderList = res.data.orders || [];

      setOrders(orderList);

      // Auto-select the first order
      if (orderList.length > 0) {
        setSelectedOrder(orderList[0]);
      }
    } catch (err) {
      console.error("❌ Error fetching shopkeeper orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  // 🟢 Auto-refresh the left list when status is updated in details panel
  const handleStatusUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
    setSelectedOrder(updatedOrder); // update selected order instantly
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading orders...</p>;
  }

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold text-green-600">Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT SIDE — ORDER LIST */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`border rounded-lg p-4 cursor-pointer transition shadow-sm ${
                  selectedOrder?._id === order._id
                    ? "bg-green-50 border-green-400"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center gap-4">
                  <img src={boxicon} className="w-12 h-12 opacity-90" />

                  <div>
                    <p className="font-semibold text-lg">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.username || "Unknown"}
                    </p>

                    <p className="text-sm text-gray-600">
                      Items: <strong>{order.items.length}</strong>
                    </p>

                    <p className="text-sm">
                      Status:{" "}
                      <span className="font-semibold text-green-700">
                        {order.status}
                      </span>
                    </p>

                    <p className="text-sm font-medium">Total: ₹{order.total}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE — ORDER DETAILS */}
          <div className="bg-white p-4 rounded-lg border shadow">
            {selectedOrder ? (
              <ShopkeeperOrderDetails
                order={selectedOrder}
                onStatusUpdate={handleStatusUpdate}
              />
            ) : (
              <p className="text-gray-500">Select an order to see details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
