const fulfillmentFailureModel = require('../models/fulfillmentFailureModel');

/**
 * GET /api/fulfillment-failures/order/:orderId — Get failures for an order.
 */
const getFailuresByOrder = async (req, res, next) => {
  try {
    const { data, error } = await fulfillmentFailureModel.getByOrder(req.params.orderId);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/fulfillment-failures/branch/:branchId — Get failures for a branch.
 */
const getFailuresByBranch = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const { data, error, count } = await fulfillmentFailureModel.getByBranch(req.params.branchId, {
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
 * POST /api/fulfillment-failures — Log a fulfillment failure.
 */
const createFailure = async (req, res, next) => {
  try {
    const { branch_id, order_id, medicine_id, reason } = req.body;

    if (!branch_id || !order_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'branch_id, order_id, and reason are required.',
      });
    }

    const { data, error } = await fulfillmentFailureModel.create({
      branch_id,
      order_id,
      medicine_id: medicine_id || null,
      reason,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFailuresByOrder, getFailuresByBranch, createFailure };
