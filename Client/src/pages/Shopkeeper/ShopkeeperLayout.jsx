import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { add_icon, order_icon, productlist_icon } from "../../assets/assets";
import { useAppContext } from "../../Context/AppContext";

const ShopkeeperLayout = () => {
  const { setIsShopkeeper, setUser, user } = useAppContext();
  const navigate = useNavigate();

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setIsShopkeeper(false);
    navigate("/login");
    alert("Logged out successfully!");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-xl flex flex-col">

        {/* Updated Profile Area — FULL CLICKABLE */}
        <Link
          to="/shopkeeper"
          className="p-5 border-b bg-gradient-to-r from-green-600 to-green-500 
                     text-white flex items-center gap-3 cursor-pointer
                     hover:brightness-110 transition"
        >
          <img
            src="https://www.shutterstock.com/image-vector/user-icon-trendy-flat-style-600nw-418179856.jpg"
            alt="profile"
            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
          />

          <div>
            <p className="text-lg font-semibold">
              {user?.username || "Shopkeeper"}
            </p>
            <p className="text-sm opacity-90">Go to Dashboard ➜</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="p-5 flex-1 space-y-3">
          <SidebarLink to="/shopkeeper/add-product" icon={add_icon} label="Add Product" />
          <SidebarLink to="/shopkeeper/productlist" icon={productlist_icon} label="Product List" />
          <SidebarLink to="/shopkeeper/orders" icon={order_icon} label="Orders" />
          <SidebarLink 
            to="/shopkeeper/settings" 
            icon="https://cdn-icons-png.flaticon.com/512/2099/2099058.png"
            label="Settings" 
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full py-2 text-center bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold shadow"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

// -----------------------
// Reusable sidebar link
// -----------------------
const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 p-3 rounded-lg transition
        ${isActive
          ? "bg-green-100 text-green-700 font-semibold shadow-sm"
          : "hover:bg-gray-100 text-gray-700"}
        `
      }
    >
      <img src={icon} alt={label} className="w-5 h-5 opacity-80" />
      <span>{label}</span>
    </NavLink>
  );
};

export default ShopkeeperLayout;
