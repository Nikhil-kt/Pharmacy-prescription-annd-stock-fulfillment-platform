const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const orderItemController = require('../controllers/orderItemController');

// All routes require authentication
router.use(authenticate);

router.get('/:orderId', orderItemController.getItemsByOrder);
router.patch('/:id/status', orderItemController.updateItemStatus);
router.patch('/:id/substitute', orderItemController.setSubstitution);

module.exports = router;
