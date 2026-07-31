const express = require("express");

const router = express.Router();

const {
  getAllBranches,
  getMedicinesByBranch,
  getMedicineDetails,
  searchMedicines
} = require("../controllers/customerController");

// View all branches
router.get("/branches", getAllBranches);

// View medicines available in one branch
router.get("/branches/:branchId/medicines", getMedicinesByBranch);

// View single medicine details
router.get("/medicines/:medicineId", getMedicineDetails);

// Search medicine
router.get("/search", searchMedicines);

module.exports = router;
