const supabase = require("../config/supabase");

exports.getAllBranches = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("branch_name");

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      totalBranches: data.length,
      branches: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getMedicinesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    let { data, error } = await supabase
      .from("inventory")
      .select(
        `
        quantity,
        medicines1 (
          id,
          medicine_name,
          manufacturer,
          category,
          description,
          price,
          prescription_required
        )
      `
      )
      .eq("branch_id", branchId)
      .gt("quantity", 0);

    if (error) {
      const fallback = await supabase
        .from("inventory")
        .select(
          `
          quantity,
          medicines (
            id,
            name,
            manufacturer,
            category,
            description,
            price,
            prescription_required
          )
        `
        )
        .eq("branch_id", branchId)
        .gt("quantity", 0);
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      totalMedicines: data ? data.length : 0,
      medicines: data || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getMedicineDetails = async (req, res) => {
  try {
    const { medicineId } = req.params;

    let { data, error } = await supabase
      .from("medicines1")
      .select("*")
      .eq("id", medicineId)
      .single();

    if (error) {
      const fallback = await supabase
        .from("medicines")
        .select("*")
        .eq("id", medicineId)
        .single();
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: "Medicine not found.",
      });
    }

    return res.status(200).json({
      success: true,
      medicine: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.searchMedicines = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Medicine name is required.",
      });
    }

    let { data, error } = await supabase
      .from("medicines1")
      .select("*")
      .ilike("medicine_name", `%${name}%`);

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from("medicines")
        .select("*")
        .ilike("name", `%${name}%`);
      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      totalResults: data ? data.length : 0,
      medicines: data || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};