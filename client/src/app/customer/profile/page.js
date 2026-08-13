'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';

export default function CustomerProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { branches, selectBranch } = useBranch();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddr, setShowAddAddr] = useState(false);

  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrMsg, setAddrMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/customer/profile');
      return;
    }
    if (profile || user) {
      setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
      setPhone(profile?.phone || user?.user_metadata?.phone || '');
      setEmail(profile?.email || user?.email || '');
      setBranchId(profile?.branch_id || '');
    }
    if (user) {
      fetchAddresses();
    }
  }, [user, profile, authLoading]);

  async function fetchAddresses() {
    setLoadingAddresses(true);
    try {
      const res = await api.get('/api/addresses');
      setAddresses(res.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await api.put('/api/profiles/me', { full_name: fullName, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddr(true);
    setAddrMsg({ type: '', text: '' });
    try {
      await api.post('/api/addresses', newAddr);
      setAddrMsg({ type: 'success', text: 'Address added successfully!' });
      setShowAddAddr(false);
      setNewAddr({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false });
      fetchAddresses();
    } catch (err) {
      setAddrMsg({ type: 'error', text: err.message || 'Failed to add address.' });
    } finally {
      setAddingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.patch(`/api/addresses/${id}/default`);
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to set default address.');
    }
  };

  if (authLoading || !user) return null;

  // Extract initials for avatar emblem
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RX';

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-700">My Account</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#044E3B] to-[#0D9488] text-white flex items-center justify-center text-xl font-black shadow-md shadow-teal-900/20 shrink-0">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Account</h1>
                <p className="text-xs text-slate-500 mt-0.5">Manage your personal details and saved delivery addresses</p>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold capitalize">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {profile?.role || user?.user_metadata?.role || 'Customer'} Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Personal Details Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Personal Details</h2>
              </div>

              {profileMsg.text && (
                <div
                  className={`text-xs px-4 py-3 rounded-xl mb-5 font-semibold flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span>{profileMsg.type === 'success' ? '✓' : '⚠️'}</span>
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email Address (Replaces Education) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-slate-400 font-normal">Primary Login</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      title="Email address is associated with your account login"
                      className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-mono text-slate-600 outline-none cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      🔒
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-[#0D9488] focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* Role Tag */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Account Role</span>
                  <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3 py-1 rounded-lg capitalize">
                    {profile?.role || user?.user_metadata?.role || 'Customer'}
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full bg-gradient-to-r from-[#044E3B] to-[#0D9488] hover:from-[#033B2C] hover:to-[#0B7A70] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md shadow-teal-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Right Column: Address Book */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0D9488]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Saved Addresses</h2>
                    <p className="text-xs text-slate-400">Manage delivery locations for quick checkout</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddAddr(!showAddAddr)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    showAddAddr
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-[#044E3B] hover:text-white hover:border-[#044E3B]'
                  }`}
                >
                  {showAddAddr ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {addrMsg.text && (
                <div
                  className={`text-xs px-4 py-3 rounded-xl mb-5 font-semibold flex items-center gap-2 ${
                    addrMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span>{addrMsg.type === 'success' ? '✓' : '⚠️'}</span>
                  <span>{addrMsg.text}</span>
                </div>
              )}

              {/* Add Address Form Box */}
              {showAddAddr && (
                <form onSubmit={handleAddAddress} className="bg-slate-50/80 p-5 rounded-2xl mb-6 border border-slate-200/90 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">New Delivery Address</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Address Label</label>
                      <input
                        type="text"
                        placeholder="Label (e.g. Home, Work, Clinic)"
                        value={newAddr.label}
                        onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        placeholder="Street name, house no, apartment *"
                        value={newAddr.line1}
                        onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        placeholder="Landmark, suite, area"
                        value={newAddr.line2}
                        onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="City *"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode *</label>
                      <input
                        type="text"
                        placeholder="Pincode *"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={newAddr.is_default}
                      onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                      className="w-4 h-4 accent-[#0D9488] rounded cursor-pointer"
                    />
                    <label htmlFor="is_default" className="text-xs text-slate-700 font-semibold cursor-pointer">
                      Set as default delivery address
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={addingAddr}
                      className="bg-[#044E3B] hover:bg-[#033B2C] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-900/10 transition-colors"
                    >
                      {addingAddr ? 'Saving Address...' : 'Save New Address'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Address Cards */}
              {loadingAddresses ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 bg-slate-100 rounded-2xl" />
                  <div className="h-20 bg-slate-100 rounded-2xl" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white ${
                        addr.is_default
                          ? 'border-emerald-300 ring-1 ring-emerald-100 shadow-sm'
                          : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{addr.label || 'Address'}</span>
                          {addr.is_default && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Default Address
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {addr.city}
                          {addr.state ? `, ${addr.state}` : ''} — <span className="font-mono">{addr.pincode}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-semibold text-[#0D9488] hover:text-[#044E3B] hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="text-3xl mb-2">📍</div>
                  <p className="text-xs font-semibold text-slate-500">No saved addresses yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Add an address above to save time during checkout.</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

