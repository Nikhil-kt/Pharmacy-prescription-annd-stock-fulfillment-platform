const supabase = require('../config/supabase');

const TABLE = 'low_stock_alerts';

/**
 * Get alerts for a branch.
 */
const getByBranch = async (branchId, { status, page = 1, limit = 50 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*, medicines(id, name, generic_name)', { count: 'exact' })
    .eq('branch_id', branchId);

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  return await query;
};

/**
 * Create a low stock alert.
 */
const create = async (alertData) => {
  return await supabase.from(TABLE).insert(alertData).select().single();
};

/**
 * Resolve (close) a low stock alert.
 */
const resolve = async (id) => {
  return await supabase
    .from(TABLE)
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
};

module.exports = { getByBranch, create, resolve };
