const orderModel = require('../models/orderModel');
const orderItemModel = require('../models/orderItemModel');
const orderStatusHistoryModel = require('../models/orderStatusHistoryModel');

/**
 * GET /api/orders — List orders (filterable by role).
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, branch_id, customer_id, order_type, page, limit } = req.query;

    const filters = {
      status,
      order_type,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    // Customers only see their own orders
    if (req.user.role === 'customer') {
      filters.customer_id = req.user.id;
    } else {
      if (branch_id) filters.branch_id = branch_id;
      if (customer_id) filters.customer_id = customer_id;
    }

    const { data, error, count } = await orderModel.getAll(filters);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id — Get a single order with full details.
 */
const getOrderById = async (req, res, next) => {
  try {
    const { data, error } = await orderModel.getById(req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Customers can only view their own orders
    if (req.user.role === 'customer' && data.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders — Place a new order.
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      order_number, branch_id, order_type,
      delivery_address_id, delivery_partner_address_id, prescription_id,
      subtotal, total, notes, items,
    } = req.body;

    if (!order_number || !branch_id) {
      return res.status(400).json({ success: false, message: 'order_number and branch_id are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required.' });
    }

    // Create the order
    const { data: order, error: orderError } = await orderModel.create({
      order_number,
      customer_id: req.user.id,
      branch_id,
      order_type: order_type || 'app',
      created_by: req.user.id,
      delivery_address_id: delivery_address_id || delivery_partner_address_id || null,
      prescription_id,
      subtotal: subtotal || 0,
      total: total || 0,
      notes,
    });

    if (orderError) return res.status(400).json({ success: false, message: orderError.message });

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      medicine_id: item.medicine_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      requires_prescription: item.requires_prescription || false,
    }));

    const { error: itemsError } = await orderItemModel.create(orderItems);
    if (itemsError) {
      return res.status(400).json({ success: false, message: itemsError.message });
    }

    // Create initial status history entry
    await orderStatusHistoryModel.create({
      order_id: order.id,
      from_status: null,
      to_status: 'placed',
      changed_by: req.user.id,
      remarks: 'Order placed.',
    });

    // Fetch the complete order with items
    const { data: fullOrder } = await orderModel.getById(order.id);

    res.status(201).json({ success: true, data: fullOrder });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/status — Update order status.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required.' });
    }

    // Get the current order for the from_status
    const { data: currentOrder, error: fetchError } = await orderModel.getById(req.params.id);
    if (fetchError || !currentOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If status is already equal, return early without inserting duplicate status history row
    if (currentOrder.status === status) {
      return res.json({ success: true, data: currentOrder });
    }

    const { data, error } = await orderModel.updateStatus(req.params.id, status);
    if (error) return res.status(400).json({ success: false, message: error.message });

    // Log the status change into history table
    await orderStatusHistoryModel.create({
      order_id: req.params.id,
      from_status: currentOrder.status,
      to_status: status,
      changed_by: req.user.id,
      remarks,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id/history — Get status timeline for an order.
 */
const getOrderHistory = async (req, res, next) => {
  try {
    const { data, error } = await orderStatusHistoryModel.getByOrder(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/stats — Summary stats across all branches (total, success, failure).
 */
const getOrderStats = async (req, res, next) => {
  try {
    const supabase = require('../config/supabase');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, branch_id, placed_at');

    if (error) return res.status(400).json({ success: false, message: error.message });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalOrders = orders ? orders.length : 0;
    const todayOrders = orders ? orders.filter(o => new Date(o.placed_at || o.created_at) >= startOfToday).length : 0;
    const orderSuccess = orders ? orders.filter(o => o.status === 'delivered' || o.status === 'confirmed' || o.status === 'ready' || o.status === 'processing' || o.status === 'placed').length : 0;
    const orderFailure = orders ? orders.filter(o => o.status === 'cancelled').length : 0;

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        today_orders: todayOrders,
        order_success: orderSuccess,
        order_failure: orderFailure,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus, getOrderHistory, getOrderStats };

