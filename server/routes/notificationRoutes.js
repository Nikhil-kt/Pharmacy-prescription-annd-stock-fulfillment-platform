const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

// Admin/system can create notifications for any user
router.post('/', authorize('admin'), notificationController.createNotification);

module.exports = router;
