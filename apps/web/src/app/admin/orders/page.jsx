"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Pizza,
  Package,
  Clock,
  Truck,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

export default function AdminOrdersPage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !user && !userLoading) {
      window.location.href = "/account/signin";
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/admin/orders"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.user);

          if (profileData.user?.role !== "admin") {
            window.location.href = "/dashboard";
            return;
          }
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Received":
        return <Package className="w-5 h-5" />;
      case "In the Kitchen":
        return <Clock className="w-5 h-5" />;
      case "Sent to Delivery":
        return <Truck className="w-5 h-5" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
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

  if (!user || !profile || profile.role !== "admin") return null;

  const statuses = [
    "Order Received",
    "In the Kitchen",
    "Sent to Delivery",
    "Delivered",
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 font-inter">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-[#E8E8E8] dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/admin" className="flex items-center">
            <Pizza className="w-8 h-8 text-[#E63946]" />
            <h1 className="ml-2 font-playfair font-semibold text-2xl text-black dark:text-white">
              PizzaFlow Admin
            </h1>
          </a>
          <a
            href="/admin"
            className="font-inter text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-playfair font-medium text-3xl md:text-4xl text-black dark:text-white mb-8">
          Manage Orders
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-12 text-center">
            <Package className="w-16 h-16 text-[#E8E8E8] dark:text-gray-700 mx-auto mb-4" />
            <p className="font-inter text-[#6B6B6B] dark:text-gray-400">
              No orders yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
                      Order #{order.id}
                    </h3>
                    <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
                      Customer: {order.user_name || order.user_email}
                    </p>
                    <p className="font-inter text-xs text-[#999] dark:text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="relative w-full lg:w-auto">
                    <label className="block font-inter text-xs uppercase tracking-wider text-black dark:text-white opacity-60 mb-2">
                      Update Status
                    </label>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="appearance-none w-full lg:w-auto bg-[#F5F5F5] dark:bg-gray-700 border border-[#E8E8E8] dark:border-gray-600 px-4 py-3 pr-10 text-sm font-inter text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black dark:text-white pointer-events-none" />
                    </div>
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
