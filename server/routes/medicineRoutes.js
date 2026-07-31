const express = require("express");
const router = express.Router();
const {
  getAllMedicines,
  getMedicineById,
  addMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);
router.post("/", addMedicine);
router.delete("/:id", deleteMedicine);

module.exports = router;