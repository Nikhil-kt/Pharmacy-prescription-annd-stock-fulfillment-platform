const supabase = require('../config/supabase');

const TABLE = 'stock_ledger';

/**
 * Get ledger entries for a branch with pagination.
 */
const getByBranch = async (branchId, { medicineId, page = 1, limit = 50 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*, medicines(id, name), profiles!performed_by(id, full_name)', { count: 'exact' })
    .eq('branch_id', branchId);

  if (medicineId) query = query.eq('medicine_id', medicineId);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  return await query;
};

/**
 * Get ledger entries for a specific medicine across branches.
 */
const getByMedicine = async (medicineId, { page = 1, limit = 50 } = {}) => {
  const from = (page - 1) * limit;

  return await supabase
    .from(TABLE)
    .select('*, branches(id, name, code)', { count: 'exact' })
    .eq('medicine_id', medicineId)
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false });
};

/**
 * Create a ledger entry.
 */
const create = async (entryData) => {
  return await supabase.from(TABLE).insert(entryData).select().single();
};

module.exports = { getByBranch, getByMedicine, create };
