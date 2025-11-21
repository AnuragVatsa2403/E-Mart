// /client/src/pages/Payment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadRazorpay } from "../lib/loadRazorpay";
import { API } from "../lib/apiConfig";
import { useAppContext } from "../Context/AppContext";

const Payment = () => {
  const { cart } = useAppContext();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved address
  useEffect(() => {
    const saved = localStorage.getItem("selectedAddress");
    if (saved) setSelectedAddress(JSON.parse(saved));
  }, []);

  // Redirect if no address
  useEffect(() => {
    if (cart.length === 0) return;
    if (!localStorage.getItem("selectedAddress")) {
      navigate("/select-address");
    }
  }, [cart, navigate]);

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.productId?.offerPrice || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.02;
  const totalAmount = subtotal + tax;

  /* ------------------------------------------
     MAIN PAYMENT FUNCTION
  ------------------------------------------- */
  const handlePayNow = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address before paying.");
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay checkout failed to load. Check your internet or adblocker.");
        setLoading(false);
        return;
      }

      // 2️⃣ Create LOCAL order
      const savedAddr = selectedAddress;
      const userLocation = JSON.parse(localStorage.getItem("userLocation") || "null");

      const shopkeeperId =
        cart[0]?.productId?.createdBy?._id || cart[0]?.productId?.createdBy;

      const orderPayload = {
        shopkeeperId,
        items: cart.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        totalAmount: Number(totalAmount.toFixed(2)),
        address: savedAddr,
        paymentMethod: "RAZORPAY",
        deliveryLocation:
          userLocation?.latitude
            ? { lat: userLocation.latitude, lng: userLocation.longitude }
            : undefined,
      };

      const orderRes = await API.post("/orders", orderPayload);
      const orderId = orderRes?.data?.order?._id;
      if (!orderId) {
        throw new Error("Failed to create local order");
      }

      // 3️⃣ Create Razorpay order
      const paymentRes = await API.post("/payments/create-order", {
        orderId,
        amount: totalAmount,
      });

      const razorpayOrder = paymentRes?.data?.razorpayOrder;
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error("Failed to create razorpay order");
      }

      /* 4️⃣ OPEN RAZORPAY POPUP WITH VERIFICATION */
      console.log("ORDER ID BEFORE PAYMENT:", orderId, "RAZORPAY ORDER:", razorpayOrder.id);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "E-Mart Payment",
        description: "Secure payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: savedAddr.name,
          email: savedAddr.email || savedAddr?.userEmail || "no-reply@example.com",
          contact: savedAddr.phone,
        },
        theme: {
          color: "#22c55e",
        },

        // Handler after payment succeeds in Razorpay UI
        handler: async function (response) {
          console.log("RAZORPAY RESPONSE:", response);

          // basic sanity check
          if (
            !response?.razorpay_payment_id ||
            !response?.razorpay_order_id ||
            !response?.razorpay_signature
          ) {
            console.error("Incomplete razorpay response:", response);
            alert("Payment response incomplete. Check browser console.");
            return;
          }

          try {
            // Call backend to verify payment & mark order paid
            const verifyRes = await API.post("/payments/verify", {
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            console.log("VERIFY RESPONSE:", verifyRes.data);
            alert("Payment Verified ✔");
            navigate("/my-orders");
          } catch (err) {
            console.error("Payment verification failed:", err.response?.data || err);
            alert("Payment verification failed ❌ Check server logs/console.");
          }
        },

        // Optional: handle modal dismiss / fail events
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal closed by user");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      // Listen for payment failures (client-side)
      paymentObject.on && paymentObject.on("payment.failed", function (resp) {
        console.error("Razorpay payment failed:", resp);
        alert("Payment failed. See console for details.");
      });

      // finally open
      paymentObject.open();
    } catch (err) {
      console.error("Payment flow error:", err.response?.data || err);
      alert(err.message || "Payment failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>

      <div className="mb-4">
        <h3 className="font-semibold">Deliver To</h3>
        <div>{selectedAddress?.name}</div>
        <div>{selectedAddress?.address}, {selectedAddress?.city}</div>
        <div>{selectedAddress?.phone}</div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">Order Summary</h3>
        <div>Subtotal: {subtotal.toFixed(2)}</div>
        <div>Tax (2%): {tax.toFixed(2)}</div>
        <div className="font-bold">Total: ₹{totalAmount.toFixed(2)}</div>
      </div>

      <button
        onClick={handlePayNow}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

export default Payment;
