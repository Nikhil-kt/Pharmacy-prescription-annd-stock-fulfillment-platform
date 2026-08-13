const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const inventoryController = require('../controllers/inventoryController');

// All inventory routes require staff-level access
router.use(authenticate);

router.get('/low-stock-all', inventoryController.getAllLowStock);
router.get('/:branchId', inventoryController.getBranchInventory);
router.put('/', authorize('pharmacist', 'admin'), inventoryController.upsertInventory);
router.patch('/adjust', authorize('pharmacist', 'admin'), inventoryController.adjustStock);

module.exports = router;
