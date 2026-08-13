const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const deliveryJobController = require('../controllers/deliveryJobController');

// All routes require authentication
router.use(authenticate);

// Delivery partner views their own jobs
router.get('/my-jobs', deliveryJobController.getMyJobs);

// Lookup by order or partner
router.get('/order/:orderId', deliveryJobController.getJobByOrder);
router.get('/partner/:partnerId', authorize('admin'), deliveryJobController.getJobsByPartner);

// Create and update
router.post('/', authorize('admin'), deliveryJobController.createJob);
router.patch('/:id/status', deliveryJobController.updateJobStatus);

module.exports = router;
