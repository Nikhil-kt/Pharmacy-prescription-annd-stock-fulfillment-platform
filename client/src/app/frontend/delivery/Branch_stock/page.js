"use client";

import { useState, useEffect } from "react";

export default function BranchStockPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  // Base URL matching Express app.use("/api/customer", customerRoutes)
  const API_BASE_URL = "http://localhost:5000/api/customer";

  // 1. Fetch All Branches (router.get("/branches"))
  const fetchBranches = async () => {
    setLoadingBranches(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/branches`);
      const data = await res.json();

      if (res.ok && data.success) {
        const branchList = data.branches || [];
        setBranches(branchList);
        if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].id); // Default to first branch
        }
      } else {
        setError(data.error || "Failed to load branches from server.");
      }
    } catch (err) {
      setError(
        `Network Error: ${err.message}. Make sure Express is running on port 5000 with CORS enabled.`
      );
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // 2. Fetch Medicines for Selected Branch (router.get("/branches/:branchId/medicines"))
  const fetchMedicinesForBranch = async (branchId) => {
    if (!branchId) return;

    setLoadingMedicines(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/branches/${branchId}/medicines`);
      const data = await res.json();

      if (res.ok && data.success) {
        setMedicines(data.medicines || []);
      } else {
        setError(data.error || "Failed to fetch stock for this branch.");
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
    } finally {
      setLoadingMedicines(false);
    }
  };

  useEffect(() => {
    if (selectedBranchId) {
      fetchMedicinesForBranch(selectedBranchId);
    }
  }, [selectedBranchId]);

  // 3. Search Medicine (router.get("/search?name=..."))
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/search?name=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setSearchResults(data.medicines || []);
      } else {
        setError(data.error || "Search failed.");
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Stock & Inventory</h1>
          <p className="text-sm text-gray-500">
            View available medicines and stock levels across pharmacy branches.
          </p>
        </div>

        {/* Medicine Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search medicine name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-xs font-bold text-red-600 hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Results Drawer */}
      {searchResults.length > 0 && (
        <div className="space-y-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-blue-900">
              Search Results ({searchResults.length})
            </h2>
            <button
              onClick={() => setSearchResults([])}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((med) => (
              <div key={med.id} className="bg-white p-3 rounded-lg border shadow-sm space-y-1">
                <p className="font-semibold text-gray-800 text-sm">{med.medicine_name}</p>
                <p className="text-xs text-gray-500">
                  Category: {med.category || "General"} | Price: ${med.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branch Dropdown Selector */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/2">
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            Select Pharmacy Branch
          </label>
          {loadingBranches ? (
            <div className="text-xs text-gray-500 py-2">Loading branches from database...</div>
          ) : (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {branches.length === 0 ? (
                <option value="">No branches found in database</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name} {b.address ? `(${b.address})` : ""}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        <button
          onClick={() => {
            fetchBranches();
            if (selectedBranchId) fetchMedicinesForBranch(selectedBranchId);
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition self-end sm:self-auto"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Medicines Inventory Table */}
      {loadingMedicines ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading stock data for selected branch...
        </div>
      ) : medicines.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded-xl text-gray-500 text-sm">
          No medicines currently in stock for this branch (quantity &gt; 0).
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Available Quantity</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Prescription Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicines.map((item, idx) => {
                const med = item.medicines1 || {};
                return (
                  <tr key={med.id || idx} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {med.medicine_name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {med.category || "General"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {med.manufacturer || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {item.quantity} units
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      ${med.price || 0}
                    </td>
                    <td className="py-3 px-4">
                      {med.prescription_required ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          No (OTC)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}