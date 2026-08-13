const branchStaffModel = require('../models/branchStaffModel');
const profileModel = require('../models/profileModel');

/**
 * GET /api/branch-staff/:branchId — List staff for a branch.
 */
const getStaffByBranch = async (req, res, next) => {
  try {
    const { is_active } = req.query;

    const { data, error } = await branchStaffModel.getByBranch(req.params.branchId, {
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/branch-staff — Assign staff to a branch.
 * Also auto-approves the user's profile (pending → active).
 */
const assignStaff = async (req, res, next) => {
  try {
    const { branch_id, user_id, staff_role } = req.body;

    if (!branch_id || !user_id || !staff_role) {
      return res.status(400).json({ success: false, message: 'branch_id, user_id, and staff_role are required.' });
    }

    // Assign staff to the branch
    const { data, error } = await branchStaffModel.assign({ branch_id, user_id, staff_role });
    if (error) return res.status(400).json({ success: false, message: error.message });

    // Auto-approve the profile (set status from pending → active)
    const { error: profileError } = await profileModel.update(user_id, { status: 'active' });
    if (profileError) {
      console.error('Warning: branch_staff created but profile approval failed:', profileError.message);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/branch-staff/:id — Update staff record (e.g. role change).
 */
const updateStaff = async (req, res, next) => {
  try {
    const { staff_role, is_active } = req.body;
    const updates = {};
    if (staff_role !== undefined) updates.staff_role = staff_role;
    if (typeof is_active === 'boolean') updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    const { data, error } = await branchStaffModel.update(req.params.id, updates);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/branch-staff/:id/deactivate — Deactivate a staff member.
 */
const deactivateStaff = async (req, res, next) => {
  try {
    const { data, error } = await branchStaffModel.deactivate(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStaffByBranch, assignStaff, updateStaff, deactivateStaff };
