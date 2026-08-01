"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { Search, AlertCircle, ShoppingBag, ShieldCheck, Pill, MapPin } from "lucide-react";

export default function MedicinePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [medicines, setMedicines] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/customer";

  useEffect(() => {
    // Read active branch ID from localStorage (if set)
    const savedBranchId = localStorage.getItem("selectedBranchId");
    setSelectedBranchId(savedBranchId);

    async function fetchAllMedicinesFromDatabase() {
      setLoading(true);
      setError("");

      try {
        let endpoint = `${API_BASE_URL}/medicines`; // Default GET API for ALL medicines

        // If a search query or category is provided from Navbar, use search endpoint
        if (query.trim() || (category && category !== "All Categories")) {
          const params = new URLSearchParams();
          if (query.trim()) params.append("name", query.trim());
          if (category && category !== "All Categories") params.append("category", category);
          endpoint = `${API_BASE_URL}/search?${params.toString()}`;
        }

        const res = await fetch(endpoint, { method: "GET" });
        const data = await res.json();

        if (res.ok && data.success) {
          // Display all records retrieved from the database GET API
          const fetchedList = data.medicines || data.data || [];
          setMedicines(fetchedList);
        } else {
          setError(data.error || "Failed to retrieve medicines from database.");
        }
      } catch (err) {
        setError(`Database connection error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchAllMedicinesFromDatabase();
  }, [query, category]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Active Branch Notice */}
        {!selectedBranchId && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={15} className="text-amber-600" />
              Note: No active branch selected on Dashboard. Showing all database products.
            </span>
          </div>
        )}

        {/* Dynamic Page Header */}
        <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query 
                ? `Search Results for "${query}"` 
                : category 
                ? `${category} Products` 
                : "All Database Medicines"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {query 
                ? `Showing database matches for "${query}"` 
                : "Displaying all available medicines directly from the system database."}
            </p>
          </div>
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
            {medicines.length} Item(s) Found
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#0E7C50] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 font-medium">Fetching all medicines from database GET API...</p>
          </div>
        ) : medicines.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No medicines in database</h3>
              <p className="text-xs text-gray-500 mt-1">
                {query 
                  ? `No items matching "${query}" were found.` 
                  : "There are currently no medicines stored in the database."}
              </p>
            </div>
          </div>
        ) : (
          /* All Database Medicines Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((item, idx) => {
              const med = item.medicines1 || item; // Normalizes direct medicine rows or inventory objects

              return (
                <div
                  key={med.id || idx}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#0E7C50] transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#0E7C50] uppercase bg-emerald-50 px-2 py-0.5 rounded">
                          {med.category || "General"}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 mt-1">
                          {med.medicine_name}
                        </h3>
                      </div>
                      <span className="text-lg font-extrabold text-[#0E7C50]">
                        ${Number(med.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {med.description || "No description available."}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      {med.manufacturer && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Manufacturer:</span>
                          <span className="font-semibold text-gray-700">{med.manufacturer}</span>
                        </div>
                      )}
                      {med.dosage_form && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dosage Form:</span>
                          <span className="font-semibold text-gray-700">{med.dosage_form}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Availability:</span>
                        <span className="font-semibold text-emerald-600">
                          Available {item.quantity ? `(${item.quantity} in stock)` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {med.prescription_required ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                        <ShieldCheck size={12} /> Rx Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        <Pill size={12} /> Over-the-counter
                      </span>
                    )}

                    <button
                      type="button"
                      className="bg-[#0E7C50] hover:bg-[#0B6A44] text-white text-xs px-3 py-2 rounded-lg font-semibold transition flex items-center gap-1.5"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}