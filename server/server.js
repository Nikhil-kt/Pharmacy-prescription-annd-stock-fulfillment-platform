require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { createClient } = require("@supabase/supabase-js");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/adminRoutes");
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

// Test Database Connection
/* ==========================================================
   SUPABASE DATABASE TEST
========================================================== */

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

    res.json({
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

/* ==========================================================
   FIREBASE SIGNUP
========================================================== */

app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    await db.collection("users").doc(userRecord.uid).set({
      fullName,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      role,
    });
  } catch (error) {
    console.error("Firebase Signup Error:", error);

    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create account.",
    });
  }
});

/* ==========================================================
   FIREBASE LOGIN
========================================================== */

app.post("/api/login", async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    let userRecord;

    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const userDoc = await db
      .collection("users")
      .doc(userRecord.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(400).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const userData = userDoc.data();

    if (userData.role !== role) {
      return res.status(400).json({
        success: false,
        message: `No ${role} account registered with this email.`,
      });
    }

    res.json({
      success: true,
      message: "Login successful!",
      role: userData.role,
      user: {
        uid: userRecord.uid,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error("Firebase Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

/* ==========================================================
   START SERVER
========================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RxConnect Backend running on http://localhost:${PORT}`);
});
