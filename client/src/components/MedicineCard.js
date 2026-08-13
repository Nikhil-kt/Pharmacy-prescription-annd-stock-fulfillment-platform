'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function MedicineCard({ medicine }) {
  const { addItem, buyNow } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [loadingBuy, setLoadingBuy] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [userPrescriptions, setUserPrescriptions] = useState([]);
  const [modalMode, setModalMode] = useState('checking'); // 'checking' | 'select' | 'no_approved'
  const [imgError, setImgError] = useState(false);

  // Stable discount rate per medicine to prevent flickering across renders
  let idNum = 1;
  if (typeof medicine.id === 'number') {
    idNum = medicine.id;
  } else if (typeof medicine.id === 'string') {
    idNum = medicine.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }
  const discount = medicine.discount || ((idNum * 7) % 15 + 5);
  const mrpNum = Number(medicine.mrp) || 0;
  const originalPrice = (mrpNum / (1 - discount / 100)).toFixed(2);
  const savings = (parseFloat(originalPrice) - mrpNum).toFixed(2);

  // Determine real image URL or fallback
  const medicineImage = !imgError && (medicine.image_url || medicine.image || medicine.photo_url);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/auth/login?redirect=/customer/cart');
      return;
    }
    addItem(medicine);
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (medicine.branch_stock !== undefined && !medicine.in_stock) return;

    if (!user) {
      router.push('/auth/login?redirect=/customer/checkout');
      return;
    }

    if (!medicine.requires_prescription) {
      buyNow(medicine, 1, null);
      router.push('/customer/checkout');
      return;
    }

    // Medicine requires prescription -> check user prescriptions
    setLoadingBuy(true);
    setModalMode('checking');
    setShowRxModal(true);

    try {
      const res = await api.get('/api/prescriptions');
      const list = res.data || [];
      setUserPrescriptions(list);

      const approvedList = list.filter(p => p.status === 'approved');

      if (approvedList.length > 0) {
        if (approvedList.length === 1) {
          // Auto select single approved prescription and proceed
          buyNow(medicine, 1, approvedList[0]);
          router.push('/customer/checkout');
        } else {
          setModalMode('select');
        }
      } else {
        setModalMode('no_approved');
      }
    } catch (err) {
      setModalMode('no_approved');
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleSelectApprovedRx = (e, rx) => {
    e.preventDefault();
    e.stopPropagation();
    buyNow(medicine, 1, rx);
    setShowRxModal(false);
    router.push('/customer/checkout');
  };

  const isOutOfStock = medicine.branch_stock !== undefined && !medicine.in_stock;

  const handleCardClick = (e) => {
    // Navigate to medicine details page
    router.push(`/customer/medicines/${medicine.id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group bg-white border border-slate-200/80 rounded-[22px] p-4 sm:p-5 hover:shadow-xl hover:shadow-teal-900/5 hover:border-[#0D9488]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden cursor-pointer"
      >
        
        {/* Prescription Required Badge (Top Left) */}
        {medicine.requires_prescription && (
          <span className="absolute top-3 left-3 z-10 bg-sky-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-sky-400/20">
            <svg className="w-3 h-3 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Rx Req
          </span>
        )}

        {/* Discount Badge (Top Right) */}
        <span className="absolute top-3 right-3 z-10 bg-[#0D9488] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm border border-emerald-400/20">
          -{discount}%
        </span>

        {/* Product Image Area */}
        <div className="relative bg-gradient-to-b from-slate-50 to-emerald-50/20 rounded-2xl p-4 mb-3.5 aspect-square flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-emerald-100 transition-colors">
          {medicineImage ? (
            <img
              src={medicineImage}
              alt={medicine.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-100/60 rounded-xl p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <div className="w-13 h-13 rounded-2xl bg-white/90 shadow-sm border border-emerald-100 flex items-center justify-center text-3xl mb-1.5 group-hover:rotate-6 transition-transform">
                💊
              </div>
              <span className="text-[10px] font-bold text-[#0D9488] bg-teal-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {medicine.category || 'Medicine'}
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#0D9488] transition-colors leading-snug">
              {medicine.name}
            </h3>
            <p className="text-xs text-gray-500 font-normal mb-2 flex items-center gap-1">
              <span>{medicine.manufacturer ? `by ${medicine.manufacturer}` : (medicine.pack_size || medicine.unit || 'Standard Pack')}</span>
            </p>
          </div>

          {/* Pricing & Stock Status */}
          <div className="mt-2 pt-2.5 border-t border-slate-100">
            {/* Branch Stock Indicator */}
            {medicine.branch_stock !== undefined && (
              <div className="mb-2">
                {medicine.in_stock ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({medicine.branch_stock} available)
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price Box */}
            <div className="flex flex-wrap items-baseline gap-1.5 mb-3">
              <span className="text-base font-extrabold text-gray-900">
                ₹{Number(medicine.mrp).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through font-normal">
                ₹{originalPrice}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 ml-auto">
                Save ₹{savings}
              </span>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-[#0D9488] text-[#0D9488] hover:text-white font-semibold text-xs py-2.5 px-2 rounded-xl transition-all duration-200 border border-emerald-200/80 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Cart"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span>Add</span>
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock || loadingBuy}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#0D9488] via-[#0284C7] to-[#2563EB] hover:from-[#0F766E] hover:to-[#1D4ED8] text-white font-semibold text-xs py-2.5 px-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-700/15 transform active:scale-95"
                title="Buy Now"
              >
                {loadingBuy ? (
                  <span className="animate-spin text-xs">🌀</span>
                ) : (
                  <>
                    <span>Buy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Verification Modal */}
      {showRxModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRxModal(false); }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center text-xl border border-teal-100">
                  📋
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Prescription Verification</h3>
                  <p className="text-xs text-gray-500">{medicine.name}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRxModal(false); }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {modalMode === 'checking' && (
              <div className="py-8 text-center space-y-3">
                <div className="animate-spin text-3xl text-[#0D9488] inline-block">⏳</div>
                <p className="text-sm font-medium text-gray-600">Verifying prescription records...</p>
              </div>
            )}

            {modalMode === 'select' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Select an approved prescription to proceed with your order for <strong>{medicine.name}</strong>:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userPrescriptions.filter(p => p.status === 'approved').map((rx) => (
                    <div
                      key={rx.id}
                      onClick={(e) => handleSelectApprovedRx(e, rx)}
                      className="p-3 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 rounded-2xl cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-gray-800">
                          Uploaded {new Date(rx.uploaded_at).toLocaleDateString('en-IN')}
                        </span>
                        {rx.notes && <p className="text-[11px] text-gray-500">{rx.notes}</p>}
                      </div>
                      <span className="text-xs font-bold text-[#0D9488] bg-emerald-100 px-2.5 py-1 rounded-full">
                        Use Approved Rx →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalMode === 'no_approved' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs leading-relaxed">
                  ⚠️ <strong>Prescription Required:</strong> <em>{medicine.name}</em> is a prescription-only medication. You must have an approved prescription on file before completing the purchase.
                </div>

                {userPrescriptions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Your uploaded prescriptions:</p>
                    {userPrescriptions.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-600">Uploaded {new Date(p.uploaded_at).toLocaleDateString('en-IN')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowRxModal(false);
                      router.push('/customer/prescriptions');
                    }}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs py-3 rounded-2xl transition-colors text-center shadow-md shadow-teal-700/20"
                  >
                    Upload Prescription 📤
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRxModal(false); }}
                    className="px-4 bg-gray-100 text-gray-600 font-semibold text-xs py-3 rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
