const supabase = require('../config/supabase');

const TABLE = 'order_items';

/**
 * Get all items for an order.
 */
const getByOrder = async (orderId) => {
  return await supabase
    .from(TABLE)
    .select(`
      *,
      medicine:medicines!medicine_id(id, name, generic_name, mrp, image_url),
      substitute:medicines!substituted_with_medicine_id(id, name, generic_name, mrp)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
};

/**
 * Create order item(s). Accepts a single object or an array.
 */
const create = async (itemData) => {
  return await supabase.from(TABLE).insert(itemData).select();
};

/**
 * Update the status of an order item.
 */
const updateStatus = async (id, status) => {
  return await supabase.from(TABLE).update({ status }).eq('id', id).select().single();
};

/**
 * Set substitution for an order item.
 */
const setSubstitution = async (id, substitutedWithMedicineId, accepted) => {
  return await supabase
    .from(TABLE)
    .update({
      substituted_with_medicine_id: substitutedWithMedicineId,
      substitution_accepted_by_customer: accepted,
    })
    .eq('id', id)
    .select()
    .single();
};

module.exports = { getByOrder, create, updateStatus, setSubstitution };
