const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const medicineSubstituteController = require('../controllers/medicineSubstituteController');

// Read access for authenticated users
router.get('/:medicineId', authenticate, medicineSubstituteController.getSubstitutes);

// Write access for admin only
router.post('/', authenticate, authorize('admin'), medicineSubstituteController.addSubstitute);
router.delete('/:id', authenticate, authorize('admin'), medicineSubstituteController.removeSubstitute);

module.exports = router;
