const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");

// Define routes using valid functions from the controller
router.get("/pending", prescriptionController.getPendingPrescriptions);
router.get("/:id", prescriptionController.getPrescriptionById);
router.post("/upload", prescriptionController.uploadPrescription);
router.patch("/:id/approve", prescriptionController.approvePrescription);
router.patch("/:id/reject", prescriptionController.rejectPrescription);

module.exports = router;