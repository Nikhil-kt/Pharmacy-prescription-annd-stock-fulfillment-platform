require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { createClient } = require("@supabase/supabase-js");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const inventorystockRoutes = require("./routes/InventorystockRoutes");
const customerRoutes = require("./routes/customerRoutes");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
// Routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Supabase Client
const supabase = require("./config/supabase");

/* ==========================================================
   FIREBASE ADMIN INITIALIZATION
========================================================== */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RxConnect Backend running on http://localhost:${PORT}`);
});
