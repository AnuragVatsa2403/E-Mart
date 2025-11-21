// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/apiConfig";

const getImgUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
  return `${base}${path}`;
};

const UnavailableTag = () => <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">Unavailable</span>;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      if (!token) {
        setCart([]);
        return;
      }
      const res = await API.get("/cart");
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increaseQty = async (productId) => {
    try {
      await API.post("/cart/add", { productId, quantity: 1 });
      fetchCart();
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/${id}`);
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.productId?.offerPrice || 0) * item.quantity, 0);
  const tax = subtotal * 0.02;
  const total = subtotal + tax;

  // If any cart item is out of stock, block checkout
  const hasUnavailable = cart.some((item) => item.productId && item.productId.inStock === false);

  const handlePlaceOrder = async () => {
    if (!token) return navigate("/login");
    if (!cart || cart.length === 0) return alert("Cart is empty");
    if (hasUnavailable) return alert("One or more items in your cart are unavailable. Please remove them before placing the order.");

    navigate("/select-address");
  };

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-sm text-green-500">{cart.length} Items</span>
        </h1>

        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
              <div className="flex items-center md:gap-6 gap-3">
                <div className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                  <img className="max-w-full h-full object-cover" src={getImgUrl(item.productId.images?.[0])} alt={item.productId.name} />
                </div>
                <div>
                  <p className="hidden md:block font-semibold">{item.productId.name}</p>
                  {!item.productId.inStock && <UnavailableTag />}
                </div>
              </div>

              <p className="text-center">Rs{(item.productId.offerPrice * item.quantity).toFixed(2)}</p>

              <div className="flex items-center justify-center gap-2">
                <button onClick={() => removeItem(item._id)} className="ml-3 text-red-500">Remove</button>
              </div>
            </div>
          ))
        )}

        <button onClick={() => navigate("/products")} className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium">Continue Shopping</button>
      </div>

      {cart.length > 0 && (
        <div className="max-w-[360px] w-full bg-gray-100/40 p-5 border border-gray-300/70">
          <h2 className="text-xl font-medium">Order Summary</h2>
          <hr className="border-gray-300 my-5" />
          <div className="text-gray-500 mt-4 space-y-2">
            <p className="flex justify-between"><span>Subtotal</span><span>Rs{subtotal.toFixed(2)}</span></p>
            <p className="flex justify-between"><span>Tax (2%)</span><span>Rs{tax.toFixed(2)}</span></p>
            <p className="flex justify-between text-lg font-medium mt-3"><span>Total:</span><span>Rs{total.toFixed(2)}</span></p>
          </div>

          {hasUnavailable && (
            <p className="text-sm text-red-600 mt-3">One or more items are unavailable. Remove them to proceed.</p>
          )}

          <button
            onClick={handlePlaceOrder}
            className={`w-full py-3 mt-6 cursor-pointer font-medium transition ${hasUnavailable ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-700"}`}
            disabled={hasUnavailable}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
