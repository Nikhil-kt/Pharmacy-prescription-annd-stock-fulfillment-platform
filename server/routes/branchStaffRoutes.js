const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const branchStaffController = require('../controllers/branchStaffController');

// All routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/:branchId', branchStaffController.getStaffByBranch);
router.post('/', branchStaffController.assignStaff);
router.put('/:id', branchStaffController.updateStaff);
router.patch('/:id/deactivate', branchStaffController.deactivateStaff);

module.exports = router;
