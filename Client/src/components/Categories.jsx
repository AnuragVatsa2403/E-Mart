import React from "react";
import { NavLink } from "react-router-dom";

import {
  Vegetables,
  Fruits,
  Drinks,
  Grains,
  Handwash,
  Dairy,
  Personalcare,
  Toys,
} from "../assets/assets";

const categories = [
  { name: "Vegetables", icon: "🥬", img: Vegetables, color: "from-green-100 to-emerald-100" },
  { name: "Fruits", icon: "🍎", img: Fruits, color: "from-red-100 to-pink-100" },
  { name: "Drinks", icon: "🧃", img: Drinks, color: "from-blue-100 to-cyan-100" },
  { name: "Grains", icon: "🌾", img: Grains, color: "from-amber-100 to-yellow-100" },
  { name: "Handwash", icon: "🧼", img: Handwash, color: "from-purple-100 to-indigo-100" },
  { name: "Dairy", icon: "🥛", img: Dairy, color: "from-slate-100 to-gray-100" },
  { name: "Toys", icon: "🧩", img: Toys, color: "from-orange-100 to-rose-100" },
  { name: "Personalcare", icon: "💅", img: Personalcare, color: "from-pink-100 to-rose-100" },
];

export default function Categories() {
  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
            <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Shop by Category
            </span>
          </h2>
          <p className="text-gray-600 text-xs">Explore our wide range of products</p>
        </div>

        {/* Scrollable Grid */}
        <div className="overflow-y-auto h-80 pr-2 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {categories.map((cat, index) => (
              <NavLink
                to={`/category/${cat.name.toLowerCase()}`}
                key={index}
                className="group"
              >
                <div
                  className={`relative h-20 sm:h-24 w-full bg-gradient-to-br ${cat.color} 
                  rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer 
                  overflow-hidden transition-all duration-300 hover:shadow-lg 
                  hover:-translate-y-0.5 border border-white hover:border-yellow-300`}
                >
                  {/* Glow background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-yellow-400 to-amber-400 transition-opacity duration-300"></div>

                  {/* Icon or Image */}
                  <div className="relative z-10 text-center">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-10 h-10 mb-1 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 
                      group-hover:text-transparent group-hover:bg-gradient-to-r 
                      group-hover:from-yellow-600 group-hover:to-amber-600 
                      group-hover:bg-clip-text transition-all duration-300">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br 
                    from-white/50 via-transparent to-transparent opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 text-center">
          <NavLink
            to="/products"
            className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-500 
            via-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm rounded-full 
            hover:shadow-lg hover:shadow-yellow-400/50 hover:scale-105 transition-all duration-300 
            border-2 border-transparent hover:border-yellow-300"
          >
            View All Products ✨
          </NavLink>
        </div>
      </div>

      {/* Scrollbar styling */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgb(254, 243, 199);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(250, 204, 21);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(245, 158, 11);
        }
      `}</style>
    </section>
  );
}
