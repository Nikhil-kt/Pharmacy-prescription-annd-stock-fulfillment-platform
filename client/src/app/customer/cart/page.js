'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CustomerCartPage() {
  const { items, updateQuantity, removeItem, clearCart, cartTotal, cartCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/customer/cart');
    }
  }, [user, authLoading, router]);

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login?redirect=/customer/checkout');
    } else {
      router.push('/customer/checkout');
    }
  };

  const handleImageError = (itemId) => {
    setImgErrors(prev => ({ ...prev, [itemId]: true }));
  };

  if (authLoading || !user) return null;

  const freeDeliveryThreshold = 500;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);
  const deliveryProgress = Math.min(100, (cartTotal / freeDeliveryThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-emerald-100 via-teal-50 to-sky-100 border border-emerald-200/60 flex items-center justify-center shadow-lg shadow-emerald-900/5">
            <svg className="w-12 h-12 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Your Shopping Cart is Empty</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Looks like you haven&apos;t added any medicines or health products to your cart yet.
          </p>
          <Link
            href="/customer/medicines"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#044E3B] to-[#0D9488] hover:from-[#033B2C] hover:to-[#0B7A70] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-teal-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Medicines Catalog</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-700">Shopping Cart</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {clearCart && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const itemImg = !imgErrors[item.id] && (item.image_url || item.image || item.photo_url);
              const itemTotal = (Number(item.mrp || 0) * item.quantity).toFixed(2);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200/80 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                >
                  {/* Item Image & Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/60 border border-slate-100 flex items-center justify-center p-2 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.name}
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-3xl text-emerald-600">💊</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.category || 'Medicine'}
                        </span>
                        {item.requires_prescription && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Rx Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate leading-snug hover:text-[#0D9488] transition-colors">
                        <Link href={`/customer/medicines/${item.id}`}>{item.name}</Link>
                      </h3>
                      {item.pack_size || item.unit ? (
                        <p className="text-xs text-slate-500 mt-0.5">{item.pack_size || item.unit}</p>
                      ) : null}
                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        ₹{Number(item.mrp || 0).toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ unit</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls & Line Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Stepper */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-1 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center font-bold text-base transition-colors disabled:opacity-50"
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-sm font-mono text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center font-bold text-base transition-colors"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price & Delete */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-base font-extrabold text-slate-900 font-mono">₹{itemTotal}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors inline-flex items-center gap-1 mt-1"
                        title="Remove item"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden sticky top-28">
              
              {/* Receipt accent bar */}
              <div className="h-2 bg-gradient-to-r from-[#044E3B] via-[#0D9488] to-cyan-500" />

              <div className="p-6">
                <h2 className="text-lg font-extrabold text-slate-900 mb-5 flex items-center justify-between">
                  <span>Order Summary</span>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </h2>

                {/* Free delivery progress bar */}
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span>🚚</span>
                      {cartTotal >= freeDeliveryThreshold ? (
                        <span>You unlocked <strong>FREE Delivery!</strong></span>
                      ) : (
                        <span>Add <strong>₹{remainingForFreeDelivery.toFixed(2)}</strong> for FREE delivery</span>
                      )}
                    </span>
                    <span className="text-emerald-700 font-mono">{Math.round(deliveryProgress)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-emerald-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${deliveryProgress}%` }}
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3.5 text-sm pb-5 border-b border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold font-mono text-slate-900">₹{cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Delivery Fee</span>
                    {cartTotal >= freeDeliveryThreshold ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold font-mono text-slate-900">₹49.00</span>
                    )}
                  </div>

                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>Taxes & GST</span>
                    <span className="text-emerald-700 font-semibold">Included</span>
                  </div>
                </div>

                {/* Total Row */}
                <div className="pt-5 pb-6">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 block">Total Amount</span>
                      <span className="text-[11px] text-slate-400">Final price including delivery</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      ₹{(cartTotal + (cartTotal >= freeDeliveryThreshold ? 0 : 49)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-[#044E3B] to-[#0D9488] hover:from-[#033B2C] hover:to-[#0B7A70] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-teal-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <Link
                  href="/customer/medicines"
                  className="block text-center text-xs font-bold text-[#0D9488] hover:text-[#044E3B] mt-4 transition-colors hover:underline"
                >
                  ← Continue Shopping
                </Link>

                {/* Trust Footer */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">🛡️</span>
                    <span className="text-[10px] font-semibold text-slate-500 leading-tight">100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">🔒</span>
                    <span className="text-[10px] font-semibold text-slate-500 leading-tight">Safe Checkout</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">⚡</span>
                    <span className="text-[10px] font-semibold text-slate-500 leading-tight">Fast Dispatch</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

