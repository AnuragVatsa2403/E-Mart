import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { profileicon } from "../assets/assets";
import { useAppContext } from "../Context/AppContext";
import { Search, ShoppingCart } from "lucide-react";

const Navbar = () => {
  const { user, logout, searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-[1000] bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-yellow-400 rounded-xl transform group-hover:scale-110 transition duration-300 shadow-md shadow-yellow-200"></div>
            <div className="absolute inset-1 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-yellow-600">E</span>
            </div>
          </div>
          <span className="text-xl font-bold text-yellow-500">
            E-Mart
          </span>
        </Link>

        {/* SEARCH BAR (Only user role) */}
        {role !== "shopkeeper" && (
          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-md mx-8"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-4 pr-12 rounded-lg bg-white border border-yellow-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-600 transition"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        )}

        {/* NAV LINKS + PROFILE */}
        <div className="flex items-center gap-8 text-gray-700 font-medium">

          {/* Navigation Links */}
          {role !== "shopkeeper" ? (
            <>
              <Link to="/" className="hover:text-yellow-600 transition">
                Home
              </Link>
              <Link to="/products" className="hover:text-yellow-600 transition">
                Products
              </Link>

              <Link
                to="/cart"
                className="hover:text-yellow-600 transition flex items-center gap-1"
              >
                <ShoppingCart size={18} /> Cart
              </Link>
            </>
          ) : (
            <Link
              to="/shopkeeper"
              className="hover:text-yellow-600 transition"
            >
              Dashboard
            </Link>
          )}

          {/* PROFILE DROPDOWN / LOGIN */}
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 
                         hover:from-yellow-600 hover:to-amber-600 text-white 
                         rounded-lg shadow-md shadow-yellow-200 
                         hover:shadow-yellow-300 transition"
            >
              Login
            </button>
          ) : (
            <div className="relative flex items-center gap-3" ref={dropdownRef}>
              <span className="text-gray-700 font-medium hidden sm:block">
                {user.username}
              </span>

              <img
                src={profileicon}
                alt="Profile"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-yellow-300 cursor-pointer hover:border-yellow-500 transition"
              />

              {/* DROPDOWN MENU */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-14 w-48 bg-white rounded-lg shadow-lg 
                             border border-yellow-100 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-4 py-3 border-b text-sm bg-yellow-50 border-yellow-100">
                    <p className="font-semibold text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-600">{role}</p>
                  </div>

                  {/* USER OPTIONS */}
                  {role === "user" && (
                    <>
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-yellow-50 hover:text-yellow-600"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/add-delivery-address"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-yellow-50 hover:text-yellow-600"
                      >
                        Delivery Addresses
                      </Link>
                    </>
                  )}

                  {/* SHOPKEEPER OPTIONS */}
                  {role === "shopkeeper" && (
                    <Link
                      to="/shopkeeper/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-yellow-50 hover:text-yellow-600"
                    >
                      Shop Orders
                    </Link>
                  )}

                  {/* LOGOUT */}
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left text-red-600 border-t border-yellow-100 px-4 py-2.5 hover:bg-red-50 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
