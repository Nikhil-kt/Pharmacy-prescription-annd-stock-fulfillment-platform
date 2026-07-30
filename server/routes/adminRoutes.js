const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const {
  getTopSellingMedicines,
  getLowStockReport,
  getBranchPerformance,
} = require("../controllers/adminController");

router.get("/top-selling-medicines", getTopSellingMedicines);
router.get("/low-stock-report", getLowStockReport);
router.get("/branch-performance", getBranchPerformance);
router.get("/branch-stock-alerts", adminController.getBranchStockAlerts);
router.get("/todays-orders", adminController.getTodaysOrders);
router.get("/prescription-logs", adminController.getPrescriptionLogs);

module.exports = router;

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
