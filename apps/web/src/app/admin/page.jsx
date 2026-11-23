"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Pizza, Package, Archive, BarChart, LogOut } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !user && !userLoading) {
      window.location.href = "/account/signin";
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes, inventoryRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/inventory"),
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
          const orders = ordersData.orders || [];
          setStats((prev) => ({
            ...prev,
            totalOrders: orders.length,
            pendingOrders: orders.filter((o) => o.status !== "Delivered")
              .length,
          }));
        }

        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          const allItems = [
            ...(inventoryData.bases || []),
            ...(inventoryData.sauces || []),
            ...(inventoryData.cheeses || []),
            ...(inventoryData.veggies || []),
            ...(inventoryData.meats || []),
          ];
          const lowStockCount = allItems.filter(
            (item) => item.stock_quantity <= 20,
          ).length;
          setStats((prev) => ({ ...prev, lowStock: lowStockCount }));
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
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

  if (!user || !profile || profile.role !== "admin") return null;

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
          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="font-inter text-sm text-[#E63946] hover:text-[#d32f3c] transition-colors"
            >
              Customer View
            </a>
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
            Admin Dashboard
          </h2>
          <p className="font-inter text-lg text-[#6B6B6B] dark:text-gray-400">
            Manage your pizza business
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8">
            <BarChart className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-3xl text-black dark:text-white mb-2">
              {stats.totalOrders}
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Total Orders
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8">
            <Package className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-3xl text-black dark:text-white mb-2">
              {stats.pendingOrders}
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Pending Orders
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8">
            <Archive className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-3xl text-black dark:text-white mb-2">
              {stats.lowStock}
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Low Stock Items
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="/admin/orders"
            className="group bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-200"
          >
            <Package className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
              Manage Orders
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              View and update order statuses
            </p>
          </a>

          <a
            href="/admin/inventory"
            className="group bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-200"
          >
            <Archive className="w-12 h-12 text-[#E63946] mb-4" />
            <h3 className="font-inter font-semibold text-xl text-black dark:text-white mb-2">
              Manage Inventory
            </h3>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              Update stock levels and prices
            </p>
          </a>
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
