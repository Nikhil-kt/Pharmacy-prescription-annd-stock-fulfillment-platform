const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const stockLedgerController = require('../controllers/stockLedgerController');

// All stock ledger routes require authentication
router.use(authenticate);

router.get('/:branchId', stockLedgerController.getLedgerByBranch);

module.exports = router;
