const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorHandler");

// ── Route imports ──────────────────────────────────────────────
const profileRoutes = require("./routes/profileRoutes");
const addressRoutes = require("./routes/addressRoutes");
const branchRoutes = require("./routes/branchRoutes");
const branchStaffRoutes = require("./routes/branchStaffRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const medicineSubstituteRoutes = require("./routes/medicineSubstituteRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockLedgerRoutes = require("./routes/stockLedgerRoutes");
const lowStockAlertRoutes = require("./routes/lowStockAlertRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const deliveryJobRoutes = require("./routes/deliveryJobRoutes");
const fulfillmentFailureRoutes = require("./routes/fulfillmentFailureRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// ── Global middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "RxConnect API is running.", timestamp: new Date().toISOString() });
});

// ── API routes ─────────────────────────────────────────────────
app.use("/api/profiles", profileRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/branch-staff", branchStaffRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/medicine-substitutes", medicineSubstituteRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stock-ledger", stockLedgerRoutes);
app.use("/api/low-stock-alerts", lowStockAlertRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/delivery-jobs", deliveryJobRoutes);
app.use("/api/fulfillment-failures", fulfillmentFailureRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Global error handler ───────────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RxConnect server running on port ${PORT}`);
});
