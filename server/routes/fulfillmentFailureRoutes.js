const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const fulfillmentFailureController = require('../controllers/fulfillmentFailureController');

// All routes require authentication
router.use(authenticate);

router.get('/order/:orderId', fulfillmentFailureController.getFailuresByOrder);
router.get('/branch/:branchId', fulfillmentFailureController.getFailuresByBranch);
router.post('/', fulfillmentFailureController.createFailure);

module.exports = router;
