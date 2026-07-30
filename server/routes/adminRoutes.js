const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getAllPharmacists,
  getPharmacistById,
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  getAllPrescriptions,
  getPendingPrescriptions,
  getInventoryOverview,
  getBranchOverview,
  getAllMedicines,
  addMedicine,
  deleteMedicine,
} = require("../controllers/adminControllers");

// Dashboard
router.get("/dashboard", getDashboardStats);

// Medicine Management

// // Pharmacist Management
router.get("/pharmacists", getAllPharmacists);
router.get("/pharmacists/:id", getPharmacistById);

// // Delivery Partner Management
router.get("/delivery-partners", getAllDeliveryPartners);
router.get("/delivery-partners/:id", getDeliveryPartnerById);

// // Prescription Monitoring
router.get("/prescriptions", getAllPrescriptions);
router.get("/prescriptions/pending", getPendingPrescriptions);

// // Inventory Monitoring
router.get("/inventory", getInventoryOverview);

// // Branch Monitoring
router.get("/branches", getBranchOverview);

// ===============================
// Medicine Management
// ===============================

// Get all medicines
router.get("/medicines", getAllMedicines);

// Add new medicine
router.post("/medicines", addMedicine);

// Delete medicine
router.delete("/medicines/:id", deleteMedicine);

module.exports = router;
