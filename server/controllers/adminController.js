const supabase = require("../config/supabase");

// 1. TOP-SELLING MEDICINES
exports.getTopSellingMedicines = async (req, res) => {
  try {
    // Join order_items with medicines and orders
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        medicines (
          id,
          name,
          category
        )
      `);

    if (error) throw error;

    // Aggregate sales per medicine
    const salesMap = {};
    data.forEach((item) => {
      const medId = item.medicines?.id || "unknown";
      const medName = item.medicines?.name || "Unknown Medicine";
      const category = item.medicines?.category || "General";

      if (!salesMap[medId]) {
        salesMap[medId] = {
          id: medId,
          name: medName,
          category: category,
          totalSold: 0,
          revenue: 0,
        };
      }
      salesMap[medId].totalSold += item.quantity;
      salesMap[medId].revenue += item.quantity * item.price;
    });

    const topSelling = Object.values(salesMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return res.status(200).json({ success: true, data: topSelling });
  } catch (err) {
    console.error("Error fetching top selling medicines:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. DISPLAY LOW STOCK REPORT
exports.getLowStockReport = async (req, res) => {
  try {
    // Fetch branch stock items where quantity <= low_stock_threshold
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        id,
        quantity,
        low_stock_threshold,
        updated_at,
        branches ( id, name ),
        medicines ( id, name, category )
      `);

    if (error) throw error;

    // Filter where quantity is below or equal to threshold
    const lowStockItems = data.filter(
      (item) => item.quantity <= item.low_stock_threshold
    );

    return res.status(200).json({ success: true, data: lowStockItems });
  } catch (err) {
    console.error("Error fetching low stock report:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. SHOW BRANCH PERFORMANCE METRICS
exports.getBranchPerformance = async (req, res) => {
  try {
    const { data: branches, error: branchErr } = await supabase
      .from("branches")
      .select("id, name");

    if (branchErr) throw branchErr;

    const { data: orders, error: orderErr } = await supabase
      .from("orders")
      .select("branch_id, total_amount, status");

    if (orderErr) throw orderErr;

    // Calculate metrics per branch
    const performance = branches.map((branch) => {
      const branchOrders = orders.filter((o) => o.branch_id === branch.id);
      const totalRevenue = branchOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );

      return {
        branchId: branch.id,
        branchName: branch.name,
        totalOrders: branchOrders.length,
        totalRevenue: totalRevenue,
      };
    });

    return res.status(200).json({ success: true, data: performance });
  } catch (err) {
    console.error("Error fetching branch performance:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/branch-stock-alerts
exports.getBranchStockAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        id,
        quantity,
        low_stock_threshold,
        medicines ( id, name, category ),
        branches ( id, name )
      `)
      .filter("quantity", "lte", "low_stock_threshold");

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/todays-orders
exports.getTodaysOrders = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        branches ( name ),
        users!customer_id ( full_name, email )
      `)
      .gte("created_at", startOfDay.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/prescription-logs
exports.getPrescriptionLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescription_reviews")
      .select(`
        id,
        status,
        remarks,
        reviewed_at,
        prescriptions ( id, image_url, customer_id ),
        users!pharmacist_id ( full_name, email )
      `)
      .order("reviewed_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};