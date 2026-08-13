const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const medicineController = require('../controllers/medicineController');

// Public read access
router.get('/', medicineController.getAllMedicines);
router.get('/:id', medicineController.getMedicineById);

// Staff write access (Pharmacist & Admin)
router.post('/', authenticate, authorize('pharmacist', 'admin'), medicineController.createMedicine);
router.put('/:id', authenticate, authorize('pharmacist', 'admin'), medicineController.updateMedicine);
router.patch('/:id/deactivate', authenticate, authorize('admin'), medicineController.deactivateMedicine);

module.exports = router;
