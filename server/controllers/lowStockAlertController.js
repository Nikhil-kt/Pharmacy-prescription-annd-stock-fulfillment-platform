const lowStockAlertModel = require('../models/lowStockAlertModel');

/**
 * GET /api/low-stock-alerts/:branchId — Get alerts for a branch.
 */
const getAlertsByBranch = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const { data, error, count } = await lowStockAlertModel.getByBranch(req.params.branchId, {
      status,
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
 * PATCH /api/low-stock-alerts/:id/resolve — Resolve an alert.
 */
const resolveAlert = async (req, res, next) => {
  try {
    const { data, error } = await lowStockAlertModel.resolve(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlertsByBranch, resolveAlert };
