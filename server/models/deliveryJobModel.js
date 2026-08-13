const supabase = require('../config/supabase');

const TABLE = 'delivery_jobs';

/**
 * Get the delivery job for an order.
 */
const getByOrder = async (orderId) => {
  return await supabase
    .from(TABLE)
    .select(`
      *,
      delivery_partner:profiles!delivery_partner_id(id, full_name, phone),
      pickup_branch:branches!pickup_branch_id(id, name, address, city),
      delivery_address:addresses!delivery_address_id(*)
    `)
    .eq('order_id', orderId)
    .single();
};

/**
 * Get delivery jobs for a delivery partner.
 */
const getByPartner = async (partnerId, { status, page = 1, limit = 20 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      order:orders!order_id(id, order_number, status, total),
      pickup_branch:branches!pickup_branch_id(id, name, address, city),
      delivery_address:addresses!delivery_address_id(*)
    `, { count: 'exact' })
    .eq('delivery_partner_id', partnerId);

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('assigned_at', { ascending: false });

  return await query;
};

/**
 * Create a delivery job.
 */
const create = async (jobData) => {
  return await supabase.from(TABLE).insert(jobData).select().single();
};

/**
 * Update delivery job status with appropriate timestamps.
 */
const updateStatus = async (id, status, failureReason) => {
  const updates = { status };

  if (status === 'picked_up') updates.picked_up_at = new Date().toISOString();
  if (status === 'delivered') updates.delivered_at = new Date().toISOString();
  if (status === 'failed' && failureReason) updates.failure_reason = failureReason;

  return await supabase.from(TABLE).update(updates).eq('id', id).select().single();
};

module.exports = { getByOrder, getByPartner, create, updateStatus };
