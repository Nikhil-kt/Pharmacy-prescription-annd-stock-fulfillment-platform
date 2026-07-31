const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Dashboard & Stats
router.get("/dashboard", adminController.getDashboardStats);
router.get("/top-selling-medicines", adminController.getTopSellingMedicines);
router.get("/low-stock-report", adminController.getLowStockReport);
router.get("/branch-performance", adminController.getBranchPerformance);
router.get("/export-branch-performance", adminController.getExportBranchPerformance);
router.get("/branch-stock-alerts", adminController.getBranchStockAlerts);
router.get("/todays-orders", adminController.getTodaysOrders);
router.get("/prescription-logs", adminController.getPrescriptionLogs);

// Orders
router.get("/manual-orders", adminController.getManualOrders);
router.get("/pending-orders", adminController.getPendingOrders);
//router.patch("/update-order-status", adminController.updateOrderStatus);
router.get("/stock-failures", adminController.getStockRelatedFailures);

// Management
//router.get("/pharmacists", adminController.getAllPharmacists);
//router.get("/delivery-partners", adminController.getAllDeliveryPartners);
//router.get("/medicines", adminController.getAllMedicines);
//router.post("/medicines", adminController.addMedicine);
//router.delete("/medicines/:id", adminController.deleteMedicine);

module.exports = router;