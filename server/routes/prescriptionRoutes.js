const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// All routes require authentication
router.use(authenticate);

router.get('/', prescriptionController.getPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.post('/', prescriptionController.createPrescription);

// Staff-only review routes (Pharmacist & Admin)
router.patch('/:id', authorize('pharmacist', 'admin'), prescriptionController.reviewPrescription);
router.patch('/:id/status', authorize('pharmacist', 'admin'), prescriptionController.reviewPrescription);
router.patch('/:id/review', authorize('pharmacist', 'admin'), prescriptionController.reviewPrescription);

module.exports = router;
