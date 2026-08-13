const medicineSubstituteModel = require('../models/medicineSubstituteModel');

/**
 * GET /api/medicine-substitutes/:medicineId — Get substitutes for a medicine.
 */
const getSubstitutes = async (req, res, next) => {
  try {
    const { data, error } = await medicineSubstituteModel.getByMedicine(req.params.medicineId);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/medicine-substitutes — Add a substitute.
 */
const addSubstitute = async (req, res, next) => {
  try {
    const { medicine_id, substitute_medicine_id, priority } = req.body;

    if (!medicine_id || !substitute_medicine_id) {
      return res.status(400).json({ success: false, message: 'medicine_id and substitute_medicine_id are required.' });
    }

    if (medicine_id === substitute_medicine_id) {
      return res.status(400).json({ success: false, message: 'A medicine cannot be its own substitute.' });
    }

    const { data, error } = await medicineSubstituteModel.create({
      medicine_id,
      substitute_medicine_id,
      priority: priority || 1,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/medicine-substitutes/:id — Remove a substitute mapping.
 */
const removeSubstitute = async (req, res, next) => {
  try {
    const { error } = await medicineSubstituteModel.remove(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, message: 'Substitute removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubstitutes, addSubstitute, removeSubstitute };
