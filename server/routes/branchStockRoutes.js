const express = require("express");
const router = express.Router();

const branchStockController = require("../controllers/branchStockController");

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View all stock
router.get(
  "/",
  authenticateUser,
  authorizeRoles("admin", "pharmacist"),
  branchStockController.getAllStock
);

// View stock of one branch
router.get(
  "/:branchId",
  authenticateUser,
  authorizeRoles("admin", "pharmacist"),
  branchStockController.getBranchStock
);

// Low stock
router.get(
  "/low-stock/:branchId",
  authenticateUser,
  authorizeRoles("admin", "pharmacist"),
  branchStockController.getLowStock
);

// Update stock
router.put(
  "/:branchId/:medicineId",
  authenticateUser,
  authorizeRoles("pharmacist"),
  branchStockController.updateStock
);

module.exports = router;