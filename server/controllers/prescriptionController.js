const supabase = require("../config/supabase");

// exports.uploadPrescription = async (req, res) => {
//   try {
//     const { order_id, customer_id, image_url } = req.body;

//     const { data, error } = await supabase
//       .from("prescriptions")
//       .insert([
//         {
//           order_id,
//           customer_id,
//           image_url,
//           status: "PENDING",
//         },
//       ])
//       .select();

//     if (error)
//       return res.status(400).json({
//         success: false,
//         error: error.message,
//       });

//     res.status(201).json({
//       success: true,
//       message: "Prescription Uploaded Successfully",
//       prescription: data,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

exports.uploadPrescription = async (req, res) => {
  try {
    const { customer_id, image_url } = req.body;

    // Basic validation
    if (!customer_id || !image_url) {
      return res.status(400).json({
        success: false,
        error: "customer_id and image_url are required.",
      });
    }

    const { data, error } = await supabase
      .from("prescriptionss")
      .insert([
        {
          customer_id,
          image_url,
          status: "PENDING", // Default in DB, but explicitly setting it is fine
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully.",
      prescription: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// exports.getAllPrescriptions = async (req, res) => {
//   const { data, error } = await supabase.from("prescriptions").select("*");
//   if (error) {
//     return res.status(400).json(error);
//   }
//   res.json(data);
// };
exports.getAllPrescriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptionss")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      prescriptions: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// exports.getPendingPrescriptions = async (req, res) => {
//   const { data, error } = await supabase
//     .from("prescriptionss")

//     .select("*")

//     .eq("status", "PENDING");
//   if (error) {
//     return res.status(400).json(error);
//   }
//   res.json(data);
// };

exports.getPendingPrescriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptionss")
      .select("*")
      .eq("status", "PENDING")
      .order("uploaded_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      prescriptions: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


// exports.getPrescriptionById = async (req, res) => {
//   const { id } = req.params;

//   const { data, error } = await supabase

//     .from("prescriptions")

//     .select("*")

//     .eq("id", id)

//     .single();

//   if (error) {
//     return res.status(404).json(error);
//   }

//   res.json(data);
// };

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

// exports.approvePrescription = async (req, res) => {
//   const { id } = req.params;

//   const { pharmacist_id, remarks } = req.body;

//   await supabase

//     .from("prescriptions")

//     .update({
//       status: "APPROVED",
//     })

//     .eq("id", id);

//   await supabase

//     .from("prescription_reviews")

//     .insert({
//       prescription_id: id,

//       pharmacist_id,

//       status: "APPROVED",

//       remarks,
//     });

//   res.json({
//     success: true,

//     message: "Prescription Approved",
//   });
// };
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


// exports.rejectPrescription = async (req, res) => {
//   const { id } = req.params;

//   const { pharmacist_id, remarks } = req.body;

//   await supabase

//     .from("prescriptions")

//     .update({
//       status: "REJECTED",
//     })

//     .eq("id", id);

//   await supabase

//     .from("prescription_reviews")

//     .insert({
//       prescription_id: id,

//       pharmacist_id,

//       status: "REJECTED",

//       remarks,
//     });

//   res.json({
//     success: true,

//     message: "Prescription Rejected",
//   });
// };

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