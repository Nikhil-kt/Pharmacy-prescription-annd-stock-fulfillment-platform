const supabase = require("../config/supabase");

// 1. TOP-SELLING MEDICINES
const getTopSellingMedicines = async (req, res) => {
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
    (data || []).forEach((item) => {
      const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
      const medId = med?.id || "unknown";
      const medName = med?.name || "Unknown Medicine";
      const category = med?.category || "General";
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      if (!salesMap[medId]) {
        salesMap[medId] = {
          id: medId,
          name: medName,
          category: category,
          totalSold: 0,
          revenue: 0,
        };
      }
      salesMap[medId].totalSold += quantity;
      salesMap[medId].revenue += quantity * price;
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
const getLowStockReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        id,
        quantity,
        low_stock_threshold,
        updated_at,
        branches:branch_id ( id, branch_name, address, city ),
        medicines:medicine_id ( id, name, category, price )
      `);

    if (error) throw error;

    const lowStockItems = (data || []).filter(
      (item) => Number(item.quantity) <= Number(item.low_stock_threshold)
    );

    return res.status(200).json({ success: true, data: lowStockItems });
  } catch (err) {
    console.error("Error fetching low stock report:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. SHOW BRANCH PERFORMANCE METRICS
const getBranchPerformance = async (req, res) => {
  try {
    const { data: branches, error: branchErr } = await supabase
      .from("branches")
      .select("id, branch_name, city");

    if (branchErr) throw branchErr;

    const { data: orders, error: orderErr } = await supabase
      .from("orders")
      .select("branch_id, total_amount, status");

    if (orderErr) throw orderErr;

    const performance = (branches || []).map((branch) => {
      const branchOrders = (orders || []).filter((o) => o.branch_id === branch.id);
      const totalRevenue = branchOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );

      return {
        branchId: branch.id,
        branchName: branch.branch_name || "Unknown Branch",
        city: branch.city || "N/A",
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
const getBranchStockAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        id,
        quantity,
        low_stock_threshold,
        updated_at,
        medicines:medicine_id ( id, name, category ),
        branches:branch_id ( id, branch_name )
      `);

    if (error) throw error;

    const alerts = (data || []).filter(
      (item) => Number(item.quantity) <= Number(item.low_stock_threshold)
    );

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching branch stock alerts:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. GET TODAY'S ORDERS
const getTodaysOrders = async (req, res) => {
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
        branches:branches(branches_id, branch_name ),
        customers:customers(customer_id, full_name, email, phone )
      `)
      .gte("created_at", startOfDay.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: (data || []).length,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching today's orders:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 6. GET PRESCRIPTION LOGS
const getPrescriptionLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescription_reviews")
      .select(`
        id,
        status,
        remarks,
        reviewed_at,
        prescriptions:prescription_id ( id, image_url, customer_id, order_id ),
        pharmacists:pharmacist_id ( id, full_name, email, license_number )
      `)
      .order("reviewed_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching prescription logs:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 7. EXPORT BRANCH PERFORMANCE REPORT
const getExportBranchPerformance = async (req, res) => {
  try {
    const { data: branches, error: branchErr } = await supabase
      .from("branches")
      .select("id, branch_name, address, city, state");

    if (branchErr) throw branchErr;

    const { data: orders, error: orderErr } = await supabase
      .from("orders")
      .select("branch_id, total_amount, status");

    if (orderErr) throw orderErr;

    const report = (branches || []).map((branch) => {
      const branchOrders = (orders || []).filter((o) => o.branch_id === branch.id);
      const totalRevenue = branchOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );
      const completedOrders = branchOrders.filter(
        (o) => o.status === "completed" || o.status === "delivered"
      ).length;
      const cancelledOrders = branchOrders.filter(
        (o) => o.status === "cancelled"
      ).length;

      return {
        branch_id: branch.id,
        branch_name: branch.branch_name || "N/A",
        address: `${branch.address || ""}, ${branch.city || ""}`.trim() || "N/A",
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

// 8. REVIEW MANUAL ORDERS
const getManualOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        users:customer_id ( id, full_name, email, phone ),
        branches:branch_id ( id, branch_name, city ),
        order_items (
          id,
          quantity,
          price,
          medicines:medicine_id ( id, name )
        ),
        prescriptions (
          id,
          image_url,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error("Error fetching manual orders:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9. UNIFIED ORDER STATUS UPDATE
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.order_id || req.body.orderId;
    const status = req.body.status;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "order_id and status are required.",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Order #${orderId} updated to ${status}`,
      data: data?.[0] || data,
    });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 10. TRACK STOCK-RELATED ORDER FAILURES
const getStockRelatedFailures = async (req, res) => {
  try {
    const { data: cancelledOrders, error: orderErr } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        branches:branch_id ( branch_name ),
        order_items (
          medicine_id,
          quantity,
          medicines:medicine_id ( name )
        )
      `)
      .eq("status", "cancelled");

    if (orderErr) throw orderErr;

    const stockFailures = (cancelledOrders || []).map((order) => {
      const branchObj = order.branches;
      const branchName = branchObj?.branch_name || "Unknown";

      return {
        order_id: order.id,
        branch: branchName,
        cancelled_at: order.created_at,
        items: (order.order_items || []).map((item) => {
          const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
          return {
            medicine_name: med?.name || "Unknown Medicine",
            requested_quantity: item.quantity,
          };
        }),
      };
    });

    return res.status(200).json({ success: true, data: stockFailures });
  } catch (err) {
    console.error("Error fetching stock failures:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 11. GET PENDING ORDERS
const getPendingOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        users:customer_id ( id, full_name, email, phone ),
        branches:branch_id ( id, branch_name )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error("Error fetching pending orders:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending orders",
    });
  }
};

// 12. GET ALL PHARMACISTS
const getAllPharmacists = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pharmacists")
      .select(`
        id,
        full_name,
        email,
        phone,
        license_number,
        status,
        created_at,
        branches:branch_id ( id, branch_name )
      `);

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error("Error fetching pharmacists:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// TRACK STOCK-RELATED ORDER FAILURES


// 13. GET ALL DELIVERY PARTNERS
const getAllDeliveryPartners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("delivery_partners")
      .select(`
        id,
        full_name,
        email,
        phone,
        vehicle_type,
        vehicle_number,
        status,
        created_at,
        branches:branch_id ( id, branch_name )
      `);

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error("Error fetching delivery partners:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTopSellingMedicines,
  getLowStockReport,
  getBranchPerformance,
  getBranchStockAlerts,
  getTodaysOrders,
  getPrescriptionLogs,
  getExportBranchPerformance,
  getManualOrders,
  updateOrderStatus,
  getStockRelatedFailures,
  getPendingOrders,
  getAllPharmacists,
  getAllDeliveryPartners,
};