const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const addressController = require('../controllers/addressController');

// All address routes require authentication
router.use(authenticate);

router.get('/', addressController.getMyAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
