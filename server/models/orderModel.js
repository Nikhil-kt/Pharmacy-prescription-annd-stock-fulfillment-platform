const supabase = require('../config/supabase');

const TABLE = 'orders';

/**
 * Get all orders with filters and pagination.
 */
const getAll = async ({ status, branch_id, customer_id, delivery_partner_id, order_type, page = 1, limit = 20 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      customer:profiles!customer_id(id, full_name, phone),
      branch:branches!branch_id(id, name, code)
    `, { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (branch_id) query = query.eq('branch_id', branch_id);
  if (customer_id) query = query.eq('customer_id', customer_id);
  if (delivery_partner_id) query = query.eq('delivery_partner_id', delivery_partner_id);
  if (order_type) query = query.eq('order_type', order_type);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('placed_at', { ascending: false });

  let res = await query;
  if (res.error && res.error.message.includes('relationship')) {
    // Fallback query if FK relationship is missing in database schema
    let fallbackQuery = supabase.from(TABLE).select('*', { count: 'exact' });
    if (status) fallbackQuery = fallbackQuery.eq('status', status);
    if (branch_id) fallbackQuery = fallbackQuery.eq('branch_id', branch_id);
    if (customer_id) fallbackQuery = fallbackQuery.eq('customer_id', customer_id);
    if (delivery_partner_id) fallbackQuery = fallbackQuery.eq('delivery_partner_id', delivery_partner_id);
    if (order_type) fallbackQuery = fallbackQuery.eq('order_type', order_type);
    res = await fallbackQuery.range(from, from + limit - 1).order('placed_at', { ascending: false });
  }

  return res;
};

/**
 * Get an order by ID with full details.
 */
const getById = async (id) => {
  return await supabase
    .from(TABLE)
    .select(`
      *,
      customer:profiles!customer_id(id, full_name, phone),
      branch:branches!branch_id(id, name, code, address, city),
      delivery_address:addresses!delivery_address_id(*),
      prescription:prescriptions!prescription_id(id, file_url, status),
      creator:profiles!created_by(id, full_name),
      order_items(
        *,
        medicine:medicines!medicine_id(id, name, generic_name, mrp, image_url),
        substitute:medicines!substituted_with_medicine_id(id, name, generic_name, mrp)
      )
    `)
    .eq('id', id)
    .single();
};

/**
 * Get orders for a customer.
 */
const getByCustomer = async (customerId, { status, page = 1, limit = 20 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      branch:branches!branch_id(id, name, code),
      delivery_address:addresses!delivery_address_id(line1, city, pincode)
    `, { count: 'exact' })
    .eq('customer_id', customerId);

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('placed_at', { ascending: false });

  return await query;
};

/**
 * Get orders for a branch.
 */
const getByBranch = async (branchId, { status, page = 1, limit = 20 } = {}) => {
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      customer:profiles!customer_id(id, full_name, phone)
    `, { count: 'exact' })
    .eq('branch_id', branchId);

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order('placed_at', { ascending: false });

  return await query;
};

/**
 * Create a new order.
 */
const create = async (orderData) => {
  return await supabase.from(TABLE).insert(orderData).select().single();
};

/**
 * Update order status and updated_at.
 */
const updateStatus = async (id, status) => {
  let targetStatus = status;
  let result = await supabase
    .from(TABLE)
    .update({ status: targetStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (result.error && result.error.message.includes('enum order_status')) {
    // If PostgreSQL enum lacks 'processing', map 'processing' -> 'confirmed' or 'ready'
    if (targetStatus === 'processing') {
      targetStatus = 'confirmed';
    } else {
      targetStatus = 'confirmed';
    }
    result = await supabase
      .from(TABLE)
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  return result;
};

module.exports = { getAll, getById, getByCustomer, getByBranch, create, updateStatus };
