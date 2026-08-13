const supabase = require('../config/supabase');

const TABLE = 'branch_inventory';

/**
 * Get all inventory for a branch with medicine details.
 */
const getByBranch = async (branchId, { lowStockOnly, page = 1, limit = 50 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*, medicine:medicines!medicine_id(*)', { count: 'exact' })
    .eq('branch_id', branchId);

  if (lowStockOnly) {
    // Filter where quantity <= low_stock_threshold
    // Supabase doesn't support column-to-column comparison directly,
    // so we use a raw filter
    query = query.filter('quantity', 'lte', 'low_stock_threshold');
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('updated_at', { ascending: false });

  return await query;
};

/**
 * Get inventory for a specific medicine at a specific branch.
 */
const getByBranchAndMedicine = async (branchId, medicineId) => {
  return await supabase
    .from(TABLE)
    .select('*')
    .eq('branch_id', branchId)
    .eq('medicine_id', medicineId)
    .single();
};

/**
 * Upsert an inventory record (create or update).
 */
const upsert = async (data) => {
  return await supabase
    .from(TABLE)
    .upsert(data, { onConflict: 'branch_id,medicine_id' })
    .select()
    .single();
};

/**
 * Adjust stock quantity for a specific inventory record.
 * Uses optimistic locking via the version column.
 */
const adjustStock = async (id, quantityChange, currentVersion) => {
  // First get the current record
  const { data: current, error: fetchError } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('version', currentVersion)
    .single();

  if (fetchError || !current) {
    return { data: null, error: { message: 'Record not found or version conflict.' } };
  }

  const newQuantity = current.quantity + quantityChange;
  if (newQuantity < 0) {
    return { data: null, error: { message: 'Insufficient stock.' } };
  }

  return await supabase
    .from(TABLE)
    .update({
      quantity: newQuantity,
      version: currentVersion + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('version', currentVersion)
    .select()
    .single();
};

module.exports = { getByBranch, getByBranchAndMedicine, upsert, adjustStock };
