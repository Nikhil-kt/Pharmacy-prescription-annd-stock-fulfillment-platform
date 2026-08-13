const supabase = require('../config/supabase');

const TABLE = 'medicine_substitutes';

/**
 * Get all substitutes for a medicine, ordered by priority.
 */
const getByMedicine = async (medicineId) => {
  return await supabase
    .from(TABLE)
    .select('*, substitute:medicines!substitute_medicine_id(id, name, generic_name, manufacturer, mrp)')
    .eq('medicine_id', medicineId)
    .order('priority', { ascending: true });
};

/**
 * Create a substitute mapping.
 */
const create = async (data) => {
  return await supabase.from(TABLE).insert(data).select().single();
};

/**
 * Remove a substitute mapping.
 */
const remove = async (id) => {
  return await supabase.from(TABLE).delete().eq('id', id);
};

module.exports = { getByMedicine, create, remove };
