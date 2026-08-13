const supabase = require('../config/supabase');

const TABLE = 'branches';

/**
 * Get all branches with optional filters.
 */
const getAll = async ({ city, is_active, page = 1, limit = 20 } = {}) => {
  let query = supabase.from(TABLE).select('*', { count: 'exact' });

  if (city) query = query.ilike('city', `%${city}%`);
  if (typeof is_active === 'boolean') query = query.eq('is_active', is_active);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

  return await query;
};

/**
 * Get a branch by ID.
 */
const getById = async (id) => {
  return await supabase.from(TABLE).select('*').eq('id', id).single();
};

/**
 * Create a new branch.
 */
const create = async (branchData) => {
  return await supabase.from(TABLE).insert(branchData).select().single();
};

/**
 * Update a branch.
 */
const update = async (id, updates) => {
  return await supabase.from(TABLE).update(updates).eq('id', id).select().single();
};

/**
 * Deactivate a branch (soft delete).
 */
const deactivate = async (id) => {
  return await supabase
    .from(TABLE)
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();
};

module.exports = { getAll, getById, create, update, deactivate };
