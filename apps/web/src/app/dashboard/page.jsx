"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Pizza, ChefHat, Package, User, LogOut } from "lucide-react";

export default function DashboardPage() {
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
          fetch("/api/orders"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.user);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 flex items-center justify-center">
        <div className="font-inter text-lg text-[#6B6B6B] dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = profile?.role === "admin";

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
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              {user.email}
            </span>
            {isAdmin && (
              <a
                href="/admin"
                className="font-inter text-sm text-[#E63946] hover:text-[#d32f3c] transition-colors"
              >
                Admin Panel
              </a>
            )}
            <a
              href="/account/logout"
              className="flex items-center font-inter text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="font-playfair font-medium text-3xl md:text-4xl text-black dark:text-white mb-2">
            Welcome back{user.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="font-inter text-lg text-[#6B6B6B] dark:text-gray-400">
            Ready to build your next pizza masterpiece?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <a
            href="/build"
            className="group bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-200"
          >
            <ChefHat className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
              Build Your Pizza
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Create a custom pizza from scratch
            </p>
          </a>

          <a
            href="/orders"
            className="group bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-200"
          >
            <Package className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
              My Orders
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Track your order history
            </p>
          </a>

          <a
            href="/admin/promote"
            className="group bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-200"
          >
            <User className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
              Make Admin
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Promote yourself (delete after use)
            </p>
          </a>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8">
          <h3 className="font-playfair font-medium text-2xl text-black dark:text-white mb-6">
            Recent Orders
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Pizza className="w-16 h-16 text-[#E8E8E8] dark:text-gray-700 mx-auto mb-4" />
              <p className="font-inter text-[#6B6B6B] dark:text-gray-400">
                No orders yet. Start building your first pizza!
              </p>
              <a
                href="/build"
                className="inline-block mt-4 bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
              >
                Build Pizza
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="border border-[#E8E8E8] dark:border-gray-700 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-inter font-semibold text-lg text-black dark:text-white">
                        Order #{order.id}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-inter uppercase tracking-wider ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Sent to Delivery"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "In the Kitchen"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
                      {order.items?.length || 0} pizza
                      {(order.items?.length || 0) !== 1 ? "s" : ""} • $
                      {parseFloat(order.total_price).toFixed(2)}
                    </p>
                    <p className="font-inter text-xs text-[#999] dark:text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href="/orders"
                    className="font-inter text-sm text-black dark:text-white underline hover:no-underline transition-all"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
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
