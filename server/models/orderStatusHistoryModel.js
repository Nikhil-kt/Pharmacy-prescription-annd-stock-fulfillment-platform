const supabase = require('../config/supabase');

const TABLE = 'order_status_history';

/**
 * Get full status history for an order.
 */
const getByOrder = async (orderId) => {
  return await supabase
    .from(TABLE)
    .select('*, changer:profiles!changed_by(id, full_name)')
    .eq('order_id', orderId)
    .order('changed_at', { ascending: true });
};

/**
 * Create a status history entry.
 */
const create = async (historyData) => {
  return await supabase.from(TABLE).insert(historyData).select().single();
};

module.exports = { getByOrder, create };
