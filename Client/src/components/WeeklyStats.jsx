import { useEffect, useState } from "react";
import { API } from "../lib/apiConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function WeeklyStats() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await API.get("/orders/my-shop-orders-weekly");

        // Format: convert date to shorter string
        const formatted = res.data.map((d) => ({
          day: d.date.slice(5), // show like "01-23"
          orders: d.orders,
          revenue: d.revenue,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error loading weekly stats:", err);
      }
    };

    fetchWeekly();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow border">
      <h2 className="text-lg font-semibold mb-4">Weekly Revenue & Orders</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Revenue Line */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#16a34a"
            strokeWidth={3}
            name="Revenue (₹)"
          />

          {/* Orders Line */}
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#2563eb"
            strokeWidth={3}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
