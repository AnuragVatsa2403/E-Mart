import React from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import ProductCard from "../components/ProductCard";
import { useEffect,useState } from "react";
import { API } from "../lib/apiConfig";

const CategoryPage = () => {
  const [products, setProducts] = useState([]);
  const { categoryName } = useParams();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await API.get(`/products/category/${categoryName}`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading category products:", err);
      }
    };
    fetchCategoryProducts();
  }, [categoryName]);

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 mt-10">
      <h2 className="text-2xl font-bold mb-6 capitalize">{categoryName}</h2>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No products found for this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;