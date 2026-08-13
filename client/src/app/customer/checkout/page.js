'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';

export default function CustomerCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, cartTotal, clearCart, attachedPrescription, setAttachedPrescription } = useCart();
  const { selectedBranchId, selectedBranch, branches } = useBranch();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userPrescriptions, setUserPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(false);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const requiresRx = items.some(item => item.requires_prescription);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/customer/checkout');
      return;
    }
    if (user) {
      fetchAddresses();
      if (requiresRx) {
        fetchPrescriptions();
      }
    }
  }, [user, authLoading, requiresRx]);

  async function fetchAddresses() {
    try {
      const res = await api.get('/api/addresses');
      setAddresses(res.data || []);
      const def = res.data?.find(a => a.is_default);
      if (def) setSelectedAddress(def.id);
      else if (res.data?.length > 0) setSelectedAddress(res.data[0].id);
    } catch { /* empty */ }
  }

  async function fetchPrescriptions() {
    setLoadingRx(true);
    try {
      const res = await api.get('/api/prescriptions');
      const list = res.data || [];
      setUserPrescriptions(list);
      const approved = list.filter(p => p.status === 'approved');
      if (!attachedPrescription && approved.length > 0) {
        setAttachedPrescription(approved[0]);
      }
    } catch { /* empty */ } finally {
      setLoadingRx(false);
    }
  }

  const delivery_partnerFee = cartTotal >= 500 ? 0 : 49;
  const total = cartTotal + delivery_partnerFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('You must be signed in to place an order.');
      router.push('/auth/login?redirect=/customer/checkout');
      return;
    }

    const activeBranchId = selectedBranchId || (branches.length > 0 ? branches[0].id : null);

    if (!activeBranchId) {
      setError('Please select a branch before placing your order.');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a delivery_partner address.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (requiresRx && (!attachedPrescription || attachedPrescription.status !== 'approved')) {
      setError('An approved prescription is required for one or more medicines in your cart.');
      return;
    }

    setPlacing(true);
    setError('');

    try {
      const orderNumber = `RX-${Date.now().toString(36).toUpperCase()}`;
      const res = await api.post('/api/orders', {
        order_number: orderNumber,
        branch_id: activeBranchId,
        delivery_partner_address_id: selectedAddress,
        prescription_id: attachedPrescription?.id || null,
        subtotal: cartTotal,
        total,
        notes,
        items: items.map(item => ({
          medicine_id: item.id,
          quantity: item.quantity,
          unit_price: item.mrp,
          requires_prescription: item.requires_prescription || false,
        })),
      });

      clearCart();
      router.push(`/customer/orders/${res.data?.id || ''}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading) return null;
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Nothing to checkout</h1>
          <Link href="/customer/medicines" className="text-primary font-medium hover:underline">Browse medicines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Order Summary & Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Branch Selection Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>📍</span> Fulfilling Pharmacy Branch
                </h2>
                <span className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-1 rounded-full">
                  Stock Verified
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{selectedBranch?.name || 'Selected Pharmacy Branch'}</p>
              <p className="text-xs text-gray-500">{selectedBranch?.address}, {selectedBranch?.city}</p>
            </div>

            {/* Prescription Status (if items require Rx) */}
            {requiresRx && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📋</span> Prescription Status
                </h2>

                {attachedPrescription && attachedPrescription.status === 'approved' ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-800 bg-green-200 px-2 py-0.5 rounded uppercase">
                          Approved Prescription Attached
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Uploaded on {new Date(attachedPrescription.uploaded_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <a
                      href={attachedPrescription.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      View File ↗
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      ⚠️ One or more items in your order require a doctor's prescription.
                    </div>
                    {userPrescriptions.filter(p => p.status === 'approved').length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Select an approved prescription:</p>
                        <div className="space-y-2">
                          {userPrescriptions.filter(p => p.status === 'approved').map(rx => (
                            <button
                              key={rx.id}
                              type="button"
                              onClick={() => setAttachedPrescription(rx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition-colors ${attachedPrescription?.id === rx.id ? 'border-primary bg-primary-lighter font-semibold' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              <span>Uploaded {new Date(rx.uploaded_at).toLocaleDateString('en-IN')}</span>
                              <span className="text-primary font-bold">Select</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-gray-500">No approved prescription found on file.</p>
                        <Link
                          href="/customer/prescriptions"
                          className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Upload Prescription 📤
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* delivery_partner address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">delivery_partner Address</h2>
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary bg-primary-lighter' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 accent-[#0d7c42]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{addr.label || 'Address'} {addr.is_default && <span className="text-xs text-primary">(Default)</span>}</p>
                        <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-sm text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p className="mb-2">No saved addresses.</p>
                  <Link href="/customer/profile" className="text-primary font-medium hover:underline text-sm">Add an address</Link>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Order Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for pharmacy delivery_partner? (optional)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary resize-none h-24"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="min-w-0 mr-2">
                      <p className="text-gray-800 font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} {item.requires_prescription && <span className="text-info font-bold">(Rx)</span>}</p>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0">₹{(item.mrp * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-100 mb-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">delivery_partner</span><span className="text-primary font-medium">{delivery_partnerFee === 0 ? 'Free' : `₹${delivery_partnerFee}`}</span></div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing || (requiresRx && (!attachedPrescription || attachedPrescription.status !== 'approved'))}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl mt-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
