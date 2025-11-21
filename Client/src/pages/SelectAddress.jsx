// /client/src/pages/SelectAddress.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/apiConfig";

const SelectAddress = () => {
  const { user } = useAppContext();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserFresh = async () => {
      try {
        const res = await API.get("/auth/me");
        setAddresses(res.data.user.addresses || []);
      } catch {}
    };
    fetchUserFresh();
  }, []);

  const handleAddAddress = () => navigate("/add-delivery-address");

  const handleSelect = (addr) => {
    localStorage.setItem("selectedAddress", JSON.stringify(addr));
    navigate("/payment");
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Select Delivery Address</h2>

      <button onClick={handleAddAddress} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
        Add New Address
      </button>

      {addresses.length === 0 ? (
        <p>No saved addresses. Please add one.</p>
      ) : (
        <div className="grid gap-3">
          {addresses.map((a, idx) => (
            <div key={idx} className="p-4 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm">{a.address}, {a.city} - {a.zip}</div>
                  <div className="text-sm">{a.phone}</div>
                </div>
                <button
                  onClick={() => handleSelect(a)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Deliver Here
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectAddress;
