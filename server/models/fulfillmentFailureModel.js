const supabase = require('../config/supabase');

const TABLE = 'fulfillment_failures';

/**
 * Get failures for an order.
 */
const getByOrder = async (orderId) => {
  return await supabase
    .from(TABLE)
    .select('*, branch:branches!branch_id(id, name, code), medicine:medicines!medicine_id(id, name)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
};

/**
 * Get failures for a branch.
 */
const getByBranch = async (branchId, { page = 1, limit = 50 } = {}) => {
  const from = (page - 1) * limit;

  return await supabase
    .from(TABLE)
    .select('*, medicine:medicines!medicine_id(id, name), order:orders!order_id(id, order_number)', { count: 'exact' })
    .eq('branch_id', branchId)
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false });
};

/**
 * Create a fulfillment failure record.
 */
const create = async (failureData) => {
  return await supabase.from(TABLE).insert(failureData).select().single();
};

module.exports = { getByOrder, getByBranch, create };
