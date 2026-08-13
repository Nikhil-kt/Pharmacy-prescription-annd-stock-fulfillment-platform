'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CustomerPrescriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      fetchPrescriptions();
    }
  }, [user, authLoading]);

  // Generate preview when file changes
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    if (selectedFile.type === 'application/pdf') {
      setPreview('pdf');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  async function fetchPrescriptions() {
    setLoading(true);
    try {
      const res = await api.get('/api/prescriptions');
      setPrescriptions(res.data || []);
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }

  const handleFileSelect = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setMsg({ type: 'error', text: 'Only JPEG, PNG, WebP, or PDF files are allowed.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'File size must be under 5 MB.' });
      return;
    }
    setSelectedFile(file);
    setMsg({ type: '', text: '' });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMsg({ type: 'error', text: 'Please select a prescription image or PDF.' });
      return;
    }

    setUploading(true);
    setMsg({ type: '', text: '' });

    try {
      // Step 1: Upload file to server -> Supabase Storage
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const uploadRes = await fetch(`${apiBase}/api/upload/prescription`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'File upload failed.');
      }

      // Step 2: Create the prescription record with the returned URL
      await api.post('/api/prescriptions', {
        file_url: uploadData.file_url,
        notes,
      });

      setMsg({ type: 'success', text: 'Prescription uploaded successfully for verification!' });
      setSelectedFile(null);
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPrescriptions();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (authLoading) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      
      {/* ═══════════ HERO BANNER ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 pt-6 md:pt-8">
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-[#F0FDF4] to-slate-50 p-6 md:p-10 shadow-sm">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-3">
                <span>📋 Prescription Desk</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-2">
                Upload &amp; Manage <span className="text-[#0D9488]">Prescriptions</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Upload your doctor's prescription for rapid verification by our licensed pharmacists. We ensure 100% genuine medicines delivered straight to your door.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-[10px] font-bold">⚕️</span>
                  <span>Licensed Pharmacist Review</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-[10px] font-bold">⚡</span>
                  <span>Express Dispatch</span>
                </div>
              </div>
            </div>

            {/* Banner Quick Stats / Illustration box */}
            <div className="hidden lg:flex items-center gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0284C7] text-white flex items-center justify-center text-2xl shadow-md shadow-teal-700/20">
                📄
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Uploads</p>
                <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">{prescriptions.length}</p>
                <p className="text-[11px] text-[#0D9488] font-medium mt-1">Verified &amp; Stored Securely</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MAIN CONTENT GRID ═══════════ */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* UPLOAD FORM (Left Sidebar / Column) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] sticky top-28">
              
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D9488] flex items-center justify-center text-xl shrink-0 font-bold border border-emerald-100">
                  📤
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">Upload Prescription</h2>
                  <p className="text-xs text-gray-500">Attach photo or PDF for fulfillment</p>
                </div>
              </div>

              {msg.text && (
                <div
                  className={`text-xs p-3 rounded-xl mb-5 flex items-start gap-2 border animate-fade-in ${
                    msg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span className="text-sm font-bold shrink-0">{msg.type === 'success' ? '✓' : '⚠️'}</span>
                  <p className="font-medium leading-relaxed">{msg.text}</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-5">
                {/* Drag & Drop / Click Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Prescription File <span className="text-rose-500">*</span>
                  </label>

                  {!selectedFile ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`group relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                        dragActive
                          ? 'border-[#0D9488] bg-emerald-100/50 shadow-inner'
                          : 'border-emerald-200/80 hover:border-[#0D9488] bg-emerald-50/30 hover:bg-emerald-50/70'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#0D9488] flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs border border-emerald-100 group-hover:scale-110 transition-transform">
                        📁
                      </div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#0D9488] transition-colors">
                        Click to upload or drag &amp; drop
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        JPEG, PNG, WebP or PDF
                      </p>
                      <div className="inline-block mt-3 px-2.5 py-1 bg-white/90 border border-gray-200/80 rounded-md text-[10px] text-gray-500 font-semibold uppercase tracking-wider shadow-2xs">
                        Max file size: 5 MB
                      </div>
                    </div>
                  ) : (
                    /* Selected File Preview Card */
                    <div className="relative border border-emerald-200/80 bg-emerald-50/20 rounded-2xl overflow-hidden p-3 transition-all">
                      {preview === 'pdf' ? (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0 font-bold">
                            📄
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB • PDF Document</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative rounded-xl overflow-hidden bg-slate-900/5 aspect-4/3 flex items-center justify-center border border-gray-200/60">
                            <img
                              src={preview}
                              alt="Prescription preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="px-1 py-0.5 flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{selectedFile.name}</p>
                            <span className="text-[10px] text-gray-400 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Doctor / Patient Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="E.g. Call before delivery partner, 10-day dosage, preferred brand..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 focus:bg-white border border-gray-200 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 rounded-xl text-xs text-gray-800 outline-none transition-all resize-none placeholder:text-gray-400 font-medium leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-gradient-to-r from-[#0D9488] via-[#0284C7] to-[#2563EB] hover:from-[#0F766E] hover:to-[#1D4ED8] text-white font-semibold text-sm py-3 rounded-xl shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Uploading Prescription...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Prescription</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Security Banner */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2.5 text-[11px] text-gray-500 font-medium">
                <span className="text-emerald-600 text-sm">🔒</span>
                <span>Your medical records are encrypted &amp; stored safely.</span>
              </div>
            </div>
          </div>

          {/* PRESCRIPTION HISTORY LIST (Right Column) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Prescription History</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Track review status and view uploaded documents</p>
                </div>
                
                <span className="bg-emerald-50 text-[#0D9488] font-bold text-xs px-3 py-1 rounded-full border border-emerald-100">
                  {prescriptions.length} {prescriptions.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50 animate-pulse space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-5 bg-gray-200 rounded-full w-20" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((p) => {
                    const statusConfig = {
                      approved: {
                        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                        icon: '✓',
                        label: 'Approved'
                      },
                      rejected: {
                        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
                        icon: '✕',
                        label: 'Rejected'
                      },
                      pending: {
                        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
                        icon: '⏳',
                        label: 'Under Review'
                      }
                    };
                    const config = statusConfig[p.status?.toLowerCase()] || statusConfig.pending;

                    return (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl border border-gray-200/70 hover:border-emerald-200 bg-white hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <span className="text-gray-400">📅</span>
                              Uploaded {new Date(p.uploaded_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>

                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${config.bg}`}>
                              <span>{config.icon}</span>
                              <span>{p.status || 'Pending'}</span>
                            </span>
                          </div>

                          {p.notes && (
                            <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-gray-600 border border-slate-100 font-normal leading-relaxed flex items-start gap-2">
                              <span className="text-gray-400 shrink-0 mt-0.5">💬</span>
                              <span className="italic">"{p.notes}"</span>
                            </div>
                          )}

                          {p.rejection_reason && (
                            <div className="bg-rose-50/80 rounded-xl p-2.5 text-xs text-rose-700 border border-rose-100 font-medium leading-relaxed flex items-start gap-2">
                              <span className="shrink-0 mt-0.5">⚠️</span>
                              <span>Rejection Reason: {p.rejection_reason}</span>
                            </div>
                          )}

                          {p.reviewer?.full_name && (
                            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                              <span className="text-teal-600 font-bold">🧑‍⚕️</span> Reviewed by <span className="font-semibold text-gray-700">{p.reviewer.full_name}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-gray-100 shrink-0">
                          <a
                            href={p.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-[#0D9488] text-[#0D9488] hover:text-white px-4 py-2.5 rounded-xl border border-emerald-200/60 hover:border-[#0D9488] transition-all duration-200 shadow-2xs group/btn w-full sm:w-auto"
                          >
                            <span>View File</span>
                            <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-14 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0D9488] flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
                    📋
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No prescriptions uploaded yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Upload your valid doctor's prescription using the form on the left to request medicine fulfillment.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

