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


module.exports = router;
