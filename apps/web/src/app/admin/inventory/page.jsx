"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Pizza, Edit2, Save, X, AlertTriangle } from "lucide-react";

export default function AdminInventoryPage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined" && !user && !userLoading) {
      window.location.href = "/account/signin";
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, inventoryRes] = await Promise.all([
          fetch("/api/profile"),
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

        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setInventory(inventoryData);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditValues({
      stock_quantity: item.stock_quantity,
      price: item.price,
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: editingItem.type,
          itemId: editingItem.id,
          stockQuantity: parseInt(editValues.stock_quantity),
          price: parseFloat(editValues.price),
        }),
      });

      if (res.ok) {
        const { item } = await res.json();

        // Update local state
        setInventory((prev) => ({
          ...prev,
          [`${editingItem.type}s`]: prev[`${editingItem.type}s`].map((i) =>
            i.id === item.id ? item : i,
          ),
        }));

        setEditingItem(null);
        setEditValues({});
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update inventory");
      }
    } catch (err) {
      console.error("Failed to update inventory:", err);
      alert("Failed to update inventory");
    }
  };

  const renderItems = (items, type, typeName) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-12">
        <h3 className="font-playfair font-medium text-2xl text-black dark:text-white mb-6">
          {typeName}
        </h3>
        <div className="grid gap-4">
          {items.map((item) => {
            const isEditing =
              editingItem?.id === item.id && editingItem?.type === type;
            const isLowStock = item.stock_quantity <= 20;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 border p-6 ${
                  isLowStock
                    ? "border-[#E63946] dark:border-red-800"
                    : "border-[#E8E8E8] dark:border-gray-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-inter font-semibold text-lg text-black dark:text-white">
                        {item.name}
                      </h4>
                      {isLowStock && (
                        <div className="flex items-center space-x-1 bg-[#FFEAEA] dark:bg-red-900/20 border border-[#E63946] dark:border-red-800 px-2 py-1">
                          <AlertTriangle className="w-3 h-3 text-[#E63946] dark:text-red-400" />
                          <span className="font-inter text-xs text-[#E63946] dark:text-red-400 font-semibold">
                            LOW STOCK
                          </span>
                        </div>
                      )}
                    </div>
                    {!isEditing ? (
                      <div className="mt-2 space-y-1">
                        <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
                          Stock: {item.stock_quantity} units
                        </p>
                        <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
                          Price: ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block font-inter text-xs uppercase tracking-wider text-black dark:text-white opacity-60 mb-1">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={editValues.stock_quantity}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                stock_quantity: e.target.value,
                              })
                            }
                            className="w-full lg:w-32 bg-[#F5F5F5] dark:bg-gray-700 border border-[#E8E8E8] dark:border-gray-600 px-3 py-2 text-sm font-inter text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block font-inter text-xs uppercase tracking-wider text-black dark:text-white opacity-60 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.price}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                price: e.target.value,
                              })
                            }
                            className="w-full lg:w-32 bg-[#F5F5F5] dark:bg-gray-700 border border-[#E8E8E8] dark:border-gray-600 px-3 py-2 text-sm font-inter text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(item, type)}
                        className="flex items-center bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center bg-[#E63946] text-white font-inter font-semibold text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#d32f3c] transition-colors duration-200"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditValues({});
                          }}
                          className="flex items-center border border-[#E8E8E8] dark:border-gray-600 text-black dark:text-white font-inter font-semibold text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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

  if (!user || !profile || profile.role !== "admin" || !inventory) return null;

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
          Manage Inventory
        </h2>

        <div className="bg-[#FFF9E6] dark:bg-yellow-900/20 border border-[#FFD700] dark:border-yellow-700 p-4 mb-8">
          <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-300">
            <strong>Low Stock Alert:</strong> Items with 20 or fewer units will
            be highlighted. Email notifications are sent when stock drops below
            this threshold (check console logs for alerts).
          </p>
        </div>

        {renderItems(inventory.bases, "pizza_base", "Pizza Bases")}
        {renderItems(inventory.sauces, "sauce", "Sauces")}
        {renderItems(inventory.cheeses, "cheese", "Cheeses")}
        {renderItems(inventory.veggies, "veggie", "Veggies")}
        {renderItems(inventory.meats, "meat", "Meats")}
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
