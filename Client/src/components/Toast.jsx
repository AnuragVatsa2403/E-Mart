import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[999999] animate-slideIn">
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-3
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
      >
        {type === "success" ? "✅" : "⚠️"} {message}
      </div>
    </div>
  );
}
