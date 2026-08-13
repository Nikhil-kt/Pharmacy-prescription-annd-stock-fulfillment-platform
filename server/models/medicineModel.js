const supabase = require('../config/supabase');

const TABLE = 'medicines';

/**
 * Get all medicines with search, category filter, and pagination.
 */
const getAll = async ({ search, category, is_active, page = 1, limit = 20 } = {}) => {
  let query = supabase.from(TABLE).select('*', { count: 'exact' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%,manufacturer.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (category) query = query.eq('category', category);
  if (typeof is_active === 'boolean') query = query.eq('is_active', is_active);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('name', { ascending: true });

  return await query;
};

/**
 * Get a medicine by ID.
 */
const getById = async (id) => {
  return await supabase.from(TABLE).select('*').eq('id', id).single();
};

/**
 * Create a new medicine.
 */
const create = async (medicineData) => {
  return await supabase.from(TABLE).insert(medicineData).select().single();
};

/**
 * Update a medicine.
 */
const update = async (id, updates) => {
  return await supabase.from(TABLE).update(updates).eq('id', id).select().single();
};

/**
 * Deactivate a medicine (soft delete).
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
