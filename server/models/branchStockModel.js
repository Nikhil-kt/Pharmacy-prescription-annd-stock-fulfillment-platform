const supabase = require("../config/supabase");

// Get all branch stock
const getAllStock = async () => {
  return await supabase
    .from("branch_stock")
    .select(`
      *,
      branch(name),
      medicines(name)
    `);
};

// Get stock for a specific branch
const getBranchStock = async (branchId) => {
  return await supabase
    .from("branch_stock")
    .select(`
      *,
      branch(name),
      medicines(name)
    `)
    .eq("branch_id", branchId);
};

// Get low stock medicines for a branch
const getLowStock = async (branchId) => {
  return await supabase
    .from("branch_stock")
    .select(`
      *,
      branch(name),
      medicines(name)
    `)
    .eq("branch_id", branchId)
    .lte("quantity", 10);
};

// Update stock quantity
const updateStock = async (branchId, medicineId, quantity) => {
  return await supabase
    .from("branch_stock")
    .update({ quantity })
    .eq("branch_id", branchId)
    .eq("medicine_id", medicineId)
    .select(`
      *,
      branch(name),
      medicines(name)
    `);
};

module.exports = {
  getAllStock,
  getBranchStock,
  getLowStock,
  updateStock,
};