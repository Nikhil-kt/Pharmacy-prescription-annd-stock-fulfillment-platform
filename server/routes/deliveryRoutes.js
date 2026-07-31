const express = require("express");

const router = express.Router();

const {
  getDeliveries,
  getDeliveryById,
  assignDelivery,
  pickupOrder,
  startDelivery,
  completeDelivery,
  getDeliveryDashboard,
} = require("../controllers/deliveryControllers");

router.get("/", getDeliveries);

router.get("/:id", getDeliveryById);

router.post("/assign", assignDelivery);

router.put("/:id/pickup", pickupOrder);

router.put("/:id/out-for-delivery", startDelivery);

router.put("/:id/delivered", completeDelivery);



// Delivery Partner Dashboard
router.get("/partner/:partnerId/dashboard", getDeliveryDashboard);

module.exports = router;
