const supabase = require("../config/supabase");

exports.getPendingPrescriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptionss")
      .select("*")
      .eq("status", "PENDING")
      .order("uploaded_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

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