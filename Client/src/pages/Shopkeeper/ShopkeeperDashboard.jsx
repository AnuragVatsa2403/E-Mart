import { useEffect, useState } from "react";
import { API } from "../../lib/apiConfig";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ShopkeeperDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsRes, ordersRes, weeklyRes] = await Promise.all([
          API.get("/products/my"),
          API.get("/orders/my-shop-orders"),
          API.get("/orders/my-shop-orders-weekly"),
        ]);

        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];
        const weeklyData = weeklyRes.data || [];

        setWeekly(weeklyData);

        // ---- BASIC STATS ----
        const today = new Date().toDateString();
        let todayRevenue = 0;

        orders.forEach((order) => {
          if (order.status === "Delivered") {
            const deliveredDate = new Date(order.updatedAt).toDateString();
            if (deliveredDate === today) todayRevenue += order.total;
          }
        });

        setStats({
          totalProducts:productsRes.data.total ?? products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "Pending").length,
          deliveredOrders: orders.filter((o) => o.status === "Delivered").length,
          todayRevenue,
        });

        // ---- TOP PRODUCTS ----
        const productSales = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            if (!productSales[item.name]) {
              productSales[item.name] = 0;
            }
            productSales[item.name] += item.quantity;
          });
        });

        const top = Object.entries(productSales)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        setTopProducts(top);

        // ---- RECENT ORDERS ----
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading || !stats) return <p className="p-6">Loading dashboard...</p>;

  // ---- WEEKLY CHART DATA ----
  const chartData = {
    labels: weekly.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: "Orders",
        data: weekly.map((d) => d.orders),
        fill: false,
        borderColor: "#22c55e",
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: "Revenue (₹)",
        data: weekly.map((d) => d.revenue),
        borderColor: "#2563eb",
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-green-700">Shopkeeper Dashboard</h1>

      {/* ---- STAT CARDS ---- */}
      <div className="grid md:grid-cols-4 gap-6">
        <DashboardCard title="Total Products" value={stats.totalProducts} />
        <DashboardCard title="Total Orders" value={stats.totalOrders} />
        <DashboardCard title="Pending Orders" value={stats.pendingOrders} />
        <DashboardCard title="Delivered Orders" value={stats.deliveredOrders} />
      </div>

      {/* ---- WEEKLY GRAPH ---- */}
      <div className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Weekly Sales</h3>
        <Line data={chartData} />
      </div>

      {/* ---- TODAY'S REVENUE ---- */}
      <div className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition">
        <h3 className="text-xl font-semibold">Today's Revenue</h3>
        <p className="text-4xl font-bold text-green-600 mt-2">
          ₹{stats.todayRevenue}
        </p>
      </div>

      {/* ---- TOP PRODUCTS ---- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Top Selling Products</h2>

        {topProducts.length === 0 ? (
          <p className="text-gray-500">No sales yet.</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow border">
            <ul className="space-y-3">
              {topProducts.map((item, i) => (
                <li key={i} className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-green-600 font-bold">{item.qty} sold</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---- RECENT ORDERS ---- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No recent orders.</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b">
                    <td className="py-2">{o._id.slice(-6)}</td>
                    <td>{o.user.username}</td>
                    <td className="text-green-600 font-semibold">{o.status}</td>
                    <td>₹{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---- QUICK ACTIONS ---- */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <ActionCard title="Add Product" link="/shopkeeper/add-product" />
        <ActionCard title="Product List" link="/shopkeeper/productlist" />
        <ActionCard title="Orders" link="/shopkeeper/orders" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-6 border rounded-xl shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className="text-3xl font-bold text-green-600 mt-2">{value}</p>
    </div>
  );
}

function ActionCard({ title, link }) {
  return (
    <Link
      to={link}
      className="block bg-green-500 text-white p-5 rounded-xl text-center font-semibold hover:bg-green-600 shadow"
    >
      {title}
    </Link>
  );
}
