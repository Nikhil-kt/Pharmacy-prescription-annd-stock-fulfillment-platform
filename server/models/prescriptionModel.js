const supabase = require('../config/supabase');

const TABLE = 'prescriptions';

/**
 * Get prescriptions for a customer.
 */
const getByCustomer = async (customerId, { status, page = 1, limit = 20 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*, reviewer:profiles!reviewed_by(id, full_name)', { count: 'exact' })
    .eq('customer_id', customerId);

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('uploaded_at', { ascending: false });

  return await query;
};

/**
 * Get all prescriptions (for staff review).
 */
const getAll = async ({ status, date, page = 1, limit = 50 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select('*, customer:profiles!customer_id(id, full_name, phone), reviewer:profiles!reviewed_by(id, full_name)', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (date) {
    const startDate = `${date}T00:00:00.000Z`;
    const endDate = `${date}T23:59:59.999Z`;
    query = query.gte('uploaded_at', startDate).lte('uploaded_at', endDate);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('uploaded_at', { ascending: false });

  return await query;
};

/**
 * Get a prescription by ID.
 */
const getById = async (id) => {
  return await supabase
    .from(TABLE)
    .select('*, customer:profiles!customer_id(id, full_name, phone), reviewer:profiles!reviewed_by(id, full_name)')
    .eq('id', id)
    .single();
};

/**
 * Create a prescription.
 */
const create = async (prescriptionData) => {
  return await supabase.from(TABLE).insert(prescriptionData).select().single();
};

/**
 * Review (approve or reject) a prescription.
 */
const review = async (id, { status, reviewed_by, rejection_reason, notes }) => {
  const updates = {
    status,
    reviewed_by,
    reviewed_at: new Date().toISOString(),
  };
  if (rejection_reason) updates.rejection_reason = rejection_reason;
  if (notes) updates.notes = notes;

  return await supabase.from(TABLE).update(updates).eq('id', id).select().single();
};

module.exports = { getByCustomer, getAll, getById, create, review };
