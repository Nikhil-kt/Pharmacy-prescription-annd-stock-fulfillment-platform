const inventoryModel = require('../models/inventoryModel');
const stockLedgerModel = require('../models/stockLedgerModel');

/**
 * GET /api/inventory/:branchId — List branch inventory.
 */
const getBranchInventory = async (req, res, next) => {
  try {
    if (req.params.branchId === 'low-stock-all') {
      return getAllLowStock(req, res, next);
    }

    const { lowStockOnly, page, limit } = req.query;

    const { data, error, count } = await inventoryModel.getByBranch(req.params.branchId, {
      lowStockOnly: lowStockOnly === 'true',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/inventory — Upsert an inventory record.
 */
const upsertInventory = async (req, res, next) => {
  try {
    const { branch_id, medicine_id, quantity, low_stock_threshold } = req.body;

    if (!branch_id || !medicine_id) {
      return res.status(400).json({ success: false, message: 'branch_id and medicine_id are required.' });
    }

    const { data, error } = await inventoryModel.upsert({
      branch_id,
      medicine_id,
      quantity: quantity || 0,
      low_stock_threshold: low_stock_threshold || 10,
      updated_at: new Date().toISOString(),
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/inventory/adjust — Adjust stock quantity.
 * Also creates a stock ledger entry for auditing.
 */
const adjustStock = async (req, res, next) => {
  try {
    const { inventory_id, change_qty, reason, reference_order_id } = req.body;

    if (!inventory_id || change_qty === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'inventory_id, change_qty, and reason are required.',
      });
    }

    // Get current inventory record for version
    const { data: current, error: fetchError } = await inventoryModel.getByBranch(null);
    // Direct fetch by ID instead
    const supabase = require('../config/supabase');
    const { data: record, error: recError } = await supabase
      .from('branch_inventory')
      .select('*')
      .eq('id', inventory_id)
      .single();

    if (recError || !record) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }

    // Adjust with optimistic locking
    const { data, error } = await inventoryModel.adjustStock(
      inventory_id,
      change_qty,
      record.version
    );

    if (error) return res.status(400).json({ success: false, message: error.message });

    // Create audit ledger entry
    await stockLedgerModel.create({
      branch_id: record.branch_id,
      medicine_id: record.medicine_id,
      change_qty,
      reason,
      reference_order_id: reference_order_id || null,
      performed_by: req.user.id,
      balance_after: record.quantity + change_qty,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/inventory/low-stock-all — Get all low stock items across all branches with full medicine & branch details.
 */
const getAllLowStock = async (req, res, next) => {
  try {
    const supabase = require('../config/supabase');
    const { data, error } = await supabase
      .from('branch_inventory')
      .select('*, medicine:medicines!medicine_id(*), branch:branches!branch_id(*)');

    if (error) return res.status(400).json({ success: false, message: error.message });

    const lowStockItems = (data || []).filter(
      item => Number(item.quantity) <= Number(item.low_stock_threshold)
    );

    res.json({ success: true, data: lowStockItems, total: lowStockItems.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBranchInventory, upsertInventory, adjustStock, getAllLowStock };
