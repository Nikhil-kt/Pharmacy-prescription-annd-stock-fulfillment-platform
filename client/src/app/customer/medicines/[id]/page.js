'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';
import { useAuth } from '@/context/AuthContext';

export default function CustomerMedicineDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, buyNow } = useCart();
  const { selectedBranchId, selectedBranch, selectBranch } = useBranch();

  const [medicine, setMedicine] = useState(null);
  const [substitutes, setSubstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Prescription modal state
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [userPrescriptions, setUserPrescriptions] = useState([]);
  const [modalMode, setModalMode] = useState('checking');

  useEffect(() => {
    async function fetch() {
      try {
        const branchParam = selectedBranchId ? `?branch_id=${selectedBranchId}` : '';
        const [medRes, subRes] = await Promise.all([
          api.get(`/api/medicines/${id}${branchParam}`),
          api.get(`/api/medicine-substitutes/${id}`).catch(() => ({ data: [] })),
        ]);
        setMedicine(medRes.data);
        setSubstitutes(subRes.data || []);
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id, selectedBranchId]);

  const handleAddToCart = () => {
    if (medicine) {
      addItem(medicine, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!medicine) return;

    if (!user) {
      router.push('/auth/login?redirect=/customer/checkout');
      return;
    }

    if (!medicine.requires_prescription) {
      buyNow(medicine, qty, null);
      router.push('/customer/checkout');
      return;
    }

    // Prescription required check
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
          buyNow(medicine, qty, approvedList[0]);
          router.push('/customer/checkout');
        } else {
          setModalMode('select');
        }
      } else {
        setModalMode('no_approved');
      }
    } catch {
      setModalMode('no_approved');
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleSelectApprovedRx = (rx) => {
    buyNow(medicine, qty, rx);
    setShowRxModal(false);
    router.push('/customer/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-gray-200 rounded-2xl aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded w-1/3 mt-6" />
            <div className="h-10 bg-gray-200 rounded w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-24 text-gray-400">
        <div className="text-6xl mb-4">💊</div>
        <p className="text-xl font-semibold">Medicine not found</p>
        <Link href="/customer/medicines" className="text-primary font-medium mt-2 inline-block hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const isCurrentBranchInStock = medicine.branch_stock?.in_stock;
  const availableInOtherBranches = medicine.all_branch_inventory?.filter(
    inv => inv.quantity > 0 && inv.branch_id !== selectedBranchId
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/customer/medicines" className="hover:text-primary">Medicines</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{medicine.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center shadow-sm relative min-h-[300px]">
            {medicine.requires_prescription && (
              <span className="absolute top-4 left-4 z-10 bg-info text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                💊 Prescription Required
              </span>
            )}
            {medicine.image_url ? (
              <img src={medicine.image_url} alt={medicine.name} className="max-h-72 object-contain" />
            ) : (
              <div className="text-9xl opacity-40">💊</div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{medicine.name}</h1>
            {medicine.generic_name && (
              <p className="text-sm text-gray-500 mb-1">Generic: {medicine.generic_name}</p>
            )}
            {medicine.manufacturer && (
              <p className="text-sm text-gray-500 mb-4">by {medicine.manufacturer}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{Number(medicine.mrp).toFixed(2)}</span>
              <span className="text-sm text-gray-400">MRP (incl. of all taxes)</span>
            </div>

            {/* Branch Stock Availability Card */}
            {medicine.branch_stock && (
              <div className={`p-4 rounded-xl mb-6 border ${isCurrentBranchInStock ? 'bg-green-50/60 border-green-200' : 'bg-red-50/60 border-red-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {selectedBranch ? selectedBranch.name : 'Selected Branch'} Availability
                      </p>
                      <p className="text-xs text-gray-600">
                        {isCurrentBranchInStock ? 'In Stock' : 'Out of stock at this branch'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${isCurrentBranchInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {isCurrentBranchInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* If out of stock at current branch, but available elsewhere */}
                {!isCurrentBranchInStock && availableInOtherBranches && availableInOtherBranches.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-200/60">
                    <p className="text-xs font-semibold text-gray-800 mb-2">
                      💡 Available at other nearby branches:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableInOtherBranches.map(inv => (
                        <button
                          key={inv.id}
                          onClick={() => selectBranch(inv.branch_id)}
                          className="bg-white hover:bg-primary hover:text-white border border-primary/30 text-primary font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <span>🏬 {inv.branch?.name} (In Stock)</span>
                          <span className="text-[10px] underline">Select Branch</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-500 hover:text-primary font-bold">−</button>
                <span className="px-4 py-2 font-semibold text-gray-800 border-x border-gray-200">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-500 hover:text-primary font-bold">+</button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={medicine.branch_stock && !isCurrentBranchInStock}
                className={`w-full sm:w-1/2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${added
                    ? 'bg-success text-white'
                    : 'bg-primary-light text-primary hover:bg-primary hover:text-white'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {added ? '✓ Added to Cart' : !isCurrentBranchInStock ? 'Out of Stock at Branch' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={medicine.branch_stock && !isCurrentBranchInStock || loadingBuy}
                className="w-full sm:w-1/2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingBuy ? (
                  <span className="animate-spin">🌀 Verifying...</span>
                ) : (
                  <>

                    <span>Buy Now</span>
                  </>
                )}
              </button>
            </div>

            {/* All Branches Availability Breakdown */}
            {medicine.all_branch_inventory && medicine.all_branch_inventory.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Branch Availability Breakdown</h3>
                <div className="space-y-2.5">
                  {medicine.all_branch_inventory.map((inv) => {
                    const isSelected = inv.branch_id === selectedBranchId;
                    return (
                      <div
                        key={inv.id}
                        onClick={() => selectBranch(inv.branch_id)}
                        className={`flex items-center justify-between text-xs p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-primary-lighter/40 border-primary font-medium' : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        title="Click to select this branch"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏥</span>
                          <div>
                            <span className="font-semibold text-gray-800 block">
                              {inv.branch?.name || 'Branch'} ({inv.branch?.city || 'Location'})
                              {isSelected && <span className="ml-1 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Active</span>}
                            </span>
                            <span className="text-[11px] text-gray-500">{inv.branch?.address}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${inv.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {inv.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details table */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Product Details</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {medicine.category && <><dt className="text-gray-500">Category</dt><dd className="font-medium text-gray-800">{medicine.category}</dd></>}
                {medicine.unit && <><dt className="text-gray-500">Unit</dt><dd className="font-medium text-gray-800">{medicine.unit}</dd></>}
                {medicine.pack_size && <><dt className="text-gray-500">Pack Size</dt><dd className="font-medium text-gray-800">{medicine.pack_size}</dd></>}
              </dl>
            </div>

            {medicine.description && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{medicine.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Substitutes */}
        {substitutes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Substitute Medicines</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {substitutes.map((sub) => (
                <Link key={sub.id} href={`/customer/medicines/${sub.substitute?.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-semibold text-gray-800">{sub.substitute?.name}</h4>
                  <p className="text-xs text-gray-500">{sub.substitute?.manufacturer}</p>
                  <p className="text-base font-bold text-gray-900 mt-2">₹{Number(sub.substitute?.mrp || 0).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prescription Check Modal */}
      {showRxModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRxModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center text-xl">
                  📋
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Prescription Verification</h3>
                  <p className="text-xs text-gray-500">{medicine.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {modalMode === 'checking' && (
              <div className="py-8 text-center space-y-3">
                <div className="animate-spin text-3xl text-primary inline-block">⏳</div>
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
                      onClick={() => handleSelectApprovedRx(rx)}
                      className="p-3 border border-green-200 bg-green-50/50 hover:bg-green-100/60 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-gray-800">
                          Uploaded {new Date(rx.uploaded_at).toLocaleDateString('en-IN')}
                        </span>
                        {rx.notes && <p className="text-[11px] text-gray-500">{rx.notes}</p>}
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                        Use Approved Rx →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalMode === 'no_approved' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800 text-xs leading-relaxed">
                  ⚠️ <strong>Prescription Required:</strong> <em>{medicine.name}</em> is a prescription-only medication. You must have an approved prescription on file before completing the purchase.
                </div>

                {userPrescriptions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Your uploaded prescriptions:</p>
                    {userPrescriptions.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-600">Uploaded {new Date(p.uploaded_at).toLocaleDateString('en-IN')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-700' :
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
                    onClick={() => {
                      setShowRxModal(false);
                      router.push('/customer/prescriptions');
                    }}
                    className="flex-1 bg-primary text-white font-semibold text-xs py-2.5 rounded-xl hover:bg-primary-dark transition-colors text-center"
                  >
                    Upload Prescription 📤
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRxModal(false)}
                    className="px-4 bg-gray-100 text-gray-600 font-semibold text-xs py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
