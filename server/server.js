const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Supabase
// ===============================
const supabase = require("./config/supabase");

// ===============================
// Routes
// ===============================
const branchStockRoutes = require("./routes/branchStockRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/branch-stock", branchStockRoutes);
app.use("/api/orders", orderRoutes);

// ===============================
// Root Route
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RxConnect Backend API is Running 🚀",
  });
});

// ===============================
// Test Database Connection
// ===============================
app.get("/api/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .limit(5);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      medicines: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});