"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Pizza, Package, Clock, Truck, CheckCircle } from "lucide-react";

export default function OrdersPage() {
  const { data: user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !user && !userLoading) {
      window.location.href = "/account/signin";
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Received":
        return <Package className="w-6 h-6" />;
      case "In the Kitchen":
        return <Clock className="w-6 h-6" />;
      case "Sent to Delivery":
        return <Truck className="w-6 h-6" />;
      case "Delivered":
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Received":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "In the Kitchen":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      case "Sent to Delivery":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (userLoading || loading) {
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
            href="/dashboard"
            className="font-inter text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showSuccess && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 dark:border-green-700 p-4 mb-8 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-800 dark:text-green-200 mr-3" />
            <p className="font-inter text-sm text-green-800 dark:text-green-200">
              Order placed successfully! You can track its status below.
            </p>
          </div>
        )}

        <h2 className="font-playfair font-medium text-3xl md:text-4xl text-black dark:text-white mb-8">
          My Orders
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-12 text-center">
            <Pizza className="w-16 h-16 text-[#E8E8E8] dark:text-gray-700 mx-auto mb-4" />
            <p className="font-inter text-[#6B6B6B] dark:text-gray-400 mb-4">
              No orders yet
            </p>
            <a
              href="/build"
              className="inline-block bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
            >
              Build Your First Pizza
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
                      Order #{order.id}
                    </h3>
                    <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString()} at{" "}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 mt-4 sm:mt-0 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="font-inter text-sm font-semibold">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-inter font-semibold text-sm text-black dark:text-white mb-3">
                    Order Items ({order.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-[#E8E8E8] dark:border-gray-700 p-4"
                      >
                        <p className="font-inter font-semibold text-sm text-black dark:text-white mb-1">
                          Custom Pizza #{idx + 1}
                        </p>
                        <p className="font-inter text-xs text-[#6B6B6B] dark:text-gray-400">
                          Base: {item.base} • Sauce: {item.sauce} • Cheese:{" "}
                          {item.cheese}
                        </p>
                        {item.veggies && item.veggies.length > 0 && (
                          <p className="font-inter text-xs text-[#6B6B6B] dark:text-gray-400">
                            Veggies: {item.veggies.join(", ")}
                          </p>
                        )}
                        {item.meats && item.meats.length > 0 && (
                          <p className="font-inter text-xs text-[#6B6B6B] dark:text-gray-400">
                            Meats: {item.meats.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-[#E8E8E8] dark:border-gray-700">
                  <span className="font-inter font-semibold text-lg text-black dark:text-white">
                    Total
                  </span>
                  <span className="font-playfair font-semibold text-2xl text-black dark:text-white">
                    ${parseFloat(order.total_price).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
