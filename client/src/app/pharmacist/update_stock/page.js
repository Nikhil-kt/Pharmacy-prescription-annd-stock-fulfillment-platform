'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';

export default function UpdateStockPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { branches, selectedBranchId, selectBranch, selectedBranch } = useBranch();
  const router = useRouter();

  const [allMedicines, setAllMedicines] = useState([]);
  const [branchInventory, setBranchInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Mode: 'update' (Update existing medicine inventory) or 'create' (Add new medicine to branch)
  const [formMode, setFormMode] = useState('update');

  // Existing Update Form State
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [lowThreshold, setLowThreshold] = useState('10');
  const [mrp, setMrp] = useState('');
  const [packSize, setPackSize] = useState('');
  const [unit, setUnit] = useState('strip');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Brand New Medicine Creation State
  const [newName, setNewName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newCategory, setNewCategory] = useState('Health Care');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'pharmacist' && profile.role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      loadMedicines();
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (user && selectedBranchId) {
      loadBranchInventory(selectedBranchId);
    } else {
      setBranchInventory([]);
    }
  }, [user, selectedBranchId]);

  async function loadMedicines() {
    try {
      const res = await api.get('/api/medicines', { limit: 100 });
      setAllMedicines(res.data || []);
    } catch (e) {
      console.error('Failed to load medicines list:', e);
    }
  }

  async function loadBranchInventory(bId) {
    setLoading(true);
    try {
      const res = await api.get(`/api/inventory/${bId}`);
      setBranchInventory(res.data || []);
    } catch (e) {
      console.error('Failed to load branch inventory:', e);
      setBranchInventory([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectMedicineForEdit = (medId, currentQty, threshold, medObj) => {
    setFormMode('update');
    setSelectedMedicineId(medId);
    setStockQty(currentQty !== undefined ? currentQty : '0');
    setLowThreshold(threshold !== undefined ? threshold : '10');
    
    if (medObj) {
      setMrp(medObj.mrp !== undefined ? medObj.mrp : '');
      setPackSize(medObj.pack_size || '');
      setUnit(medObj.unit || 'strip');
      setRequiresPrescription(medObj.requires_prescription || false);
      setManufacturer(medObj.manufacturer || '');
      setImageUrl(medObj.image_url || '');
      setDescription(medObj.description || '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler for Updating Existing Medicine Inventory
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      setMsg({ type: 'error', text: 'Please select a branch first.' });
      return;
    }
    if (!selectedMedicineId) {
      setMsg({ type: 'error', text: 'Please select a medicine.' });
      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      // 1. Update Inventory stock for selected branch
      await api.put('/api/inventory', {
        branch_id: selectedBranchId,
        medicine_id: selectedMedicineId,
        quantity: parseInt(stockQty) || 0,
        low_stock_threshold: parseInt(lowThreshold) || 10,
      });

      // 2. Update Medicine details (MRP, pack size, unit, Rx requirement, manufacturer, image_url, description)
      if (mrp !== '') {
        await api.put(`/api/medicines/${selectedMedicineId}`, {
          mrp: parseFloat(mrp),
          pack_size: packSize,
          unit,
          requires_prescription: requiresPrescription,
          manufacturer,
          image_url: imageUrl,
          description,
        });
      }

      setMsg({ type: 'success', text: 'Medicine details & branch stock updated successfully!' });
      loadBranchInventory(selectedBranchId);
      loadMedicines();
      setSelectedMedicineId('');
      setStockQty('');
      setMrp('');
      setManufacturer('');
      setImageUrl('');
      setDescription('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update stock and medicine details.' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Handler for Creating Brand New Medicine & Adding to Branch
  const handleCreateNewMedicine = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      setMsg({ type: 'error', text: 'Please select a branch first.' });
      return;
    }
    if (!newName || mrp === '') {
      setMsg({ type: 'error', text: 'Medicine Name and MRP are required.' });
      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      // 1. Create Medicine in Catalog
      const medRes = await api.post('/api/medicines', {
        name: newName,
        generic_name: newGenericName,
        manufacturer: newManufacturer,
        category: newCategory,
        mrp: parseFloat(mrp),
        pack_size: packSize,
        unit,
        requires_prescription: requiresPrescription,
        image_url: newImageUrl,
        description: newDescription,
      });

      const newMedId = medRes.data?.id;

      if (!newMedId) {
        throw new Error('Failed to obtain new medicine ID.');
      }

      // 2. Add Initial Stock for Selected Branch in branch_inventory
      await api.put('/api/inventory', {
        branch_id: selectedBranchId,
        medicine_id: newMedId,
        quantity: parseInt(stockQty) || 0,
        low_stock_threshold: parseInt(lowThreshold) || 10,
      });

      setMsg({ type: 'success', text: `New medicine "${newName}" created and added to branch inventory!` });
      loadBranchInventory(selectedBranchId);
      loadMedicines();
      
      // Reset Form
      setNewName('');
      setNewGenericName('');
      setNewManufacturer('');
      setNewImageUrl('');
      setNewDescription('');
      setStockQty('');
      setMrp('');
      setPackSize('');
      setFormMode('update');
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create new medicine.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  const categories = ['All', 'Health Care', 'Personal Care', 'Baby Care', 'Wellness', 'Devices'];

  // Filter inventory
  const filteredInventory = branchInventory.filter(item => {
    const med = item.medicine || (Array.isArray(item.medicines) ? item.medicines[0] : item.medicines) || {};
    const matchesSearch = searchQuery === '' || 
      (med.name && med.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.generic_name && med.generic_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = branchInventory.filter(i => i.quantity <= i.low_stock_threshold).length;
  const inStockCount = branchInventory.filter(i => i.quantity > 0).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/pharmacist/dashboard" className="hover:text-primary">Pharmacist Portal</Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Update Branch Stock & Details</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Branch Stock & Medicine Management</h1>
          </div>
          <Link
            href="/pharmacist/dashboard"
            className="text-xs font-bold text-primary bg-primary-light hover:bg-primary hover:text-white px-3.5 py-2 rounded-xl transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Branch Selector Header Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Active Branch Selection</span>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedBranch ? `${selectedBranch.name} (${selectedBranch.city})` : 'No Branch Selected'}
            </h2>
            <p className="text-xs text-gray-500">{selectedBranch?.address || 'Select a branch to manage its stock inventory.'}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold text-gray-700 shrink-0">Select Branch:</label>
            <select
              value={selectedBranchId}
              onChange={(e) => selectBranch(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold px-3.5 py-2 rounded-xl outline-none focus:border-primary w-full md:w-64 cursor-pointer"
            >
              <option value="">Choose Pharmacy Branch...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Items in Branch</p>
            <p className="text-3xl font-bold text-primary mt-1">{branchInventory.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">In-Stock Items</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{inStockCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Mode Selection & Stock / Creation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              {/* Form Mode Toggle Buttons */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => { setFormMode('update'); setMsg({ type: '', text: '' }); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    formMode === 'update'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ✏️ Edit Existing
                </button>
                <button
                  type="button"
                  onClick={() => { setFormMode('create'); setMsg({ type: '', text: '' }); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    formMode === 'create'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ➕ Add New Medicine
                </button>
              </div>

              {msg.text && (
                <div
                  className={`text-xs px-3.5 py-2.5 rounded-xl mb-4 flex items-center gap-2 ${
                    msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <span>{msg.type === 'success' ? '✓' : '⚠️'}</span>
                  <span>{msg.text}</span>
                </div>
              )}

              {/* MODE 1: Update Existing Stock */}
              {formMode === 'update' ? (
                <form onSubmit={handleUpdateStock} className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update Inventory & Specs</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Select Medicine *</label>
                    <select
                      value={selectedMedicineId}
                      onChange={(e) => {
                        const mId = e.target.value;
                        const inv = branchInventory.find(i => i.medicine_id === mId);
                        const medObj = allMedicines.find(m => m.id === mId) || (inv ? (inv.medicine || inv.medicines) : null);
                        handleSelectMedicineForEdit(mId, inv ? inv.quantity : '0', inv ? inv.low_stock_threshold : '10', medObj);
                      }}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary bg-white cursor-pointer font-bold text-gray-900"
                    >
                      <option value="">-- Choose Medicine --</option>
                      {allMedicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.generic_name ? `(${m.generic_name})` : ''} - ₹{m.mrp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity in Stock *</label>
                      <input
                        type="number"
                        min="0"
                        value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                        placeholder="100"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Low Stock Limit</label>
                      <input
                        type="number"
                        min="1"
                        value={lowThreshold}
                        onChange={(e) => setLowThreshold(e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        placeholder="e.g. Cipla Ltd."
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Product description, usage & warnings..."
                      rows="2"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Price / MRP (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        placeholder="49.99"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary bg-white cursor-pointer"
                      >
                        <option value="strip">Strip</option>
                        <option value="bottle">Bottle</option>
                        <option value="pack">Pack</option>
                        <option value="box">Box</option>
                        <option value="tube">Tube</option>
                        <option value="vial">Vial</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pack Size Specification</label>
                    <input
                      type="text"
                      value={packSize}
                      onChange={(e) => setPackSize(e.target.value)}
                      placeholder="e.g. 10 Tablets per Strip"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rx_req"
                      checked={requiresPrescription}
                      onChange={(e) => setRequiresPrescription(e.target.checked)}
                      className="accent-[#0d7c42]"
                    />
                    <label htmlFor="rx_req" className="text-xs text-gray-700 font-semibold cursor-pointer">
                      Requires Doctor Prescription (Rx)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !selectedBranchId}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm"
                  >
                    {saving ? 'Updating Inventory & Specs...' : 'Save Inventory & Medicine Details'}
                  </button>
                </form>
              ) : (
                /* MODE 2: Add Brand New Medicine to Branch Inventory */
                <form onSubmit={handleCreateNewMedicine} className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Add New Medicine to Catalog & Branch</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Cetirizine 10mg"
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Generic Name</label>
                    <input
                      type="text"
                      value={newGenericName}
                      onChange={(e) => setNewGenericName(e.target.value)}
                      placeholder="e.g. Cetirizine Hydrochloride"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={newManufacturer}
                      onChange={(e) => setNewManufacturer(e.target.value)}
                      placeholder="e.g. Sun Pharma / Cipla"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary bg-white cursor-pointer"
                      >
                        <option value="Health Care">Health Care</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Baby Care">Baby Care</option>
                        <option value="Wellness">Wellness</option>
                        <option value="Devices">Devices</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Price / MRP (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        placeholder="49.99"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/medicine.jpg"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Detailed medicine description & directions..."
                      rows="2"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Stock Qty *</label>
                      <input
                        type="number"
                        min="0"
                        value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                        placeholder="100"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Low Stock Limit</label>
                      <input
                        type="number"
                        min="1"
                        value={lowThreshold}
                        onChange={(e) => setLowThreshold(e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary bg-white cursor-pointer"
                      >
                        <option value="strip">Strip</option>
                        <option value="bottle">Bottle</option>
                        <option value="pack">Pack</option>
                        <option value="box">Box</option>
                        <option value="tube">Tube</option>
                        <option value="vial">Vial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Pack Size</label>
                      <input
                        type="text"
                        value={packSize}
                        onChange={(e) => setPackSize(e.target.value)}
                        placeholder="10 Tablets"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rx_req_new"
                      checked={requiresPrescription}
                      onChange={(e) => setRequiresPrescription(e.target.checked)}
                      className="accent-[#0d7c42]"
                    />
                    <label htmlFor="rx_req_new" className="text-xs text-gray-700 font-semibold cursor-pointer">
                      Requires Doctor Prescription (Rx)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !selectedBranchId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm"
                  >
                    {saving ? 'Creating & Adding Stock...' : 'Create & Add to Branch Inventory'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Branch Inventory Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Current Branch Stock Records</h2>
                  <p className="text-xs text-gray-500">
                    {selectedBranch ? `Inventory & Specs for ${selectedBranch.name}` : 'Select a branch above to display inventory.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary w-full md:w-40"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedBranchId ? (
                <div className="py-12 text-center text-gray-400">
                  <span className="text-3xl block mb-2">📍</span>
                  <p className="text-xs font-semibold text-gray-600">Please select a branch from the dropdown above to view stock.</p>
                </div>
              ) : loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-14 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : filteredInventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase">
                        <th className="pb-3 px-2">Medicine Details</th>
                        <th className="pb-3 px-2">MRP & Unit</th>
                        <th className="pb-3 px-2">Quantity</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredInventory.map((item) => {
                        const rawMed = item.medicine || (Array.isArray(item.medicines) ? item.medicines[0] : item.medicines);
                        const fallbackMed = allMedicines.find(m => m.id === item.medicine_id);
                        const med = rawMed || fallbackMed || {};
                        const isLow = item.quantity <= item.low_stock_threshold && item.quantity > 0;
                        const isOut = item.quantity === 0;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-2.5">
                                {med.image_url ? (
                                  <img src={med.image_url} alt={med.name} className="w-8 h-8 object-contain rounded border border-gray-100 bg-gray-50 shrink-0" />
                                ) : (
                                  <span className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm shrink-0">💊</span>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-900 block">{med.name || 'Medicine'}</span>
                                    {med.requires_prescription && (
                                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Rx</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400">
                                    {med.category || 'General'} {med.generic_name ? `• ${med.generic_name}` : ''} {med.manufacturer ? `• Mfr: ${med.manufacturer}` : ''}
                                  </span>
                                  {med.description && (
                                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{med.description}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 font-bold text-gray-800">
                              ₹{Number(med.mrp || 0).toFixed(2)}
                              <span className="text-[10px] text-gray-400 block font-normal">{med.pack_size || med.unit || 'unit'}</span>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className="font-extrabold text-sm text-gray-900">{item.quantity}</span>
                              <span className="text-[10px] text-gray-400 block">Min: {item.low_stock_threshold}</span>
                            </td>
                            <td className="py-3.5 px-2">
                              {isOut ? (
                                <span className="bg-red-50 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-red-200">
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                  Low Stock ({item.quantity})
                                </span>
                              ) : (
                                <span className="bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-green-200">
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => handleSelectMedicineForEdit(item.medicine_id, item.quantity, item.low_stock_threshold, med)}
                                className="text-xs text-primary font-bold hover:underline bg-primary-light px-2.5 py-1 rounded-lg"
                              >
                                Edit Stock ✏️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <span className="text-3xl block mb-2">📋</span>
                  <p className="text-xs font-semibold text-gray-600">No stock records found for this branch.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Use the form on the left to add medicine stock to this branch.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
