require("dotenv").config();
const express = require("express");
const cors = require("cors");

const prescriptionRoutes = require("./routes/prescriptionRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const inventorystockRoutes = require("./routes/InventorystockRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabase = require("./config/supabase");

/* ==========================================================
   FIREBASE ADMIN INITIALIZATION
========================================================== */
try {
  const { initializeApp, cert, getApps } = require("firebase-admin/app");
  const { getAuth } = require("firebase-admin/auth");
  const { getFirestore } = require("firebase-admin/firestore");

  const serviceAccount = require("./serviceAccountKey.json");

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  const auth = getAuth();
  const db = getFirestore();
} catch (err) {
  console.warn("⚠️ Firebase initialization warning:", err.message);
}

/* ==========================================================
   ROOT ROUTE
========================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RxConnect Backend is Running 🚀",
  });
});

app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inventory", inventorystockRoutes);
app.use("/api/customer", customerRoutes);

// Unhandled error logger to prevent silent process crashes
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 RxConnect Backend running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
  } else {
    console.error("❌ Server Error:", err);
  }
});
