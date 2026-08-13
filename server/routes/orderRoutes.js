const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// All routes require authentication
router.use(authenticate);

router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.get('/:id/history', orderController.getOrderHistory);

module.exports = router;
