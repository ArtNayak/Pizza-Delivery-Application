"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Pizza, CreditCard, Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const { data: user, loading: userLoading } = useUser();
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !user && !userLoading) {
      window.location.href = "/account/signin";
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(savedCart);
    }
  }, []);

  const getTotalPrice = () => {
    return cart
      .reduce((sum, item) => sum + parseFloat(item.price), 0)
      .toFixed(2);
  };

  const handleRemoveItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setProcessing(true);

    try {
      // For demo purposes, we'll create a test payment ID
      // In production, you would integrate with Razorpay here
      const paymentId = `test_${Date.now()}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          totalPrice: getTotalPrice(),
          paymentId,
        }),
      });

      if (res.ok) {
        localStorage.removeItem("cart");
        window.location.href = "/orders?success=true";
      } else {
        const error = await res.json();
        alert(error.error || "Failed to place order");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 flex items-center justify-center">
        <div className="font-inter text-lg text-[#6B6B6B] dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 font-inter">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-[#E8E8E8] dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center">
            <Pizza className="w-8 h-8 text-[#E63946]" />
            <h1 className="ml-2 font-playfair font-semibold text-2xl text-black dark:text-white">
              PizzaFlow
            </h1>
          </a>
          <a
            href="/build"
            className="font-inter text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Build More
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-playfair font-medium text-3xl md:text-4xl text-black dark:text-white mb-8">
          Checkout
        </h2>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-12 text-center">
            <Pizza className="w-16 h-16 text-[#E8E8E8] dark:text-gray-700 mx-auto mb-4" />
            <p className="font-inter text-[#6B6B6B] dark:text-gray-400 mb-4">
              Your cart is empty
            </p>
            <a
              href="/build"
              className="inline-block bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
            >
              Build a Pizza
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 mb-8">
              <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-6">
                Your Order
              </h3>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start pb-4 border-b border-[#E8E8E8] dark:border-gray-700 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-inter font-semibold text-sm text-black dark:text-white mb-1">
                        Custom Pizza #{index + 1}
                      </p>
                      <p className="font-inter text-xs text-[#6B6B6B] dark:text-gray-400">
                        {item.veggieIds?.length || 0} veggies •{" "}
                        {item.meatIds?.length || 0} meats
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-inter font-semibold text-sm text-black dark:text-white">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-[#E63946] hover:text-[#d32f3c] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#E8E8E8] dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-inter font-semibold text-xl text-black dark:text-white">
                    Total
                  </span>
                  <span className="font-playfair font-semibold text-2xl text-black dark:text-white">
                    ${getTotalPrice()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 mb-8">
              <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-4">
                Payment Method
              </h3>
              <div className="bg-[#FFF9E6] dark:bg-yellow-900/20 border border-[#FFD700] dark:border-yellow-700 p-4 mb-4">
                <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-300">
                  <strong>Test Mode:</strong> This is a demo checkout. In
                  production, you would integrate with Razorpay for secure
                  payments.
                </p>
              </div>
              <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
                Click "Place Order" to simulate a successful payment and create
                your order.
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing || cart.length === 0}
              className="w-full flex items-center justify-center bg-[#E63946] text-white font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-[#d32f3c] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {processing ? "Processing..." : "Place Order"}
            </button>
          </>
        )}
      </div>

      <style jsx global>{`
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>
    </div>
  );
}
