const prescriptionModel = require('../models/prescriptionModel');

/**
 * GET /api/prescriptions — List prescriptions.
 * Customers see their own; staff see all.
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const { status, date, page, limit } = req.query;
    const options = {
      status,
      date,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    };

    let result;
    if (req.user.role === 'customer') {
      result = await prescriptionModel.getByCustomer(req.user.id, options);
    } else {
      result = await prescriptionModel.getAll(options);
    }

    const { data, error, count } = result;
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/prescriptions/:id — Get a prescription by ID.
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const { data, error } = await prescriptionModel.getById(req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Prescription not found.' });

    // Customers can only view their own
    if (req.user.role === 'customer' && data.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/prescriptions — Upload a prescription.
 */
const createPrescription = async (req, res, next) => {
  try {
    const { file_url, notes } = req.body;

    if (!file_url) {
      return res.status(400).json({ success: false, message: 'file_url is required.' });
    }

    const { data, error } = await prescriptionModel.create({
      customer_id: req.user.id,
      file_url,
      notes,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/prescriptions/:id/review — Review a prescription (staff only).
 */
const reviewPrescription = async (req, res, next) => {
  try {
    const { status, rejection_reason, notes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be "approved" or "rejected".' });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({ success: false, message: 'rejection_reason is required when rejecting.' });
    }

    const { data, error } = await prescriptionModel.review(req.params.id, {
      status,
      reviewed_by: req.user.id,
      rejection_reason,
      notes,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPrescriptions, getPrescriptionById, createPrescription, reviewPrescription };
