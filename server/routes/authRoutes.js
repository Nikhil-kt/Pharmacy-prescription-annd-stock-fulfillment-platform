const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const supabase = require("../config/supabase");

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (role !== "customer") {
      return res.status(400).json({
        success: false,
        message: "Only customers can self-register. Pharmacists and delivery partners are added by admins.",
      });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("customers")
      .insert({ full_name: fullName, email, phone: "", password_hash })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: data.id, full_name: data.full_name, email: data.email, role: "customer" },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    let userData = null;
    let foundRole = role;

    // Helper to check hardcoded test accounts
    const checkTestAccounts = () => {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@rxconnect.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      
      const pharmacistEmail = process.env.PHARMACIST_EMAIL || "pharmacist@rxconnect.com";
      const pharmacistPassword = process.env.PHARMACIST_PASSWORD || "pharmacist123";
      
      const deliveryEmail = process.env.DELIVERY_EMAIL || "delivery@rxconnect.com";
      const deliveryPassword = process.env.DELIVERY_PASSWORD || "delivery123";
      
      const customerEmail = process.env.CUSTOMER_EMAIL || "customer@rxconnect.com";
      const customerPassword = process.env.CUSTOMER_PASSWORD || "customer123";

      if (email === adminEmail && password === adminPassword) {
        return { id: "admin", full_name: "Administrator", email: adminEmail, role: "admin" };
      }
      if (email === pharmacistEmail && password === pharmacistPassword) {
        return { id: "pharmacist_test", full_name: "Test Pharmacist", email: pharmacistEmail, role: "pharmacist" };
      }
      if (email === deliveryEmail && password === deliveryPassword) {
        return { id: "delivery_test", full_name: "Test Delivery", email: deliveryEmail, role: "delivery" };
      }
      if (email === customerEmail && password === customerPassword) {
        return { id: "customer_test", full_name: "Test Customer", email: customerEmail, role: "customer" };
      }
      return null;
    };

    if (foundRole) {
      // Original logic for when role is explicitly provided
      if (foundRole === "customer") {
        const testUser = checkTestAccounts();
        if (testUser && testUser.role === "customer") return res.status(200).json({ success: true, role: "customer", user: testUser });
        
        const { data, error } = await supabase.from("customers").select("id, full_name, email, password_hash, phone, address, created_at").eq("email", email).maybeSingle();
        if (error) throw error;
        userData = data;
      } else if (foundRole === "pharmacist") {
        const testUser = checkTestAccounts();
        if (testUser && testUser.role === "pharmacist") return res.status(200).json({ success: true, role: "pharmacist", user: testUser });

        const { data, error } = await supabase.from("pharmacists").select("id, full_name, email, phone, license_number, status, branch_id, created_at").eq("email", email).maybeSingle();
        if (error) throw error;
        if (data) userData = { ...data, password_hash: null };
      } else if (foundRole === "delivery") {
        const testUser = checkTestAccounts();
        if (testUser && testUser.role === "delivery") return res.status(200).json({ success: true, role: "delivery", user: testUser });

        const { data, error } = await supabase.from("delivery_partners").select("id, full_name, email, phone, vehicle_type, vehicle_number, status, branch_id, created_at").eq("email", email).maybeSingle();
        if (error) throw error;
        if (data) userData = { ...data, password_hash: null };
      } else if (foundRole === "admin") {
        const testUser = checkTestAccounts();
        if (testUser && testUser.role === "admin") return res.status(200).json({ success: true, role: "admin", user: testUser });
        return res.status(401).json({ success: false, message: "Invalid admin credentials." });
      } else {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
    } else {
      // Role-less login

      // 1. Check hardcoded test accounts first
      const testUser = checkTestAccounts();
      if (testUser) {
        return res.status(200).json({ success: true, role: testUser.role, user: testUser });
      }

      // 2. Try Supabase Auth (for users created via Supabase signUp)
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!authError && authData.user) {
          // Fetch user details from the public "users" table
          const { data: supabaseUser } = await supabase
            .from("users")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (supabaseUser) {
            return res.status(200).json({
              success: true,
              role: supabaseUser.role || "customer",
              user: supabaseUser,
            });
          } else {
            // User is authenticated in Supabase but missing from public.users table.
            // Allow login at any cost.
            return res.status(200).json({
              success: true,
              role: "customer",
              user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: "Authenticated User",
                role: "customer"
              }
            });
          }
        }
      } catch (authErr) {
        // Ignore auth error and fall through to custom table check
      }

      // 3. Fallback: Search custom tables (Legacy)
      
      // Try customer
      const { data: cData } = await supabase.from("customers").select("id, full_name, email, password_hash, phone, address, created_at").eq("email", email).maybeSingle();
      if (cData) {
        userData = cData;
        foundRole = "customer";
      } else {
        // Try pharmacist
        const { data: pData } = await supabase.from("pharmacists").select("id, full_name, email, phone, license_number, status, branch_id, created_at").eq("email", email).maybeSingle();
        if (pData) {
          userData = { ...pData, password_hash: null };
          foundRole = "pharmacist";
        } else {
          // Try delivery
          const { data: dData } = await supabase.from("delivery_partners").select("id, full_name, email, phone, vehicle_type, vehicle_number, status, branch_id, created_at").eq("email", email).maybeSingle();
          if (dData) {
            userData = { ...dData, password_hash: null };
            foundRole = "delivery";
          }
        }
      }
    }

    if (!userData) {
      return res.status(401).json({ success: false, message: "Invalid login credentials." });
    }

    // Password verification for legacy customers
    if (foundRole === "customer") {
      if (!userData.password_hash) {
        return res.status(401).json({ success: false, message: "Account has no password set." });
      }
      const valid = await bcrypt.compare(password, userData.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: "Invalid login credentials." });
      }
    } else {
      // For pharmacist/delivery — no password hash stored, accept any password for now
    }

    const { password_hash, ...safeUser } = userData;

    return res.status(200).json({
      success: true,
      role: foundRole,
      user: { ...safeUser, role: foundRole },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
