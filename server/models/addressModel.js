const supabase = require('../config/supabase');

const TABLE = 'addresses';

/**
 * Get all addresses for a user.
 */
const getByUserId = async (userId) => {
  return await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
};

/**
 * Get a single address by ID.
 */
const getById = async (id) => {
  return await supabase.from(TABLE).select('*').eq('id', id).single();
};

/**
 * Create a new address.
 */
const create = async (addressData) => {
  return await supabase.from(TABLE).insert(addressData).select().single();
};

/**
 * Update an address.
 */
const update = async (id, updates) => {
  return await supabase.from(TABLE).update(updates).eq('id', id).select().single();
};

/**
 * Delete an address.
 */
const remove = async (id) => {
  return await supabase.from(TABLE).delete().eq('id', id);
};

/**
 * Set an address as the default (unset all others first).
 */
const setDefault = async (userId, addressId) => {
  // Unset all current defaults for the user
  await supabase.from(TABLE).update({ is_default: false }).eq('user_id', userId);

  // Set the specified address as default
  return await supabase
    .from(TABLE)
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();
};

module.exports = { getByUserId, getById, create, update, remove, setDefault };
