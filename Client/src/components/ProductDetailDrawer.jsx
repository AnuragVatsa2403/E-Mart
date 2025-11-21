// src/components/ProductDetailDrawer.jsx
import React from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../Context/AppContext";

function getImgUrl(path) {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api")
    .replace(/\/api\/?$/, "");

  return `${base}${path}`;
}

const StockPill = ({ inStock }) => (
  <span
    className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border
      ${inStock ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-300"}`}
  >
    {inStock ? "In Stock" : "Out of Stock"}
  </span>
);

const ProductDetailDrawer = ({ product, onClose }) => {
  const { addToCart, cart } = useAppContext();

  const cartItem = cart.find((i) => i.productId?._id === product._id);

  const discountPercent = product.price
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <>
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-[99998]"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl 
                   z-[99999] overflow-y-auto border-l border-yellow-100 rounded-l-2xl"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-yellow-100 p-5 sticky top-0 bg-white z-10">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h2>
            <div className="mt-1">
              <StockPill inStock={!!product.inStock} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-yellow-50 text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* IMAGE BOX */}
          <div className="relative flex items-center justify-center p-8 rounded-2xl 
                          bg-gradient-to-br from-yellow-50 via-white to-orange-50 
                          border border-yellow-100 shadow-sm">
            <img
              src={getImgUrl(product.images?.[0])}
              alt={product.name}
              className="w-48 h-48 object-contain drop-shadow-md transition-transform hover:scale-105"
            />

            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 
                               text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* PRICE BLOCK */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 
                         border border-yellow-100 shadow-inner space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-yellow-600">
                ₹{product.offerPrice}
              </span>

              {product.price > product.offerPrice && (
                <span className="text-gray-400 line-through text-sm font-medium">
                  ₹{product.price}
                </span>
              )}
            </div>

            {product.price > product.offerPrice && (
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  Save {discountPercent}%
                </span>
                <span className="text-xs text-green-700 font-medium">
                  You save ₹{product.price - product.offerPrice}
                </span>
              </div>
            )}
          </div>

          {/* OUT OF STOCK MESSAGE */}
          {!product.inStock && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-semibold text-red-700">
                Out of Stock
              </p>
              <p className="text-xs text-red-600 mt-1">
                This product cannot be added to the cart.
              </p>
            </div>
          )}

          {/* ADD TO CART BUTTON */}
          <motion.button
            whileHover={product.inStock ? { scale: 1.02 } : {}}
            whileTap={product.inStock ? { scale: 0.97 } : {}}
            onClick={() => {
              if (!product.inStock) return;
              addToCart(product);
              onClose();
            }}
            className={`w-full py-4 rounded-xl text-base font-semibold shadow-md transition-all 
              ${product.inStock
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-600 cursor-not-allowed"
              }`}
          >
            {product.inStock ? (cartItem ? "Add More" : "Add to Cart") : "Out of Stock"}
          </motion.button>

          {/* FOOTER TEXT */}
          <div className="text-center text-xs text-gray-600 pt-2 pb-6 border-t border-yellow-100">
            ✓ Free delivery above ₹500 <br />
            ✓ Secure checkout <br />
            ✓ Easy returns
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductDetailDrawer;
