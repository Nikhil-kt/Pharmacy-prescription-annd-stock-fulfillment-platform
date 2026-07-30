const express = require("express");

const router = express.Router();

const {

uploadPrescription,
getAllPrescriptions,
getPendingPrescriptions,
getPrescriptionById,
approvePrescription,
rejectPrescription

} = require("../controllers/prescriptionController");

router.post("/upload", uploadPrescription);

router.get("/", getAllPrescriptions);

router.get("/pending", getPendingPrescriptions);

router.get("/:id", getPrescriptionById);

router.put("/:id/approve", approvePrescription);

router.put("/:id/reject", rejectPrescription);

module.exports = router;