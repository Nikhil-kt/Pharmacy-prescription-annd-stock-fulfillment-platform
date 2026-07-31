const supabase = require("../config/supabase");

// 1. GET PENDING PRESCRIPTIONS
exports.getPendingPrescriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptionss")
      .select("*")
      .eq("status", "PENDING")
      .order("uploaded_at", { ascending: false });

    if (error) {
      const { data: data2, error: error2 } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("status", "PENDING")
        .order("uploaded_at", { ascending: false });

      if (error2) throw error;
      return res.status(200).json({ success: true, data: data2 || [] });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 2. GET PRESCRIPTION BY ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    let { data, error } = await supabase
      .from("prescriptionss")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      const { data: data2, error: error2 } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("id", id)
        .single();
      if (!error2) data = data2;
    }

    if (!data) {
      return res.status(404).json({ success: false, error: "Prescription not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 3. UPLOAD PRESCRIPTION
exports.uploadPrescription = async (req, res) => {
  try {
    const { customer_id, image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ success: false, error: "image_url is required" });
    }

    const isValidUUID = (str) => {
      if (!str) return false;
      const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return regex.test(str);
    };

    let targetCustomerId = isValidUUID(customer_id) ? customer_id : null;

    if (targetCustomerId) {
      // Check if user exists in the public "users" table (Supabase Auth users)
      const { data: userExists } = await supabase
        .from("users")
        .select("*")
        .eq("id", targetCustomerId)
        .maybeSingle();

      if (userExists) {
        // Check if they also exist in legacy "customers" table to satisfy fk_customer constraint
        const { data: customerExists } = await supabase
          .from("customers")
          .select("id")
          .eq("id", targetCustomerId)
          .maybeSingle();

        if (!customerExists) {
          // Auto-sync the user to the customers table
          await supabase.from("customers").insert({
            id: userExists.id,
            full_name: userExists.full_name || "Auth User",
            email: userExists.email,
            phone: userExists.phone || "0000000000",
            password_hash: "supabase_auth_placeholder",
          });
        }
      } else {
        // Fallback: check legacy "customers" table directly
        const { data: customerExists } = await supabase
          .from("customers")
          .select("id")
          .eq("id", targetCustomerId)
          .maybeSingle();

        if (!customerExists) {
          targetCustomerId = null;
        }
      }
    }

    if (!targetCustomerId) {
      // Fallback to a default customer ID if none found
      const { data: defaultCustomer } = await supabase
        .from("customers")
        .select("id")
        .limit(1)
        .maybeSingle();

      targetCustomerId = defaultCustomer?.id || "d083c973-01f2-45da-b3fc-60260fe0408c";
    }

    const newPrescription = {
      customer_id: targetCustomerId,
      image_url,
      status: "PENDING",
      uploaded_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("prescriptionss")
      .insert([newPrescription])
      .select();

    if (error) {
      const { data: data2, error: error2 } = await supabase
        .from("prescriptions")
        .insert([newPrescription])
        .select();
      if (error2) throw error;
      data = data2;
    }

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully",
      data: data ? data[0] : newPrescription,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 4. APPROVE PRESCRIPTION
exports.approvePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, reviewed_by } = req.body || {};

    const updatePayload = {
      status: "APPROVED",
      remarks: remarks || "Approved by pharmacist",
      reviewed_at: new Date().toISOString(),
    };
    if (reviewed_by) updatePayload.reviewed_by = reviewed_by;

    let { data, error } = await supabase
      .from("prescriptionss")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      const { data: data2, error: error2 } = await supabase
        .from("prescriptions")
        .update(updatePayload)
        .eq("id", id)
        .select();
      if (error2) throw error;
      data = data2;
    }

    return res.status(200).json({
      success: true,
      message: "Prescription approved",
      data: data ? data[0] : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 5. REJECT PRESCRIPTION
exports.rejectPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, reviewed_by } = req.body || {};

    const updatePayload = {
      status: "REJECTED",
      remarks: remarks || "Rejected by pharmacist",
      reviewed_at: new Date().toISOString(),
    };
    if (reviewed_by) updatePayload.reviewed_by = reviewed_by;

    let { data, error } = await supabase
      .from("prescriptionss")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      const { data: data2, error: error2 } = await supabase
        .from("prescriptions")
        .update(updatePayload)
        .eq("id", id)
        .select();
      if (error2) throw error;
      data = data2;
    }

    return res.status(200).json({
      success: true,
      message: "Prescription rejected",
      data: data ? data[0] : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};