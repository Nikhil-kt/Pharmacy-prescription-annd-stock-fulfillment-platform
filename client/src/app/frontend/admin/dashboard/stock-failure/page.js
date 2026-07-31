'use client';

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

// Point directly to Express port 5000 (or use your env variable)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function StockFailurePage() {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  const fallbackData = [
    {
      order_id: 1042,
      branch_name: "Downtown Central",
      city: "Bengaluru",
      failed_at: new Date().toISOString(),
      cancellation_reason: "Insufficient Stock",
      items: [
        { medicine_name: "Paracetamol 500mg", requested_quantity: 5 },
        { medicine_name: "Amoxicillin 250mg", requested_quantity: 2 }
      ]
    },
    {
      order_id: 1089,
      branch_name: "Indiranagar Hub",
      city: "Bengaluru",
      failed_at: new Date(new Date().getTime() - 3600000).toISOString(),
      cancellation_reason: "Out of Stock",
      items: [
        { medicine_name: "Metformin 500mg", requested_quantity: 10 }
      ]
    }
  ];

  const fetchStockFailures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stock-failure`);

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned status ${response.status} (${response.statusText}).`);
      }

      const result = await response.json();

      if (result.success) {
        setFailures(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch stock failures.");
      }
    } catch (err) {
      console.warn("API call failed, loading fallback data:", err.message);
      setError(err.message);
      setFailures(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  const fetchStockFailures = async () => {
    try {
const response = await fetch("http://localhost:5000/api/admin/stock-failure");     
 const data = await response.json();
      // setStockFailures(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchStockFailures();
}, []); // Empty dependency array because the function is scoped inside

  // Handle branch property names from backend ('branch' vs 'branch_name')
  const uniqueBranches = Array.from(
    new Set(failures.map((item) => item.branch_name || item.branch).filter(Boolean))
  );

  // Filtered list based on branch & search term
  const filteredFailures = failures.filter((failure) => {
    const branchName = failure.branch_name || failure.branch || "";

    const matchesBranch =
      selectedBranch === "ALL" || branchName === selectedBranch;

    const matchesSearch =
      failure.order_id?.toString().includes(searchTerm) ||
      branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failure.items?.some((item) =>
        item.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesBranch && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg text-lg">
                📋
              </span>
              Stock-Related Order Failures
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track customer orders that could not be fulfilled due to branch inventory shortages.
            </p>
          </div>
          <button
            onClick={fetchStockFailures}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition duration-150 cursor-pointer self-start md:self-auto flex items-center gap-2"
          >
            🔄 Refresh Log
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 my-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Order ID, Branch, or Medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 shadow-sm"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Branches</option>
            {uniqueBranches.map((branch, idx) => (
              <option key={idx} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="p-12 text-center text-emerald-700 font-medium bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
            Loading failure log...
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-6 flex items-center justify-between">
            <span>⚠️ API Warning: {error} (Displaying local preview data).</span>
          </div>
        )}

        {!loading && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 uppercase text-xs text-gray-500 border-b border-gray-200 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Unfulfilled Items</th>
                    <th className="px-6 py-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFailures.length > 0 ? (
                    filteredFailures.map((failure, idx) => (
                      <tr
                        key={failure.order_id || idx}
                        className="hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                          #{failure.order_id}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {failure.branch_name || failure.branch || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {failure.city || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500">
                          {failure.failed_at || failure.cancelled_at
                            ? new Date(failure.failed_at || failure.cancelled_at).toLocaleString()
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            {failure.items?.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="font-medium text-gray-800">
                                  • {item.medicine_name}
                                </span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full font-mono text-[10px] font-semibold">
                                  Qty: {item.requested_quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold">
                            {failure.cancellation_reason || "Insufficient Stock"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-400 font-medium"
                      >
                        No stock-related order failures found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}