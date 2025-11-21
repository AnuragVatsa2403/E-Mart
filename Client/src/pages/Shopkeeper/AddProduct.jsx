import React, { useState } from "react";
import { uploadarea } from "../../assets/assets";
import { useAppContext } from "../../Context/AppContext";
import { API } from "../../lib/apiConfig";

const AddProduct = () => {
  const { categories, setShopkeeperProducts } = useAppContext();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (file, index) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }

    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!images.length) {
      return alert("Please upload at least 1 image.");
    }

    if (!category) {
      return alert("Please select a category.");
    }

    if (Number(offerPrice) >= Number(price)) {
      return alert("Offer price must be less than actual price.");
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);

    images.forEach((file) => file && formData.append("images", file));

    try {
      setLoading(true);

      const res = await API.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Product added successfully!");

      setShopkeeperProducts((prev) => [res.data.product, ...prev]);

      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setOfferPrice("");
      setImages([]);
    } catch (err) {
      console.error("❌ Add Product Error:", err);
      alert(err.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Add New Product
      </h1>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white shadow rounded-xl p-6 space-y-6 max-w-2xl"
      >
        {/* IMAGE UPLOAD */}
        <div>
          <p className="font-semibold mb-2">Product Images (max 5)</p>
          <div className="flex flex-wrap gap-4">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <label key={i} htmlFor={`img-${i}`} className="cursor-pointer">
                  <input
                    type="file"
                    id={`img-${i}`}
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], i)}
                  />
                  <img
                    src={
                      images[i]
                        ? URL.createObjectURL(images[i])
                        : uploadarea
                    }
                    className="w-24 h-24 object-cover border rounded-lg shadow-sm"
                  />
                </label>
              ))}
          </div>
        </div>

        {/* NAME */}
        <div>
          <label className="font-medium">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 mt-1 rounded"
            placeholder="Enter product name"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-medium">Product Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border p-2 mt-1 rounded"
            placeholder="Enter product description"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border p-2 mt-1 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRICE */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-medium">Actual Price</label>
            <input
              type="number"
              value={price}
              required
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2 mt-1 rounded"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="font-medium">Offer Price</label>
            <input
              type="number"
              value={offerPrice}
              required
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full border p-2 mt-1 rounded"
              placeholder="0"
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-semibold transition ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
