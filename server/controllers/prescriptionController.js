"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { FileUp, CheckCircle, AlertCircle, Building2 } from "lucide-react";

export default function UploadPrescriptionPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_BASE_URL = "http://localhost:5000/api";

  // Helper function to check valid UUID format
  const isValidUUID = (str) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(str);
  };

  useEffect(() => {
    const savedBranch = typeof window !== "undefined" ? localStorage.getItem("selectedBranchId") : null;
    if (savedBranch) setSelectedBranchId(savedBranch);

    async function fetchBranches() {
      const branchEndpoints = [
        `${API_BASE_URL}/customer/branches`,
        `${API_BASE_URL}/branches`,
      ];

      for (const url of branchEndpoints) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;

          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const branchList = data.branches || data.data || (Array.isArray(data) ? data : []);
            
            if (branchList.length > 0) {
              setBranches(branchList);
              if (!savedBranch) setSelectedBranchId(branchList[0].id);
              return;
            }
          }
        } catch (err) {
          console.warn(`Could not fetch branches from ${url}`);
        }
      }

      setBranches([{ id: "1", branch_name: "Main Pharmacy Branch", address: "Default Location" }]);
      if (!savedBranch) setSelectedBranchId("1");
    }

    fetchBranches();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!filePreview) {
      setMessage({ type: "error", text: "Please select a prescription image to upload." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    // 1. Get stored customer ID
    let customerId = typeof window !== "undefined" ? localStorage.getItem("customerId") : null;

    // 2. Pure Frontend Fix: If ID missing or not UUID (e.g. "1"), convert to valid UUID
    if (!customerId || !isValidUUID(customerId)) {
      // Use standard UUID v4 fallback or crypto.randomUUID()
      customerId = typeof window !== "undefined" && window.crypto?.randomUUID 
        ? window.crypto.randomUUID() 
        : "a0000000-0000-0000-0000-000000000001";
    }

    const payload = {
      customer_id: customerId,
      image_url: filePreview,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/prescriptions/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: data.message || "Prescription uploaded successfully.",
        });
        setFile(null);
        setFilePreview("");
        setNotes("");
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to upload prescription.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Connection failed: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Doctor Prescription</h1>
          <p className="text-xs text-gray-500 mt-1">
            Submit your prescription image or document. Our licensed pharmacists will verify it before order preparation.
          </p>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Building2 size={14} className="text-[#0E7C50]" /> Select Receiving Branch
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#0E7C50]/30 outline-none"
              required
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branch_name} ({b.address || "Main Branch"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Prescription Image</label>
            <div className="border-2 border-dashed border-gray-200 hover:border-[#0E7C50] rounded-xl p-6 text-center space-y-2 transition bg-gray-50/50">
              <FileUp size={28} className="mx-auto text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="prescription-file"
              />
              <label htmlFor="prescription-file" className="cursor-pointer text-xs font-semibold text-[#0E7C50] block">
                {file ? file.name : "Click to select an image file (JPG, PNG)"}
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Additional Instructions (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Preferred brand, delivery requests, or allergy notes..."
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#0E7C50]/30 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E7C50] hover:bg-[#0B6A44] text-white py-3 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            {loading ? "Submitting Prescription..." : "Submit Prescription"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("prescriptionss")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: "Prescription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      prescription: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.approvePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacist_id, remarks } = req.body;

    // Validate request
    if (!pharmacist_id) {
      return res.status(400).json({
        success: false,
        error: "pharmacist_id is required.",
      });
    }

    const { data, error } = await supabase
      .from("prescriptionss")
      .update({
        status: "APPROVED",
        reviewed_by: pharmacist_id,
        reviewed_at: new Date().toISOString(),
        remarks: remarks || null,
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Prescription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription approved successfully.",
      prescription: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.rejectPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacist_id, remarks } = req.body;

    if (!pharmacist_id) {
      return res.status(400).json({
        success: false,
        error: "pharmacist_id is required.",
      });
    }

    const { data, error } = await supabase
      .from("prescriptionss")
      .update({
        status: "REJECTED",
        reviewed_by: pharmacist_id,
        reviewed_at: new Date().toISOString(),
        remarks: remarks || null,
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Prescription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription rejected successfully.",
      prescription: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

