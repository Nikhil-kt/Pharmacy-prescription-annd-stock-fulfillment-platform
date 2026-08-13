const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const lowStockAlertController = require('../controllers/lowStockAlertController');

// All routes require authentication
router.use(authenticate);

router.get('/:branchId', lowStockAlertController.getAlertsByBranch);
router.patch('/:id/resolve', lowStockAlertController.resolveAlert);

module.exports = router;
