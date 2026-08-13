const stockLedgerModel = require('../models/stockLedgerModel');

/**
 * GET /api/stock-ledger/:branchId — Ledger entries for a branch.
 */
const getLedgerByBranch = async (req, res, next) => {
  try {
    const { medicineId, page, limit } = req.query;

    const { data, error, count } = await stockLedgerModel.getByBranch(req.params.branchId, {
      medicineId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLedgerByBranch };
