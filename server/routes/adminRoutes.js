const express = require("express");
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