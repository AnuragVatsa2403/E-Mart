// src/components/ProductCard.jsx
import React, { useState } from "react";
import { useAppContext } from "../Context/AppContext";
import ProductDetailDrawer from "./ProductDetailDrawer";

function getImgUrl(path) {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api")
    .replace(/\/api\/?$/, "");

  return `${base}${path}`;
}

const StockPill = ({ inStock }) => (
  <span
    className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm
      ${
        inStock
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-gray-200 text-gray-600 border border-gray-300"
      }
    `}
  >
    {inStock ? "In Stock" : "Out of Stock"}
  </span>
);

const ProductCard = ({ product }) => {
  const { addToCart, updateCartQuantity, removeFromCart, cart } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);

  const cartItem = cart.find((item) => item.productId?._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const discountPercent = product.price
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <>
      <div
        className="
          rounded-xl bg-white border border-yellow-100 shadow-sm 
          hover:shadow-lg hover:border-yellow-300 
          transition-all duration-300 p-3 cursor-pointer
        "
      >
        {/* IMAGE */}
        <div
          className="
            h-40 w-full rounded-lg overflow-hidden 
            bg-gradient-to-br from-yellow-50 to-orange-50
            flex items-center justify-center
            hover:shadow-inner
            transition-all
          "
          onClick={() => setShowDetails(true)}
        >
          <img
            src={getImgUrl(product.images?.[0])}
            alt={product.name}
            className="
              h-full w-full object-contain p-2 
              transition-transform duration-300 group-hover:scale-110
            "
          />
        </div>

        {/* DISCOUNT BADGE */}
        {discountPercent > 0 && (
          <span
            className="
              absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 
              text-white text-xs font-bold px-2 py-1 rounded-full shadow
            "
          >
            -{discountPercent}%
          </span>
        )}

        {/* CONTENT */}
        <div className="mt-3 text-gray-800">
          <p
            className="
              font-semibold text-sm line-clamp-2 
              hover:text-yellow-600 transition
            "
            onClick={() => setShowDetails(true)}
            title={product.name}
          >
            {product.name}
          </p>

          <p className="text-xs text-gray-500 mt-1">{product.category}</p>

          <div className="mt-2">
            <StockPill inStock={!!product.inStock} />
          </div>

          {/* PRICE */}
          <div className="mt-3 border-t border-yellow-100 pt-2">
            <p className="text-yellow-600 font-bold text-lg">
              ₹{product.offerPrice}

              {product.price > product.offerPrice && (
                <>
                  <span className="text-gray-400 line-through text-sm ml-2">
                    ₹{product.price}
                  </span>
                  <span className="text-green-600 text-sm ml-2">
                    Save ₹{product.price - product.offerPrice}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* ADD TO CART / COUNTER */}
          <div className="mt-3">
            {product.inStock ? (
              !cartItem ? (
                <button
                  onClick={() => addToCart(product)}
                  className="
                    w-full py-2 rounded-lg text-white font-semibold text-sm 
                    bg-gradient-to-r from-yellow-400 to-orange-400 
                    hover:from-yellow-500 hover:to-orange-500 
                    shadow-md hover:shadow-lg transition-all
                  "
                >
                  Add to Cart
                </button>
              ) : (
                <div
                  className="
                    flex items-center justify-between bg-yellow-50 
                    border border-yellow-200 rounded-lg p-1
                  "
                >
                  <button
                    onClick={() =>
                      quantity > 1
                        ? updateCartQuantity(product._id, -1)
                        : removeFromCart(cartItem._id)
                    }
                    className="
                      px-3 py-1 rounded-lg font-bold text-gray-700 
                      hover:bg-yellow-100 transition
                    "
                  >
                    −
                  </button>

                  <span className="text-sm font-semibold text-gray-800">{quantity}</span>

                  <button
                    onClick={() => updateCartQuantity(product._id, +1)}
                    className="
                      px-3 py-1 rounded-lg font-bold text-gray-700 
                      hover:bg-yellow-100 transition
                    "
                  >
                    +
                  </button>
                </div>
              )
            ) : (
              <button
                disabled
                className="
                  w-full py-2 bg-gray-300 text-gray-600 rounded-lg 
                  font-semibold text-sm cursor-not-allowed opacity-70
                "
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {showDetails && (
        <ProductDetailDrawer product={product} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
};

export default ProductCard;
