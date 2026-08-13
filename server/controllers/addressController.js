const addressModel = require('../models/addressModel');

/**
 * GET /api/addresses — List current user's addresses.
 */
const getMyAddresses = async (req, res, next) => {
  try {
    const { data, error } = await addressModel.getByUserId(req.user.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/addresses — Create a new address.
 */
const createAddress = async (req, res, next) => {
  try {
    const { label, line1, line2, city, state, pincode, lat, lng, is_default } = req.body;

    if (!line1 || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'line1, city, and pincode are required.' });
    }

    // If this is set as default, unset others first
    if (is_default) {
      await addressModel.setDefault(req.user.id, null); // just unset all
    }

    const { data, error } = await addressModel.create({
      user_id: req.user.id,
      label, line1, line2, city, state, pincode, lat, lng,
      is_default: is_default || false,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/addresses/:id — Update an address.
 */
const updateAddress = async (req, res, next) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchError } = await addressModel.getById(req.params.id);
    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this address.' });
    }

    const { label, line1, line2, city, state, pincode, lat, lng } = req.body;
    const updates = {};
    if (label !== undefined) updates.label = label;
    if (line1 !== undefined) updates.line1 = line1;
    if (line2 !== undefined) updates.line2 = line2;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    if (lat !== undefined) updates.lat = lat;
    if (lng !== undefined) updates.lng = lng;

    const { data, error } = await addressModel.update(req.params.id, updates);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/addresses/:id — Delete an address.
 */
const deleteAddress = async (req, res, next) => {
  try {
    const { data: existing, error: fetchError } = await addressModel.getById(req.params.id);
    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this address.' });
    }

    const { error } = await addressModel.remove(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/addresses/:id/default — Set an address as default.
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const { data: existing, error: fetchError } = await addressModel.getById(req.params.id);
    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { data, error } = await addressModel.setDefault(req.user.id, req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress };
