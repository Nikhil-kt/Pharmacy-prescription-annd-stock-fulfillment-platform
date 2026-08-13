const orderItemModel = require('../models/orderItemModel');

/**
 * GET /api/order-items/:orderId — Get items for an order.
 */
const getItemsByOrder = async (req, res, next) => {
  try {
    const { data, error } = await orderItemModel.getByOrder(req.params.orderId);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/order-items/:id/status — Update item status.
 */
const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required.' });
    }

    const { data, error } = await orderItemModel.updateStatus(req.params.id, status);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/order-items/:id/substitute — Set substitution for an item.
 */
const setSubstitution = async (req, res, next) => {
  try {
    const { substituted_with_medicine_id, accepted } = req.body;

    if (!substituted_with_medicine_id) {
      return res.status(400).json({ success: false, message: 'substituted_with_medicine_id is required.' });
    }

    const { data, error } = await orderItemModel.setSubstitution(
      req.params.id,
      substituted_with_medicine_id,
      accepted !== undefined ? accepted : null
    );

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getItemsByOrder, updateItemStatus, setSubstitution };
