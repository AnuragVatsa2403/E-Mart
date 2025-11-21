// src/pages/Shopkeeper/ProductList.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAppContext } from "../../Context/AppContext";
import { API } from "../../lib/apiConfig";

/**
 * ProductList.jsx - Updated
 *
 * - Keeps existing endpoints & logic.
 * - Adds search debounce fix, total syncing on delete/undo, image manager improvements,
 *   offerPrice <= price validation, inline toasts, and UI tweaks.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const IMG_BASE = API_BASE.replace(/\/api\/?$/, ""); // e.g. http://localhost:3000

/* --------------------- Small Toast System --------------------- */
function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3 items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded shadow-lg text-white text-sm cursor-pointer min-w-[240px] text-center
            ${t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-green-600" : "bg-gray-800"}`}
          onClick={() => remove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}


/* --------------------- Main Component --------------------- */
export default function ProductList() {
  const { shopkeeperProducts, setShopkeeperProducts } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [deletedProduct, setDeletedProduct] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  const [detailsProduct, setDetailsProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const undoTimeout = useRef(null);
  const searchTimeout = useRef(null);

  /* Toast state */
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "info", ms = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => removeToast(id), ms);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Fetch products (paginated, search) ---------------- */
  const fetchProducts = useCallback(
    async (p = 1, s = "") => {
      try {
        setLoading(true);
        const res = await API.get("/products/my", { params: { page: p, limit, search: s } });
        const json = res.data;
        // server returns { success, products, total, page, limit }
        setShopkeeperProducts(json.products || []);
        setTotal(json.total || (json.products ? json.products.length : 0));
        setPage(json.page || p);
      } catch (err) {
        console.error("Error fetching shopkeeper products:", err);
        pushToast("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    },
    [limit, setShopkeeperProducts]
  );

  useEffect(() => {
    fetchProducts(1, "");
    return () => clearTimeout(undoTimeout.current);
    // eslint-disable-next-line
  }, []);

  /* ----- Search debounce (resets to page 1) ----- */
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(1, search);
    }, 450);
    return () => clearTimeout(searchTimeout.current);
  }, [search, fetchProducts]);

  /* ---------------- Delete with undo (optimistic) ---------------- */
  const handleDelete = (id) => {
    const product = shopkeeperProducts.find((p) => p._id === id);
    if (!product) return;

    // Optimistic UI remove
    setShopkeeperProducts((prev) => prev.filter((p) => p._id !== id));
    setDeletedProduct(product);
    setShowUndo(true);

    // schedule permanent delete
    undoTimeout.current = setTimeout(async () => {
      try {
        await API.delete(`/products/${id}`);
        // decrement total on permanent delete
        setTotal((t) => Math.max(0, t - 1));
        pushToast("Product deleted", "success");
      } catch (err) {
        console.error("Delete failed:", err);
        pushToast(err?.response?.data?.message || "Failed to delete product", "error");
        // restore in case of failure
        setShopkeeperProducts((prev) => [product, ...prev]);
      } finally {
        setDeletedProduct(null);
        setShowUndo(false);
      }
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(undoTimeout.current);
    if (deletedProduct) {
      setShopkeeperProducts((p) => [deletedProduct, ...p]);
      setTotal((t) => t + 1); // restore total immediately
      setDeletedProduct(null);
      setShowUndo(false);
      pushToast("Delete undone", "success");
    }
  };

  /* ---------------- Toggle stock (optimistic) ---------------- */
  const handleToggleStock = async (product) => {
    try {
      // optimistic UI flip for snappy feel
      setShopkeeperProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: !p.inStock } : p))
      );

      // send request and use server response to update local product (authoritative)
      const res = await API.patch(`/products/${product._id}/stock`, {
        inStock: !product.inStock,
      });

      if (res?.data?.success) {
        const updated = res.data.product;
        setShopkeeperProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        pushToast(res.data.message || "Stock updated", "success");
      } else {
        // server responded but not success — revert and show message
        setShopkeeperProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, inStock: product.inStock } : p))
        );
        const msg = (res?.data && (res.data.message || "Failed to update")) || "Failed to update";
        pushToast(msg, "error");
      }
    } catch (err) {
      console.error("Toggle stock failed:", err);

      // revert optimistic change
      setShopkeeperProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: product.inStock } : p))
      );

      // show server message if present or generic
      const serverMsg = err?.response?.data?.message || err.message || "Failed to update stock";
      pushToast(serverMsg, "error");
    }
  };


  const openDetails = (p) => setDetailsProduct(p);
  const closeDetails = () => setDetailsProduct(null);
  const openEdit = (p) => setEditProduct(p);
  const closeEdit = () => setEditProduct(null);
  const handleUpdateLocalProduct = (updated) => {
    setShopkeeperProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  if (loading) return <p className="p-6 text-gray-600">Loading products...</p>;

  return (
    <div className="p-6">
      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Your Products</h2>
        <div className="flex gap-3 items-center">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search products..."
            className="border rounded p-2"
          />
          <button
            onClick={() => fetchProducts(page, search)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {shopkeeperProducts.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="bg-white border rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shopkeeperProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={`${IMG_BASE}${product.images?.[0] || "/uploads/placeholder.png"}`}
                      alt={product.name}
                      className="w-16 h-16 rounded object-cover border"
                      style={{ minWidth: 64 }}
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description?.slice(0, 60)}</div>
                    </div>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">₹{product.offerPrice}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStock(product)}
                      className={`px-3 py-1 rounded ${
                        product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => openDetails(product)}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="p-3 flex items-center justify-between">
            <div>
              Page {page} — {Math.max(1, Math.ceil(total / limit))} (total: {total})
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  fetchProducts(prev, search);
                }}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchProducts(next, search);
                }}
                disabled={page * limit >= total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo snackbar */}
      {showUndo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded shadow-lg z-50">
          <div className="flex items-center gap-4">
            <span>🗑️ Product deleted</span>
            <button onClick={handleUndo} className="underline text-green-300">
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsProduct && <ProductDetailsModal product={detailsProduct} onClose={closeDetails} />}

      {/* Edit Modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={closeEdit}
          onSaved={(updated) => {
            handleUpdateLocalProduct(updated);
            closeEdit();
            pushToast("Product updated", "success");
          }}
          pushToast={pushToast}
        />
      )}
    </div>
  );
}

/* ------------------ Product Details Modal ------------------ */
function ProductDetailsModal({ product, onClose }) {
  const IMG_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
  return (
    <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded">
            Close
          </button>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-4">
          <div>
            <img
              src={`${IMG_BASE}${product.images?.[0] || "/uploads/placeholder.png"}`}
              alt={product.name}
              className="w-full h-72 object-cover rounded"
            />
            <div className="flex gap-2 mt-2 overflow-auto">
              {product.images?.map((img, i) => (
                <img key={i} src={`${IMG_BASE}${img}`} className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-2">{product.description}</p>
            <p className="font-bold text-2xl text-green-700">₹{product.offerPrice}</p>
            <p className="mt-2 text-sm">Category: {product.category}</p>
            <p className="mt-2 text-sm">Created: {new Date(product.createdAt).toLocaleString()}</p>
            <p className="mt-2 text-sm">Stock: {product.inStock ? "In stock" : "Out of stock"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Edit Product Modal (FULL) ------------------ */
/* ------------------ Edit Product Modal (UPDATED) ------------------ */
function EditProductModal({ product, onClose, onSaved, pushToast }) {
  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [category, setCategory] = useState(product.category || "");
  const [price, setPrice] = useState(product.price ?? "");
  const [offerPrice, setOfferPrice] = useState(product.offerPrice ?? "");
  const [inStock, setInStock] = useState(!!product.inStock);

  const [existingImages, setExistingImages] = useState([...product.images]); 
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const IMG_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api")
    .replace(/\/api\/?$/, "");

  /* ---------------- DELETE IMAGE ---------------- */
  const handleDeleteImage = (index) => {
    // also remove replace actions for this index
    setNewImages((prev) => prev.filter((n) => !(n.type === "replace" && n.index === index)));
    setExistingImages((imgs) => imgs.filter((_, i) => i !== index));
  };

  /* ---------------- REPLACE IMAGE ---------------- */
  const handleReplaceImage = (index, file) => {
    if (!file) return;
    const blobURL = URL.createObjectURL(file);

    setNewImages((prev) => [...prev, { type: "replace", index, file }]);

    setExistingImages((prev) =>
      prev.map((img, i) => (i === index ? blobURL : img))
    );
  };

  /* ---------------- ADD NEW IMAGE ---------------- */
  const handleAddNewImage = (file) => {
    if (!file) return;
    const blobURL = URL.createObjectURL(file);

    setNewImages((prev) => [...prev, { type: "add", index: -1, file }]);
    setExistingImages((prev) => [...prev, blobURL]);
  };

  /* ---------------- SAVE PRODUCT ---------------- */
  const handleSave = async () => {
    const totalImages = existingImages.length + newImages.length;

    if (totalImages === 0) {
      pushToast("You must keep at least one product image.", "error");
      return;
    }

    const parsedPrice = Number(price);
    const parsedOffer = Number(offerPrice);

    if (isNaN(parsedPrice) || isNaN(parsedOffer)) {
      pushToast("Price and Offer must be valid numbers.", "error");
      return;
    }

    if (parsedOffer > parsedPrice) {
      pushToast("Offer price must be less than the main price.", "error");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("name", name);
      form.append("description", description);
      form.append("category", category);
      form.append("price", parsedPrice);
      form.append("offerPrice", parsedOffer);
      form.append("inStock", inStock);

      // Send only server paths (not blob URLs)
      const realExisting = existingImages.filter(
        (i) => typeof i === "string" && !i.startsWith("blob")
      );
      form.append("existingImages", JSON.stringify(realExisting));

      // Add new + replaced images
      const actions = [];
      newImages.forEach((imgObj) => {
        form.append("images", imgObj.file);
        actions.push({ type: imgObj.type, index: imgObj.index });
      });

      form.append("imageActions", JSON.stringify(actions));

      const res = await API.put(`/products/${product._id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved(res.data.product);
      pushToast("Product updated successfully!", "success");
    } catch (err) {
      console.error(err);
      pushToast("Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/40 z-[99990] flex items-start justify-center p-4 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl mt-10 mb-10 shadow-xl relative z-[99991] overflow-auto">

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded">Close</button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-5">
          
          {/* TEXT INPUTS */}
          <div>
            <label className="font-medium">Name</label>
            <input className="w-full border p-2 rounded mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="font-medium">Description</label>
            <textarea rows={4} className="w-full border p-2 rounded mt-1"
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="font-medium">Category</label>
              <input className="w-full border p-2 rounded mt-1"
                value={category} onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="font-medium">Price</label>
              <input type="number" className="w-40 border p-2 rounded mt-1"
                value={price} onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="font-medium">Offer</label>
              <input type="number" className="w-40 border p-2 rounded mt-1"
                value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={inStock} onChange={() => setInStock(!inStock)} />
            In Stock
          </label>

          {/* IMAGE MANAGER */}
          <div>
            <p className="font-medium mb-2">Images</p>

            <div className="flex gap-4 flex-wrap">
              {existingImages.map((img, index) => (
                <div key={index} className="w-28 h-28 relative border rounded overflow-hidden">
                  
                  <img
                    src={typeof img === "string" && !img.startsWith("blob") ? IMG_BASE + img : img}
                    className="w-full h-full object-cover"
                  />

                  <label className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-center text-xs py-1 cursor-pointer">
                    Replace
                    <input type="file" accept="image/*" hidden
                      onChange={(e) => handleReplaceImage(index, e.target.files?.[0])}
                    />
                  </label>

                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>

                </div>
              ))}

              {/* ADD NEW IMAGE */}
              <label className="w-28 h-28 flex items-center justify-center border rounded bg-gray-100 cursor-pointer text-2xl">
                +
                <input type="file" accept="image/*" hidden
                  onChange={(e) => handleAddNewImage(e.target.files?.[0])}
                />
              </label>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              You must keep at least one image. You can delete all but cannot save until one is added.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-3">
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600"}`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
