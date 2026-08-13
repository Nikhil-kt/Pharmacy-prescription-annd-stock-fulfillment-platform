const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const branchController = require('../controllers/branchController');

// Public read access
router.get('/', branchController.getAllBranches);
router.get('/:id/stats', branchController.getBranchStats);
router.get('/:id', branchController.getBranchById);

// Admin-only write access
router.post('/', authenticate, authorize('admin'), branchController.createBranch);
router.put('/:id', authenticate, authorize('admin'), branchController.updateBranch);
router.patch('/:id/deactivate', authenticate, authorize('admin'), branchController.deactivateBranch);

module.exports = router;
