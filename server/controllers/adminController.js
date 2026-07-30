const supabase = require("../config/supabase");

// 1. TOP-SELLING MEDICINES
exports.getTopSellingMedicines = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        medicines:medicine_id (
          id,
          name,
          category
        )
      `);

    if (error) throw error;

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
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        id,
        quantity,
        low_stock_threshold,
        updated_at,
        branches:branch_id ( id, name ),
        medicines:medicine_id ( id, name, category )
      `);

    if (error) throw error;

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

// 4. GET BRANCH STOCK ALERTS
exports.getBranchStockAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        id,
        quantity,
        low_stock_threshold,
        medicines:medicine_id ( id, name, category ),
        branches:branch_id ( id, name )
      `)
      .filter("quantity", "lte", "low_stock_threshold");

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. GET TODAY'S ORDERS
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
        branches:branch_id ( name ),
        users:customer_id ( full_name, email )
      `)
      .gte("created_at", startOfDay.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 6. GET PRESCRIPTION LOGS
exports.getPrescriptionLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescription_reviews")
      .select(`
        id,
        status,
        remarks,
        reviewed_at,
        prescriptions:prescription_id ( id, image_url, customer_id ),
        users:pharmacist_id ( full_name, email )
      `)
      .order("reviewed_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 7. EXPORT BRANCH PERFORMANCE REPORT
exports.getExportBranchPerformance = async (req, res) => {
  try {
    const { data: branches, error: branchErr } = await supabase
      .from("branches")
      .select("id, name, address");

    if (branchErr) throw branchErr;

    const { data: orders, error: orderErr } = await supabase
      .from("orders")
      .select("branch_id, total_amount, status");

    if (orderErr) throw orderErr;

    const report = branches.map((branch) => {
      const branchOrders = orders.filter((o) => o.branch_id === branch.id);
      const totalRevenue = branchOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );
      const completedOrders = branchOrders.filter(
        (o) => o.status === "completed"
      ).length;
      const cancelledOrders = branchOrders.filter(
        (o) => o.status === "cancelled"
      ).length;

      return {
        branch_id: branch.id,
        branch_name: branch.name,
        address: branch.address || "N/A",
        total_orders: branchOrders.length,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        total_revenue: totalRevenue,
      };
    });

    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error("Error generating branch performance report:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 8. REVIEW MANUAL ORDERS (Fetch & Update)
exports.getManualOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        users:customer_id ( full_name, email, phone ),
        branches:branch_id ( name ),
        order_items (
          id,
          quantity,
          price,
          medicines:medicine_id ( name )
        ),
        prescriptions (
          id,
          image_url,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manual orders:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching manual orders:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order_id)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9. TRACK STOCK-RELATED ORDER FAILURES
exports.getStockRelatedFailures = async (req, res) => {
  try {
    const { data: cancelledOrders, error: orderErr } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        branches:branch_id ( name ),
        order_items (
          medicine_id,
          quantity,
          medicines:medicine_id ( name )
        )
      `)
      .eq("status", "cancelled");

    if (orderErr) throw orderErr;

    const stockFailures = cancelledOrders.map((order) => ({
      order_id: order.id,
      branch: order.branches?.name || "Unknown",
      cancelled_at: order.created_at,
      items: order.order_items.map((item) => ({
        medicine_name: item.medicines?.name,
        requested_quantity: item.quantity,
      })),
    }));

    return res.status(200).json({ success: true, data: stockFailures });
  } catch (err) {
    console.error("Error fetching stock failures:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};