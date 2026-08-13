const deliveryJobModel = require('../models/deliveryJobModel');

/**
 * GET /api/delivery-jobs/order/:orderId — Get delivery job for an order.
 */
const getJobByOrder = async (req, res, next) => {
  try {
    const { data, error } = await deliveryJobModel.getByOrder(req.params.orderId);
    if (error) return res.status(404).json({ success: false, message: 'Delivery job not found.' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/delivery-jobs/partner/:partnerId — Get jobs for a delivery partner.
 */
const getJobsByPartner = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const { data, error, count } = await deliveryJobModel.getByPartner(req.params.partnerId, {
      status,
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
 * GET /api/delivery-jobs/my-jobs — Get jobs for the current delivery partner.
 */
const getMyJobs = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const { data, error, count } = await deliveryJobModel.getByPartner(req.user.id, {
      status,
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
 * POST /api/delivery-jobs — Create a delivery job.
 */
const createJob = async (req, res, next) => {
  try {
    const { order_id, delivery_partner_id, pickup_branch_id, delivery_address_id } = req.body;

    if (!order_id || !pickup_branch_id || !delivery_address_id) {
      return res.status(400).json({
        success: false,
        message: 'order_id, pickup_branch_id, and delivery_address_id are required.',
      });
    }

    const { data, error } = await deliveryJobModel.create({
      order_id,
      delivery_partner_id: delivery_partner_id || null,
      pickup_branch_id,
      delivery_address_id,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/delivery-jobs/:id/status — Update delivery job status.
 */
const updateJobStatus = async (req, res, next) => {
  try {
    const { status, failure_reason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required.' });
    }

    const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    if (status === 'failed' && !failure_reason) {
      return res.status(400).json({ success: false, message: 'failure_reason is required when status is "failed".' });
    }

    const { data, error } = await deliveryJobModel.updateStatus(req.params.id, status, failure_reason);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobByOrder, getJobsByPartner, getMyJobs, createJob, updateJobStatus };
