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
const router = express.Router();

const adminController = require("../controllers/adminController");

router.get("/top-selling-medicines", adminController.getTopSellingMedicines);
router.get("/low-stock-report", adminController.getLowStockReport);
router.get("/branch-performance", adminController.getBranchPerformance);
router.get("/branch-stock-alerts", adminController.getBranchStockAlerts);
router.get("/todays-orders", adminController.getTodaysOrders);
router.get("/prescription-logs", adminController.getPrescriptionLogs);

router.get("/manual-orders", adminController.getManualOrders);
router.patch("/update-order-status", adminController.updateOrderStatus);
router.get("/branch-performance-report", adminController.getExportBranchPerformance);
router.get("/stock-failures", adminController.getStockRelatedFailures);

module.exports = router;
