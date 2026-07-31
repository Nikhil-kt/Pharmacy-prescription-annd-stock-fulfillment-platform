"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  MapPin,
  Phone,
  CreditCard,
  Pill,
} from "lucide-react";

export default function CartAndOrderPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [customerId, setCustomerId] = useState("CUST-1001");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cart from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = JSON.parse(localStorage.getItem("rxconnect_cart") || "[]");
      setCartItems(savedCart);
    }
  }, []);

  // Update localStorage when cart items change
  const saveCart = (items) => {
    setCartItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("rxconnect_cart", JSON.stringify(items));
    }
  };

  const updateQuantity = (id, delta) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);
    saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05; // 5% estimate
  const shipping = subtotal > 25 || subtotal === 0 ? 0 : 4.99;
  const grandTotal = subtotal + tax + shipping;

  const requiresPrescription = cartItems.some((item) => item.prescription_required);

  // Handle Checkout submit
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      order_id: orderId,
      customer_id: customerId || "CUST-1001",
      customer_name: customerName || "Valued Customer",
      address,
      phone,
      payment_method: paymentMethod,
      items: cartItems,
      total_amount: grandTotal,
      status: requiresPrescription ? "PENDING PHARMACIST VERIFICATION" : "PROCESSING",
      created_at: new Date().toISOString(),
    };

    // Save order in local history
    if (typeof window !== "undefined") {
      const existingOrders = JSON.parse(localStorage.getItem("rxconnect_orders") || "[]");
      existingOrders.unshift(newOrder);
      localStorage.setItem("rxconnect_orders", JSON.stringify(existingOrders));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setOrderPlacedSuccess(newOrder);
      clearCart();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-[#0E7C50]" size={28} /> Shopping Cart & Order Checkout
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Review selected items, attach prescriptions if required, and confirm delivery address.
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 size={14} /> Clear Cart
            </button>
          )}
        </div>
      </header>

      {/* Main Order Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Order Confirmation Screen */}
        {orderPlacedSuccess ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-[#0E7C50] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0E7C50] uppercase tracking-wider">
                Order Confirmed
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
                Order #{orderPlacedSuccess.order_id} Placed!
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Thank you for your order. Total Amount:{" "}
                <strong className="text-gray-900">${orderPlacedSuccess.total_amount.toFixed(2)}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-xs text-left space-y-2">
              <p>
                <strong>Status:</strong>{" "}
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                  {orderPlacedSuccess.status}
                </span>
              </p>
              <p>
                <strong>Customer ID:</strong> {orderPlacedSuccess.customer_id}
              </p>
              <p>
                <strong>Delivery Address:</strong> {orderPlacedSuccess.address || "Standard Customer Address"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={`/frontend/user/Order _Status?customerId=${orderPlacedSuccess.customer_id}`}
                className="w-full sm:w-auto px-6 py-3 bg-[#0E7C50] text-white font-bold text-xs rounded-xl hover:bg-[#0B6A44] transition-colors flex items-center justify-center gap-2"
              >
                Track Order Status <ArrowRight size={14} />
              </Link>
              <Link
                href="/frontend/user/filter"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500 max-w-2xl mx-auto space-y-4">
            <Pill size={56} className="mx-auto text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              You haven't added any medicines or health products to your cart yet. Explore our branch stock or search catalog.
            </p>
            <Link
              href="/frontend/user/filter"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E7C50] text-white font-bold text-xs rounded-xl hover:bg-[#0B6A44] shadow-sm"
            >
              Browse Medicines Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Cart Items List */}
            <section className="lg:col-span-7 space-y-6">
              {requiresPrescription && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 text-xs flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Prescription Required</h4>
                    <p className="text-amber-800 mt-0.5">
                      One or more items in your cart require a doctor prescription. Please ensure you have uploaded a prescription so your order can be verified.
                    </p>
                    <Link
                      href="/frontend/user/upload"
                      className="mt-2 inline-flex items-center gap-1 font-bold text-amber-900 underline hover:text-amber-700"
                    >
                      <FileText size={14} /> Upload Doctor Prescription Now
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                  Cart Items ({cartItems.length})
                </h3>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0E7C50] flex items-center justify-center font-bold text-sm shrink-0">
                          <Pill size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            {item.category}
                          </span>
                          {item.prescription_required && (
                            <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              Rx Required
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity adjust */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-gray-900">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="font-extrabold text-gray-900 text-sm w-16 text-right">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right: Checkout Details & Summary */}
            <section className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                  Customer & Shipping Details
                </h3>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <User size={13} className="text-[#0E7C50]" /> Customer ID
                    </label>
                    <input
                      type="text"
                      required
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      placeholder="e.g. CUST-1001"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0E7C50] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0E7C50] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin size={13} className="text-[#0E7C50]" /> Delivery Address
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter street address, building, city..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0E7C50] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Phone size={13} className="text-[#0E7C50]" /> Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0E7C50] focus:outline-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                      <CreditCard size={13} className="text-[#0E7C50]" /> Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          paymentMethod === "COD"
                            ? "border-[#0E7C50] bg-emerald-50 text-[#0E7C50]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CARD")}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          paymentMethod === "CARD"
                            ? "border-[#0E7C50] bg-emerald-50 text-[#0E7C50]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Credit Card / Online
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax (5%)</span>
                      <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-semibold text-gray-900">
                        {shipping === 0 ? <span className="text-[#0E7C50] font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-extrabold text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-[#0E7C50] text-base">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#0E7C50] text-white font-bold text-xs rounded-xl hover:bg-[#0B6A44] transition-colors shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    {isSubmitting ? "Confirming Order..." : "Confirm & Place Order"}
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}