const express = require("express");

const router = express.Router();

const {
  getAllStock,

  getBranchStock,

  getLowStock,

  updateStock,

  addMedicineStock,
} = require("../controllers/InventoryStockController");

router.get("/", getAllStock);

router.get("/:branchId", getBranchStock);

router.get("/:branchId/low-stock", getLowStock);

router.put("/:branchId/:medicineId", updateStock);

// Add medicine stock to a branch
// router.post(
//   "/add",
//   authenticateUser,
//   authorizeRoles("admin", "pharmacist"),
//   branchStockController.addMedicineStock
// );

router.post("/add", addMedicineStock);

module.exports = router;