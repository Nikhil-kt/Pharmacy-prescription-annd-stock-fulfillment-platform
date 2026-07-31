"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { fetchMedicineDetails, searchMedicines } from "../api";
import {
  Pill,
  FileText,
  ShoppingCart,
  Check,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Plus,
  Minus,
  Upload,
  Building2,
  Tag,
} from "lucide-react";

function MedicineDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const medicineId = searchParams.get("id");

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Selector for fallback if no ID in URL
  const [manualIdInput, setManualIdInput] = useState("");

  useEffect(() => {
    async function loadDetails() {
      if (!medicineId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchMedicineDetails(medicineId);
        if (data.success && data.medicine) {
          setMedicine(data.medicine);
        } else {
          setError("Medicine not found in backend inventory.");
        }
      } catch (err) {
        console.error("Error fetching medicine details:", err);
        setError("Unable to load medicine details from API server.");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [medicineId]);

  const addToCart = () => {
    if (!medicine || typeof window === "undefined") return;

    const currentCart = JSON.parse(localStorage.getItem("rxconnect_cart") || "[]");
    const existingIdx = currentCart.findIndex((item) => item.id === medicine.id);

    if (existingIdx > -1) {
      currentCart[existingIdx].qty += quantity;
    } else {
      currentCart.push({
        id: medicine.id,
        name: medicine.medicine_name,
        price: parseFloat(medicine.price || 0),
        prescription_required: !!medicine.prescription_required,
        category: medicine.category || "General",
        qty: quantity,
      });
    }

    localStorage.setItem("rxconnect_cart", JSON.stringify(currentCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualIdInput.trim()) {
      router.push(`/frontend/user/medicine?id=${manualIdInput.trim()}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#0E7C50]" />
        <p className="text-sm font-semibold text-gray-700">Loading Medicine Information...</p>
      </div>
    );
  }

  // If no medicine ID selected or invalid
  if (!medicineId || error || !medicine) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl inline-block">
          <Pill size={48} className="text-amber-600 mx-auto" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {error || "Select a Medicine to View Details"}
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
            Please select a medicine from the dashboard catalog or enter a valid medicine ID below.
          </p>
        </div>

        <form onSubmit={handleManualSearch} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Enter Medicine ID..."
            value={manualIdInput}
            onChange={(e) => setManualIdInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0E7C50] focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0E7C50] text-white text-xs font-bold rounded-xl hover:bg-[#0B6A44]"
          >
            Fetch Details
          </button>
        </form>

        <div className="pt-4">
          <Link
            href="/frontend/user/filter"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E7C50] hover:underline"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/frontend/user/filter"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#0E7C50] transition-colors"
      >
        <ArrowLeft size={16} /> Return to Medicines Catalog
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Visual Icon & Badges */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-gray-100 rounded-2xl p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100/70 text-[#0E7C50] flex items-center justify-center mb-4 shadow-inner">
            <Pill size={48} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-emerald-50 text-[#0E7C50] rounded-full border border-emerald-200">
            {medicine.category || "Healthcare"}
          </span>

          {medicine.prescription_required ? (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
              <FileText size={16} className="text-amber-600 shrink-0" />
              <span className="font-medium text-left">
                Doctor Prescription Required for order approval.
              </span>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#0E7C50] shrink-0" />
              <span className="font-medium text-left">Over the Counter (OTC) Product</span>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Specs & Purchase Actions */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
              ID: {medicine.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {medicine.medicine_name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-medium">
                <Building2 size={14} className="text-gray-400" /> Mfr: {medicine.manufacturer || "Certified Manufacturer"}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Tag size={14} className="text-gray-400" /> Category: {medicine.category || "General"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl">
            <span className="text-xs text-gray-500 font-medium block">Product Description</span>
            <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
              {medicine.description || "No full description currently provided for this pharmaceutical item."}
            </p>
          </div>

          {/* Pricing & Quantity Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold block">Unit Price</span>
              <span className="text-3xl font-black text-[#0E7C50]">
                ${parseFloat(medicine.price || 0).toFixed(2)}
              </span>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={addToCart}
              className={`w-full py-3.5 px-6 font-bold text-sm rounded-xl text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                added ? "bg-emerald-600" : "bg-[#0E7C50] hover:bg-[#0B6A44]"
              }`}
            >
              {added ? (
                <>
                  <Check size={18} /> Added {quantity} item(s) to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to Cart (
                  ${(parseFloat(medicine.price || 0) * quantity).toFixed(2)})
                </>
              )}
            </button>

            {medicine.prescription_required && (
              <Link
                href="/frontend/user/upload"
                className="w-full py-3 px-6 bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-xs rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={16} /> Upload Prescription for this Medicine
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MedicineDetailsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-20 text-center text-gray-500">
              <Loader2 size={32} className="animate-spin text-[#0E7C50] mx-auto" />
            </div>
          }
        >
          <MedicineDetailsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}