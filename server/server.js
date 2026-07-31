const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], credentials: true }));
app.use(express.json({ limit: "50mb" }));

// Routes
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const customerRoutes = require("./routes/customerRoutes.js");
const deliveryRoutes = require("./routes/deliveryRoutes.js");
const prescriptionRoutes = require("./routes/prescriptionRoutes.js");
const inventoryRoutes = require("./routes/InventorystockRoutes.js");
const medicineRoutes = require("./routes/medicineRoutes.js");

// Route middleware
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/medicines", medicineRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ success: true, status: "Server running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});