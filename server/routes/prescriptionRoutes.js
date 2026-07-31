const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");

router.get("/pending", prescriptionController.getPendingPrescriptions);
router.get("/:id", prescriptionController.getPrescriptionById);
router.patch("/:id/approve", prescriptionController.approvePrescription);
router.patch("/:id/reject", prescriptionController.rejectPrescription);

module.exports = router;