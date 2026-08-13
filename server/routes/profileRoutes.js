const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const profileController = require('../controllers/profileController');

// Public registration endpoint
router.post('/register', profileController.registerProfile);

// Self-service routes (any authenticated user)
router.get('/me', authenticate, profileController.getMyProfile);
router.put('/me', authenticate, profileController.updateMyProfile);

// Admin-only routes
router.get('/pending', authenticate, authorize('admin'), profileController.getPendingProfiles);
router.get('/', authenticate, authorize('admin'), profileController.getAllProfiles);
router.get('/:id', authenticate, authorize('admin'), profileController.getProfileById);
router.patch('/:id/approve', authenticate, authorize('admin'), profileController.approveProfile);
router.patch('/:id/reject', authenticate, authorize('admin'), profileController.rejectProfile);

module.exports = router;
