"use client";

import { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { uploadPrescription } from "../api";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";

export default function PrescriptionUploadPage() {
  const [customerId, setCustomerId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  // Preset sample Rx image URLs for quick demo convenience
  const sampleImages = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId.trim()) {
      setError("Please enter a valid Customer ID (e.g. CUST101 or UUID).");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Please provide a prescription image URL or select a sample image.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessResult(null);

      const res = await uploadPrescription({
        customer_id: customerId.trim(),
        image_url: imageUrl.trim(),
      });

      if (res.success) {
        setSuccessResult(res.prescription || res);
        // Save to local session upload list
        if (typeof window !== "undefined") {
          const uploads = JSON.parse(localStorage.getItem("rxconnect_user_prescriptions") || "[]");
          uploads.unshift(res.prescription || res);
          localStorage.setItem("rxconnect_user_prescriptions", JSON.stringify(uploads));
        }
      } else {
        setError(res.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Prescription upload error:", err);
      setError(err.message || "Failed to submit prescription to server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <header className="bg-[#0E7C50] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-3 backdrop-blur-sm">
            <Upload size={32} className="text-emerald-200" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Digital Prescription Upload
          </h1>
          <p className="mt-2 text-sm text-emerald-100 max-w-xl mx-auto">
            Upload your doctor's prescription for quick verification and fulfillment by our licensed pharmacists.
          </p>
        </div>
      </header>

      {/* Main Upload Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10">
          {/* Success Notification Banner */}
          {successResult && (
            <div className="mb-8 bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-emerald-900 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-[#0E7C50] shrink-0" />
                <div>
                  <h3 className="font-bold text-base text-emerald-900">
                    Prescription Uploaded Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Your prescription has been logged and assigned status:{" "}
                    <span className="font-extrabold uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                      {successResult.status || "PENDING"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-xs bg-white/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                <p>
                  <strong>Prescription ID:</strong> {successResult.id || "N/A"}
                </p>
                <p>
                  <strong>Customer ID:</strong> {successResult.customer_id}
                </p>
                <p>
                  <strong>Uploaded At:</strong>{" "}
                  {new Date(successResult.uploaded_at || Date.now()).toLocaleString()}
                </p>
              </div>

              <p className="text-xs text-emerald-800 italic">
                Our pharmacists will review your prescription shortly. You can track this in Order Status.
              </p>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900 text-xs">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="customer-id-input" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} className="text-[#0E7C50]" /> Customer ID <span className="text-red-500">*</span>
              </label>
              <input
                id="customer-id-input"
                type="text"
                required
                placeholder="Enter your Customer ID (e.g. CUST-1001 or 12345)..."
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#0E7C50] focus:bg-white focus:outline-none transition-all"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Required by pharmacy regulations to link prescription to your profile.
              </span>
            </div>

            <div>
              <label htmlFor="prescription-url-input" className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#0E7C50]" /> Prescription Image URL <span className="text-red-500">*</span>
              </label>
              <input
                id="prescription-url-input"
                type="url"
                required
                placeholder="https://example.com/prescription-sample.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#0E7C50] focus:bg-white focus:outline-none transition-all"
              />

              {/* Sample Selector helper */}
              <div className="mt-3">
                <span className="text-[11px] text-gray-500 font-semibold block mb-1.5">
                  Or select a sample prescription image for demo:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        imageUrl === img
                          ? "bg-[#0E7C50] text-white border-[#0E7C50]"
                          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      Sample Rx #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Image Preview */}
            {imageUrl && (
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Image Preview</span>
                <div className="relative h-48 w-full max-w-md rounded-xl overflow-hidden border border-gray-300 bg-gray-200">
                  <img
                    src={imageUrl}
                    alt="Prescription Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Verification Checklist */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-[#0E7C50]">
                <ShieldCheck size={16} /> Guidelines for Valid Upload
              </h4>
              <ul className="list-disc list-inside space-y-1 text-emerald-800">
                <li>Doctor's name, license number, and signature must be clearly visible.</li>
                <li>Patient name and date of issue should match your order.</li>
                <li>Ensure the image is well-lit and not blurry.</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-[#0E7C50] text-white font-bold text-sm rounded-xl hover:bg-[#0B6A44] transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Uploading & Processing...
                </>
              ) : (
                <>
                  <Upload size={18} /> Submit Prescription (POST /api/prescriptions/upload)
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}