"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { 
  Building2, 
  FileUp, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Search 
} from "lucide-react";

export default function UserDashboard() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/customer";

  useEffect(() => {
    const savedBranchId = localStorage.getItem("selectedBranchId");

    async function fetchBranches() {
      try {
        const res = await fetch(`${API_BASE_URL}/branches`);
        const data = await res.json();

        if (res.ok && data.success) {
          const activeBranches = data.branches || [];
          setBranches(activeBranches);

          if (savedBranchId) {
            const current = activeBranches.find((b) => String(b.id) === String(savedBranchId));
            if (current) setSelectedBranch(current);
          }
        } else {
          setError(data.error || "Failed to load branch details.");
        }
      } catch (err) {
        setError(`Connection failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchBranches();
  }, []);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem("selectedBranchId", branch.id);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      {/* Embedded Navbar */}
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0E7C50] to-emerald-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium inline-block">
              Customer Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome Back to HealthFirst
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm">
              Use the top navigation bar to search for medicines directly, or choose your local branch below to manage local orders and prescriptions.
            </p>
          </div>

          {/* Active Branch Status Badge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 w-full md:w-auto shrink-0 space-y-1">
            <span className="text-[11px] text-emerald-200 font-medium block uppercase tracking-wider">
              Selected Branch
            </span>
            {selectedBranch ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span className="font-bold text-sm text-white">{selectedBranch.branch_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-200">
                <Clock size={16} />
                <span className="text-xs font-semibold">No branch selected</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Quick Actions (Browse Medicines removed) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a
            href="#branch-section"
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0E7C50] transition group space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E7C50] flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0E7C50] transition">
                Select Branch
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Choose a pharmacy branch to check localized inventory</p>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#0E7C50] pt-2">
              Choose Location <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
            </div>
          </a>

          <Link
            href="/frontend/user/upload"
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-600 transition group space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition">
                Upload Prescription
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Submit doctor prescriptions directly for fulfillment</p>
            </div>
            <div className="flex items-center text-xs font-semibold text-purple-600 pt-2">
              Upload File <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/frontend/user/Order_Status"
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-600 transition group space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition">
                Track Order
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Check real-time delivery status and purchase history</p>
            </div>
            <div className="flex items-center text-xs font-semibold text-amber-600 pt-2">
              View History <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Pharmacy Branches Grid */}
        <div id="branch-section" className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pharmacy Branches</h2>
            <p className="text-xs text-gray-500">Pick a location to view branch-specific stock or details.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-xs">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="p-8 text-center bg-white border rounded-xl text-gray-500 text-xs">
              No active pharmacy branches found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => {
                const isSelected = selectedBranch?.id === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`bg-white border rounded-xl p-5 transition space-y-3 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0E7C50] ring-2 ring-[#0E7C50]/20 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-sm">{branch.branch_name}</h3>
                        {isSelected && (
                          <span className="bg-[#0E7C50]/10 text-[#0E7C50] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{branch.address || "Main Location"}</p>
                      {branch.phone && (
                        <p className="text-xs text-gray-400">📞 {branch.phone}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t flex gap-2">
                      <button
                        onClick={() => handleSelectBranch(branch)}
                        className={`flex-1 text-xs py-2 rounded-lg font-semibold transition ${
                          isSelected
                            ? "bg-emerald-50 text-[#0E7C50] cursor-default"
                            : "bg-[#0E7C50] text-white hover:bg-[#0B6A44]"
                        }`}
                      >
                        {isSelected ? "Branch Active" : "Select Branch"}
                      </button>
                      <Link
                        href={`/frontend/user/filter?branchId=${branch.id}`}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        Inventory <Search size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Embedded Footer */}
      <Footer />
    </div>
  );
}