const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Helper function to safely attach route handlers
const handle = (fnName) => {
  if (typeof adminController[fnName] !== "function") {
    console.error(`⚠️ WARNING: Controller function "${fnName}" is undefined!`);
    return (req, res) => {
      res.status(501).json({
        success: false,
        message: `Handler ${fnName} is not implemented on the server yet.`,
      });
    };
  }
  return adminController[fnName];
};

/* ==========================================================
   ADMIN MANAGEMENT ROUTES
========================================================== */
router.get("/pharmacists", handle("getAllPharmacists"));
router.get("/delivery-partners", handle("getAllDeliveryPartners"));

/* ==========================================================
   METRICS & REPORT ROUTES
========================================================== */
router.get("/top-selling-medicines", handle("getTopSellingMedicines"));
router.get("/low-stock-report", handle("getLowStockReport"));
router.get("/branch-performance", handle("getBranchPerformance"));
router.get("/branch-stock-alerts", handle("getBranchStockAlerts"));
router.get("/todays-orders", handle("getTodaysOrders"));
router.get("/prescription-logs", handle("getPrescriptionLogs"));

/* ==========================================================
   ORDER & REPORTING ROUTES
========================================================== */
router.get("/manual-orders", handle("getManualOrders"));
router.get("/pending-orders", handle("getPendingOrders"));
router.patch("/update-order-status", handle("updateOrderStatus"));
router.patch("/orders/:orderId/status", handle("updateOrderStatus"));

router.get("/branch-performance-report", handle("getExportBranchPerformance"));
router.get("/stock-failures", handle("getStockRelatedFailures"));


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

// const router = express.Router();

// const adminController = require("../controllers/adminController");

// router.get("/top-selling-medicines", adminController.getTopSellingMedicines);
// router.get("/low-stock-report", adminController.getLowStockReport);
// router.get("/branch-performance", adminController.getBranchPerformance);
// router.get("/branch-stock-alerts", adminController.getBranchStockAlerts);
// router.get("/todays-orders", adminController.getTodaysOrders);
// router.get("/prescription-logs", adminController.getPrescriptionLogs);

// router.get("/manual-orders", adminController.getManualOrders);
// router.patch("/update-order-status", adminController.updateOrderStatus);
// router.get("/branch-performance-report", adminController.getExportBranchPerformance);
// router.get("/stock-failures", adminController.getStockRelatedFailures);

// module.exports = router;
