require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
const prescriptionRoutes = require('./routes/prescriptionRoutes'); // or whatever filename exists in /routes
app.use("/api/prescriptions", prescriptionRoutes);
const deliveryRoutes = require("./routes/deliveryRoutes");
app.use("/api/delivery", deliveryRoutes);

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RxConnect Backend is Running 🚀",
  });
});

app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", adminRoutes);

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
    router.get('/stats', async (req, res) => {
  try {
    // You can replace these static counts with real database queries later
    const statsData = {
      total: 12,
      pending: 3,
      inTransit: 4,
      completed: 5,
    };

    return res.status(200).json({
      success: true,
      stats: statsData,
    });
  } catch (error) {
    console.error('Error fetching delivery stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery stats',
    });
  }
});

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

app.get('/api/delivery/stats', (req, res) => {
  res.status(200).json({
    success: true,
    stats: {
      total: 10,
      pending: 2,
      inTransit: 3,
      completed: 5,
    },
  });
});
// -----------------------------------------------------------------
app.get('/api/prescription/unassigned', async (req, res) => {
  try {
    // Replace with Supabase query if connected:
    // const { data, error } = await supabase.from('prescriptions').select('*').eq('status', 'unassigned');
    res.json([
      { id: 'ord_101', patient_name: 'John Doe', address: '123 Main St' },
      { id: 'ord_102', patient_name: 'Sarah Connor', address: '456 Elm St' },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------
// 3. GET Delivery Partners
// -----------------------------------------------------------------
app.get('/api/delivery/partners', async (req, res) => {
  try {
    // Replace with Supabase query if connected:
    // const { data, error } = await supabase.from('delivery_partners').select('*').eq('status', 'available');
    res.json([
      { id: 'driver_1', name: 'Alex Smith', phone: '555-0199' },
      { id: 'driver_2', name: 'Maria Garcia', phone: '555-0188' },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------
// 4. POST Assign Delivery Partner
// -----------------------------------------------------------------

app.post('/api/delivery/assign', async (req, res) => {
  try {
    const { order_id, delivery_partner_id, notes, status } = req.body;

    // Use passed status, or fallback to 'pending'
    const validStatus = status || 'pending';

    const { data, error } = await supabase
      .from('deliveries')
      .insert([
        {
          order_id,
          delivery_partner_id,
          notes,
          status: validStatus,
        },
      ]);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Delivery assigned successfully!', data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post('/api/delivery/assign', async (req, res) => {
  try {
    const { order_id, delivery_partner_id, notes, status } = req.body;

    // 1. Basic validation
    if (!order_id || !delivery_partner_id) {
      return res.status(400).json({
        success: false,
        error: 'order_id and delivery_partner_id are required.',
      });
    }

    // 2. Insert into Supabase
    const { data, error } = await supabase
      .from('deliveries')
      .insert([
        {
          order_id,
          delivery_partner_id,
          notes: notes || '',
          status: status || 'ASSIGNED', // Adjust casing if needed
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/delivery/assign', async (req, res) => {
  try {
    const { order_id, delivery_partner_id, notes, status } = req.body;

    const { data, error } = await supabase
      .from('deliveries')
      .insert([
        {
          order_id,
          delivery_partner_id,
          notes: notes || '',
          // Fallback status try
          status: status || 'PENDING',
        },
      ])
      .select();

    if (error) {
      // 🚨 THIS WILL PRINT THE EXACT POSTGRES CHECK CONSTRAINT DETAILS IN YOUR BACKEND TERMINAL
      console.log('=== SUPABASE ERROR LOG ===');
      console.log('Message:', error.message);
      console.log('Details:', error.details);
      console.log('Hint:', error.hint);
      console.log('==========================');

      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/delivery/assign', async (req, res) => {
  try {
    const { order_id, delivery_partner_id, notes } = req.body;

    // Validate request body
    if (!order_id || !delivery_partner_id) {
      return res.status(400).json({
        success: false,
        message: 'order_id and delivery_partner_id are required.',
      });
    }

    // MOCK RESPONSE: Simulate database insertion
    // (Comment out supabase.from('deliveries').insert() for now)
    const mockAssignment = {
      id: "del_test_999",
      order_id,
      delivery_partner_id,
      notes: notes || '',
      status: "ASSIGNED", // Mock status
      created_at: new Date().toISOString()
    };

    console.log('✅ [DEV MOCK] Assigned order:', mockAssignment);

    return res.status(200).json({
      success: true,
      message: 'Delivery assigned successfully! (Mocked)',
      data: mockAssignment,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
/* ==========================================================
   START SERVER
========================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RxConnect Backend running on http://localhost:${PORT}`);
});
