const supabase = require("../config/supabase");

exports.getAllStock = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        id,
        quantity,
        expiry_date,
        manufacturing_date,
        last_updated,

        medicines1(
          id,
          medicine_name,
          manufacturer,
          category,
          price
        ),

        branches(
          id,
          branch_name,
          address
        )
      `,
      )
      .order("last_updated", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      totalItems: data.length,
      stock: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getBranchStock = async (req, res) => {
  try {
    const { branchId } = req.params;

    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        id,
        quantity,
        expiry_date,
        manufacturing_date,

        medicines1(
          id,
          medicine_name,
          manufacturer,
          category,
          price
        )
      `,
      )
      .eq("branch_id", branchId);

    if (error) {
      return res.status(400).json({
        success: false,

        error: error.message,
      });
    }

    res.status(200).json({
      success: true,

      totalMedicines: data.length,

      stock: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const { branchId } = req.params;

    const { data, error } = await supabase

      .from("inventory")

      .select(
        `
id,
quantity,
expiry_date,

medicines1(
medicine_name,
manufacturer
)
`,
      )

      .eq("branch_id", branchId)

      .lt("quantity", 10);

    if (error) {
      return res.status(400).json({
        success: false,

        error: error.message,
      });
    }

    res.status(200).json({
      success: true,

      totalLowStock: data.length,

      lowStock: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { branchId, medicineId } = req.params;

    const { quantity } = req.body;

    const { data, error } = await supabase
      .from("inventory")
      .update({
        quantity,

        last_updated: new Date().toISOString(),
      })
      .eq("branch_id", branchId)
      .eq("medicine_id", medicineId)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,

        error: error.message,
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,

        error: "Medicine not found in this branch",
      });
    }

    res.status(200).json({
      success: true,

      message: "Stock Updated Successfully",

      inventory: data[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};

exports.addMedicineStock = async (req, res) => {
  try {
    const {
      medicine_id,
      branch_id,
      quantity,
      manufacturing_date,
      expiry_date
    } = req.body;

    // Validate required fields
    if (
      !medicine_id ||
      !branch_id ||
      quantity == null ||
      !manufacturing_date ||
      !expiry_date
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required."
      });
    }

    // Check whether this medicine already exists in this branch
    const { data: existingStock, error: checkError } = await supabase
      .from("inventory")
      .select("*")
      .eq("medicine_id", medicine_id)
      .eq("branch_id", branch_id)
      .maybeSingle();

    if (checkError) {
      return res.status(400).json({
        success: false,
        error: checkError.message
      });
    }

    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: "Medicine already exists in this branch. Use Update Stock API instead."
      });
    }

    // Insert new stock
    const { data, error } = await supabase
      .from("inventory")
      .insert({
        medicine_id,
        branch_id,
        quantity,
        manufacturing_date,
        expiry_date
      })
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully.",
      inventory: data[0]
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};