const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminControllers = require("../controllers/adminControllers");

// ─── adminController routes ───────────────────────────────────────────────────
router.get("/dashboard", adminController.getDashboardStats);
router.get("/top-selling-medicines", adminController.getTopSellingMedicines);
router.get("/low-stock-report", adminController.getLowStockReport);
router.get("/branch-performance", adminController.getBranchPerformance);
router.get("/export-branch-performance", adminController.getExportBranchPerformance);
router.get("/branch-stock-alerts", adminController.getBranchStockAlerts);
router.get("/todays-orders", adminController.getTodaysOrders);
router.get("/prescription-logs", adminController.getPrescriptionLogs);
router.get("/manual-orders", adminController.getManualOrders);
router.patch("/update-order-status/:orderId", adminController.updateOrderStatus);
router.get("/stock-failures", adminController.getStockRelatedFailures);
router.get("/pending-orders", adminController.getPendingOrders);
router.get("/all-pharmacists", adminController.getAllPharmacists);
router.get("/all-delivery-partners", adminController.getAllDeliveryPartners);

// ─── adminControllers routes ──────────────────────────────────────────────────
router.get("/pharmacists", adminControllers.getAllPharmacists);
router.get("/pharmacists/:id", adminControllers.getPharmacistById);
router.get("/delivery-partners", adminControllers.getAllDeliveryPartners);
router.get("/delivery-partners/:id", adminControllers.getDeliveryPartnerById);
router.get("/prescriptions", adminControllers.getAllPrescriptions);
router.get("/prescriptions/pending", adminControllers.getPendingPrescriptions);
router.get("/inventory", adminControllers.getInventoryOverview);
router.get("/branches", adminControllers.getBranchOverview);
router.post("/medicines", adminControllers.addMedicine);
router.get("/medicines", adminControllers.getAllMedicines);
router.delete("/medicines/:id", adminControllers.deleteMedicine);

module.exports = router;
