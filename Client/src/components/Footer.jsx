import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-black to-black text-gray-300 overflow-hidden">
      {/* Background glow circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Newsletter Section */}
        <div className="mb-12 pb-12 border-b border-gray-800">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Stay Updated
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Subscribe to our newsletter for exclusive deals & updates
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all text-white placeholder-gray-500 text-sm"
              />
              <button
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-semibold transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/20 text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                E
              </div>
              <h1 className="text-2xl font-bold text-yellow-400">E-Mart</h1>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop marketplace for quality products at the best prices.
              Fresh groceries, essentials & more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {["Home", "Products", "Categories", "About Us", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Customer Service
            </h3>
            <ul className="space-y-2.5">
              {[
                "Track Order",
                "Returns & Refunds",
                "Shipping Info",
                "FAQs",
                "Privacy Policy",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Get In Touch
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">✉</span>{" "}
                support@emart.com
              </p>
              <p className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">📞</span> +91 98765 43210
              </p>
            </div>

            <div className="flex gap-3">
              {["F", "I", "T", "L"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-yellow-500 hover:to-amber-500 flex items-center justify-center transition-all transform hover:scale-110 text-xs font-semibold"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 E-Mart. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-400">✓</span> Secure Payments
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-400">✓</span> Free Shipping
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-400">✓</span> 24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
