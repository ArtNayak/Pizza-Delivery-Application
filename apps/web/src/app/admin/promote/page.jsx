"use client";

import { useState } from "react";
import useUser from "@/utils/useUser";
import { Pizza, Shield, AlertTriangle } from "lucide-react";

export default function AdminPromotePage() {
  const { data: user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handlePromote = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to promote to admin");
      }
    } catch (err) {
      console.error("Promotion failed:", err);
      setError("Failed to promote to admin");
    } finally {
      setLoading(false);
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

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 border border-[#E8E8E8] dark:border-gray-700 p-8 text-center">
          <Shield className="w-16 h-16 text-[#E63946] mx-auto mb-6" />

          <h2 className="font-playfair font-medium text-3xl text-black dark:text-white mb-4">
            Promote to Admin
          </h2>

          <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400 mb-8">
            Click the button below to promote yourself to admin. This will give
            you access to the admin panel where you can manage inventory and
            orders.
          </p>

          <div className="bg-[#FFF9E6] dark:bg-yellow-900/20 border border-[#FFD700] dark:border-yellow-700 p-4 mb-8 flex items-start text-left">
            <AlertTriangle className="w-5 h-5 text-yellow-800 dark:text-yellow-200 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-inter text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
                Important Security Notice
              </p>
              <p className="font-inter text-sm text-yellow-800 dark:text-yellow-200">
                This page should be deleted after creating your first admin
                account. It allows anyone to become an admin, which is a
                security risk in production.
              </p>
              <p className="font-inter text-xs text-yellow-800 dark:text-yellow-200 mt-2">
                File location: /apps/web/src/app/admin/promote/page.jsx
              </p>
            </div>
          </div>

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 dark:border-green-700 p-4 mb-6">
              <p className="font-inter text-sm text-green-800 dark:text-green-200">
                Successfully promoted to admin! Redirecting...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-[#FFEAEA] dark:bg-red-900/20 border border-[#E63946] dark:border-red-800 p-4 mb-6">
              <p className="font-inter text-sm text-[#E63946] dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handlePromote}
            disabled={loading || success}
            className="bg-[#E63946] text-white font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-[#d32f3c] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Promoting..."
              : success
                ? "Promoted!"
                : "Promote to Admin"}
          </button>
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
