const supabase = require('../config/supabase');

const TABLE = 'profiles';

/**
 * Get a profile by ID.
 */
const getById = async (id) => {
  return await supabase.from(TABLE).select('*').eq('id', id).single();
};

/**
 * Get all profiles with optional filters.
 */
const getAll = async ({ role, status, is_active, page = 1, limit = 20 } = {}) => {
  let query = supabase.from(TABLE).select('*', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (status) query = query.eq('status', status);
  if (typeof is_active === 'boolean') query = query.eq('is_active', is_active);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  return await query;
};

/**
 * Get profiles by status (e.g. 'pending').
 */
const getByStatus = async (status) => {
  return await supabase
    .from(TABLE)
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
};

/**
 * Create a new profile.
 */
const create = async (profileData) => {
  return await supabase.from(TABLE).insert(profileData).select().single();
};

/**
 * Update a profile.
 */
const update = async (id, updates) => {
  return await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
};

/**
 * Deactivate a profile (soft delete).
 */
const deactivate = async (id) => {
  return await supabase
    .from(TABLE)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
};

module.exports = { getById, getAll, getByStatus, create, update, deactivate };
