const supabase = require('../config/supabase');

const TABLE = 'branch_staff';

/**
 * Get all staff for a branch.
 */
const getByBranch = async (branchId, { is_active } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*, profiles(id, full_name, phone, role)')
    .eq('branch_id', branchId);

  if (typeof is_active === 'boolean') query = query.eq('is_active', is_active);

  return await query.order('created_at', { ascending: false });
};

/**
 * Get branch staff record(s) for a specific user.
 */
const getByUserId = async (userId) => {
  return await supabase
    .from(TABLE)
    .select('*, branches(id, name, code, city)')
    .eq('user_id', userId);
};

/**
 * Assign staff to a branch.
 */
const assign = async (staffData) => {
  return await supabase.from(TABLE).insert(staffData).select().single();
};

/**
 * Update a branch staff record (e.g. change role).
 */
const update = async (id, updates) => {
  return await supabase.from(TABLE).update(updates).eq('id', id).select().single();
};

/**
 * Deactivate a staff member (soft delete).
 */
const deactivate = async (id) => {
  return await supabase
    .from(TABLE)
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();
};

module.exports = { getByBranch, getByUserId, assign, update, deactivate };
