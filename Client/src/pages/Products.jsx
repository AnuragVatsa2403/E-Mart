// src/pages/Products.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const { searchQuery } = useAppContext();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      if (!res.ok) throw new Error("Failed to fetch products");
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Products</h2>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
