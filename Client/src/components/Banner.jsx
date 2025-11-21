import React, { useState } from "react";
import { Homeimg } from "../assets/assets";
import { NavLink } from "react-router-dom";

const Banner = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-6">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Banner Wrapper */}
        <div
          className="relative w-full h-64 sm:h-72 md:h-96 lg:h-[500px] overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Image */}
          <img
            src={Homeimg}
            alt="E-Mart Banner"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20"></div>

          {/* Banner Content */}
          <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-2xl">

              {/* Headline 1 */}
              <div className="mb-4 overflow-hidden">
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight transition-transform duration-700 ${
                    isHovered ? "translate-y-0" : "translate-y-full"
                  }`}
                >
                  Discover
                </h1>
              </div>

              {/* Headline 2 */}
              <div className="mb-6 overflow-hidden">
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent leading-tight transition-transform duration-700 delay-100 ${
                    isHovered ? "translate-y-0" : "translate-y-full"
                  }`}
                >
                  Something Amazing
                </h2>
              </div>

              {/* Subheading */}
              <p
                className={`text-base sm:text-lg md:text-xl text-white/90 mb-6 max-w-xl transition-all duration-700 delay-200 ${
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Explore our exclusive collection of premium products curated just for you.
              </p>

              {/* CTA Button */}
              <NavLink
                to="/products"
                className={`inline-block px-6 sm:px-8 py-3 sm:py-4 
                  bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 
                  hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 
                  text-gray-900 font-bold rounded-full shadow-lg 
                  hover:shadow-2xl hover:shadow-yellow-400/50 transition-all 
                  duration-300 hover:scale-105 transform ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
              >
                Shop Now ✨
              </NavLink>
            </div>
          </div>

          {/* Decorative Glow Shape */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
