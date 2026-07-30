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
} = require("../controllers/adminControllers");

// Dashboard
router.get("/dashboard", getDashboardStats);

// Customer Management

// // Pharmacist Management
router.get("/pharmacists", getAllPharmacists);
router.get("/pharmacists/:id", getPharmacistById);

// // Delivery Partner Management
router.get("/delivery-partners", getAllDeliveryPartners);
router.get("/delivery-partners/:id", getDeliveryPartnerById);

// // Order Management


// // Prescription Monitoring
router.get("/prescriptions", getAllPrescriptions);
router.get("/prescriptions/pending", getPendingPrescriptions);

// // Delivery Assignment

// // Inventory Monitoring
router.get("/inventory", getInventoryOverview);

// // Branch Monitoring
router.get("/branches", getBranchOverview);

module.exports = router;
