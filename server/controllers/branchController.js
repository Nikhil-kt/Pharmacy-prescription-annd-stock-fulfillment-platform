const branchModel = require('../models/branchModel');

/**
 * GET /api/branches — List all branches.
 */
const getAllBranches = async (req, res, next) => {
  try {
    const { city, is_active, page, limit } = req.query;

    const { data, error, count } = await branchModel.getAll({
      city,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/branches/:id — Get a single branch.
 */
const getBranchById = async (req, res, next) => {
  try {
    const { data, error } = await branchModel.getById(req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Branch not found.' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/branches — Create a new branch (admin).
 */
const createBranch = async (req, res, next) => {
  try {
    const { name, code, address, city, lat, lng } = req.body;

    if (!name || !code || !address || !city) {
      return res.status(400).json({ success: false, message: 'name, code, address, and city are required.' });
    }

    const { data, error } = await branchModel.create({ name, code, address, city, lat, lng });
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/branches/:id — Update a branch (admin).
 */
const updateBranch = async (req, res, next) => {
  try {
    const { name, code, address, city, lat, lng, is_active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (lat !== undefined) updates.lat = lat;
    if (lng !== undefined) updates.lng = lng;
    if (typeof is_active === 'boolean') updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    const { data, error } = await branchModel.update(req.params.id, updates);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/branches/:id/deactivate — Deactivate a branch (admin).
 */
const deactivateBranch = async (req, res, next) => {
  try {
    const { data, error } = await branchModel.deactivate(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, message: 'Branch deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/branches/:id/stats — Get detailed statistics for a specific branch (low stock, top selling product, order success/failure counts).
 */
const getBranchStats = async (req, res, next) => {
  try {
    const branchId = req.params.id;
    const supabase = require('../config/supabase');

    // 1. Fetch all orders for this branch
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, status, total')
      .eq('branch_id', branchId);

    if (ordersErr) throw ordersErr;

    const totalOrders = orders ? orders.length : 0;
    const orderSuccess = orders ? orders.filter(o => o.status === 'delivered' || o.status === 'confirmed' || o.status === 'ready' || o.status === 'processing' || o.status === 'placed').length : 0;
    const orderFailure = orders ? orders.filter(o => o.status === 'cancelled').length : 0;

    // 2. Fetch low stock items for this branch
    const { data: inventory } = await supabase
      .from('branch_inventory')
      .select('id, quantity, low_stock_threshold')
      .eq('branch_id', branchId);

    let lowStockCount = 0;
    if (inventory) {
      lowStockCount = inventory.filter(i => Number(i.quantity) <= Number(i.low_stock_threshold)).length;
    }

    // 3. Top selling product for this branch
    let topSellingProduct = { name: 'N/A', total_sold: 0 };
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('quantity, medicine:medicines!medicine_id(name)')
        .in('order_id', orderIds);

      if (orderItems && orderItems.length > 0) {
        const salesMap = {};
        orderItems.forEach(item => {
          const medName = item.medicine?.name || 'Unknown';
          const qty = Number(item.quantity) || 1;
          salesMap[medName] = (salesMap[medName] || 0) + qty;
        });

        let topMed = 'N/A';
        let maxQty = 0;
        Object.entries(salesMap).forEach(([name, qty]) => {
          if (qty > maxQty) {
            maxQty = qty;
            topMed = name;
          }
        });
        topSellingProduct = { name: topMed, total_sold: maxQty };
      }
    }

    res.json({
      success: true,
      data: {
        branch_id: branchId,
        total_orders: totalOrders,
        order_success: orderSuccess,
        order_failure: orderFailure,
        low_stock_count: lowStockCount,
        top_selling_product: topSellingProduct,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBranches, getBranchById, createBranch, updateBranch, deactivateBranch, getBranchStats };

