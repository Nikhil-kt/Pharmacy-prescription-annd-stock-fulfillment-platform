"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { fetchCustomerOrders } from "../api";
import {
  Clock,
  Search,
  CheckCircle2,
  Package,
  Truck,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Pill,
} from "lucide-react";

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const initialCustomerId = searchParams.get("customerId") || "CUST-1001";

  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasQueried, setHasQueried] = useState(false);

  const handleQueryOrders = async (e) => {
    if (e) e.preventDefault();
    if (!customerId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasQueried(true);

      // Fetch customer orders from API (with fallback)
      const res = await fetchCustomerOrders(customerId.trim());
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }

      // Also check locally stored user prescriptions for this customer ID
      if (typeof window !== "undefined") {
        const savedRx = JSON.parse(localStorage.getItem("rxconnect_user_prescriptions") || "[]");
        const matchingRx = savedRx.filter(
          (rx) => String(rx.customer_id) === String(customerId.trim())
        );
        setPrescriptions(matchingRx);
      }
    } catch (err) {
      console.error("Failed querying orders:", err);
      setError("Unable to retrieve order history for this customer ID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCustomerId) {
      handleQueryOrders();
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 flex-1 w-full">
      {/* Search Header Banner */}
      <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm text-center space-y-6">
        <div>
          <span className="text-xs font-bold text-[#0E7C50] uppercase tracking-wider">
            Live Fulfillment Tracker
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-1">
            Customer Order & Prescription Status
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Enter your Customer ID to check live status, pharmacist prescription approvals, and delivery updates.
          </p>
        </div>

        <form onSubmit={handleQueryOrders} className="max-w-xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              required
              placeholder="Enter Customer ID (e.g. CUST-1001)..."
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#0E7C50] focus:bg-white focus:outline-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0E7C50] text-white text-xs font-bold rounded-2xl hover:bg-[#0B6A44] transition-colors flex items-center gap-1.5 shadow-md"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Track</span>
          </button>
        </form>
      </section>

      {/* Main Results Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#0E7C50]" />
          <p className="text-sm font-semibold text-gray-700">Fetching Customer History...</p>
        </div>
      ) : hasQueried && (
        <div className="space-y-10">
          {/* Section 1: Customer Orders */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
              <Package className="text-[#0E7C50]" size={22} /> Orders for Customer "{customerId}"
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
                <Clock size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-gray-800 text-sm">No Active Orders Found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Place an order from the cart to track live status updates here.
                </p>
                <Link
                  href="/frontend/user/filter"
                  className="mt-4 inline-block px-4 py-2 bg-[#0E7C50] text-white text-xs font-bold rounded-xl"
                >
                  Shop Medicines Now
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, idx) => (
                  <div
                    key={order.order_id || idx}
                    className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 text-xs">
                      <div>
                        <span className="text-xs font-extrabold text-[#0E7C50]">
                          Order ID: #{order.order_id || `ORD-${idx + 1}`}
                        </span>
                        <p className="text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={12} /> Placed:{" "}
                          {new Date(order.created_at || Date.now()).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                          Total: ${parseFloat(order.total_amount || 0).toFixed(2)}
                        </span>
                        <span className="text-xs font-extrabold uppercase px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
                          {order.status || "PROCESSING"}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress Stepper */}
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                        <div className="flex flex-col items-center gap-1.5 text-[#0E7C50]">
                          <div className="w-8 h-8 rounded-full bg-[#0E7C50] text-white flex items-center justify-center font-bold text-xs">
                            1
                          </div>
                          <span>Order Placed</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 text-emerald-700">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0E7C50] flex items-center justify-center font-bold text-xs">
                            2
                          </div>
                          <span>Rx Verified</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
                            3
                          </div>
                          <span>Out for Delivery</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
                            4
                          </div>
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Items Breakdown */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                        <span className="font-bold text-gray-700 block">Ordered Items:</span>
                        <div className="divide-y divide-gray-200">
                          {order.items.map((item, i) => (
                            <div key={i} className="py-1.5 flex justify-between items-center text-gray-800">
                              <span>
                                {item.qty}x {item.name}
                              </span>
                              <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Uploaded Prescriptions Status */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
              <FileText className="text-blue-600" size={22} /> Uploaded Prescriptions
            </h2>

            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-500 text-xs">
                No prescription uploads recorded for customer ID "{customerId}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prescriptions.map((rx, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400">Rx ID: #{rx.id || idx + 1}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                        {rx.status || "PENDING"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">
                      <strong>Uploaded:</strong> {new Date(rx.uploaded_at || Date.now()).toLocaleString()}
                    </p>

                    {rx.image_url && (
                      <a
                        href={rx.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#0E7C50] font-semibold hover:underline"
                      >
                        View Prescription Image
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <Suspense
        fallback={
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-[#0E7C50] mx-auto" />
          </div>
        }
      >
        <OrderStatusContent />
      </Suspense>
      <Footer />
    </div>
  );
}