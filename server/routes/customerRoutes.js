const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const {
  getAllBranches,
  getMedicinesByBranch,
  getMedicineDetails,
  searchMedicines,
} = require("../controllers/customerController");

// View all branches
router.get("/branches", getAllBranches);

// View medicines available in one branch
router.get("/branches/:branchId/medicines", getMedicinesByBranch);

// View single medicine details
router.get("/medicines/:medicineId", getMedicineDetails);

// Search medicine
router.get("/search", searchMedicines);

// Get all orders for a customer
router.get("/orders", async (req, res) => {
  try {
    const { customer_id } = req.query;
    let query = supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        branches:branches_id ( id, branch_name )
      `)
      .order("created_at", { ascending: false });

    if (customer_id) query = query.eq("customer_id", customer_id);

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, orders: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
