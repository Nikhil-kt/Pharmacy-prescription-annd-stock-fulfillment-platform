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