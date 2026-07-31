const supabase = require("../config/supabase");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      customers,
      pharmacists,
      deliveryPartners,
      prescriptions,
      orders,
      deliveries,
      branches,
    ] = await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),

      supabase.from("pharmacists").select("*", { count: "exact", head: true }),

      supabase
        .from("delivery_partners")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING"),

      supabase.from("orders").select("*", { count: "exact", head: true }),

      supabase.from("deliveries").select("*", { count: "exact", head: true }),

      supabase.from("branches").select("*", { count: "exact", head: true }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers: customers.count,
        totalPharmacists: pharmacists.count,
        totalDeliveryPartners: deliveryPartners.count,
        pendingPrescriptions: prescriptions.count,
        totalOrders: orders.count,
        totalDeliveries: deliveries.count,
        totalBranches: branches.count,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getAllPharmacists = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pharmacists")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        license_number,
        status,
        created_at,
        branches (
          id,
          branch_name,
          address
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      total: data.length,
      pharmacists: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getPharmacistById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch pharmacist details along with branch information
    const { data: pharmacist, error } = await supabase
      .from("pharmacists")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        license_number,
        status,
        created_at,
        branches (
          id,
          branch_name,
          address
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: "Pharmacist not found.",
      });
    }

    // Count total reviewed prescriptions
    const { count: totalReviewed } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("reviewed_by", id);

    // Count approved prescriptions
    const { count: approvedCount } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("reviewed_by", id)
      .eq("status", "APPROVED");

    // Count rejected prescriptions
    const { count: rejectedCount } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("reviewed_by", id)
      .eq("status", "REJECTED");

    return res.status(200).json({
      success: true,
      pharmacist,
      statistics: {
        totalReviewed,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getAllDeliveryPartners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("delivery_partners")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        vehicle_number,
        status,
        created_at
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      total: data.length,
      deliveryPartners: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getDeliveryPartnerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get delivery partner details
    const { data: partner, error } = await supabase
      .from("delivery_partners")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        vehicle_number,
        status,
        created_at
      `,
      )
      .eq("id", id)
      .single();

    if (error || !partner) {
      return res.status(404).json({
        success: false,
        error: "Delivery partner not found.",
      });
    }

    // Get all deliveries assigned to this partner
    const { data: deliveries, error: deliveryError } = await supabase
      .from("deliveries")
      .select(
        `
        id,
        order_id,
        status,
        assigned_at,
        picked_up_at,
        out_for_delivery_at,
        delivered_at,
        notes
      `,
      )
      .eq("delivery_partner_id", id)
      .order("assigned_at", { ascending: false });

    if (deliveryError) {
      return res.status(400).json({
        success: false,
        error: deliveryError.message,
      });
    }

    // Statistics
    const totalAssigned = deliveries.length;

    const completed = deliveries.filter((d) => d.status === "DELIVERED").length;

    const outForDelivery = deliveries.filter(
      (d) => d.status === "OUT_FOR_DELIVERY",
    ).length;

    const pickedUp = deliveries.filter((d) => d.status === "PICKED_UP").length;

    return res.status(200).json({
      success: true,

      deliveryPartner: partner,

      statistics: {
        totalAssigned,
        pickedUp,
        outForDelivery,
        completed,
      },

      deliveries,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getAllPrescriptions = async (req, res) => {
  try {
    // Get all prescriptions with customer and pharmacist details
    const { data: prescriptions, error } = await supabase
      .from("prescriptionss")
      .select(
        `
        id,
        image_url,
        status,
        remarks,
        reviewed_at,
        uploaded_at,

        customers (
          id,
          full_name,
          email,
          phone
        ),

        pharmacists:reviewed_by (
          id,
          full_name,
          email
        )
      `,
      )
      .order("uploaded_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Dashboard Statistics
    const totalPrescriptions = prescriptions.length;

    const pending = prescriptions.filter((p) => p.status === "PENDING").length;

    const approved = prescriptions.filter(
      (p) => p.status === "APPROVED",
    ).length;

    const rejected = prescriptions.filter(
      (p) => p.status === "REJECTED",
    ).length;

    return res.status(200).json({
      success: true,

      statistics: {
        totalPrescriptions,
        pending,
        approved,
        rejected,
      },

      prescriptions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getPendingPrescriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptionss")
      .select(
        `
        id,
        image_url,
        status,
        uploaded_at,

        customers (
          id,
          full_name,
          email,
          phone
        )
      `,
      )
      .eq("status", "PENDING")
      .order("uploaded_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      totalPending: data.length,
      prescriptions: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getInventoryOverview = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        id,
        quantity,
        expiry_date,
        manufacturing_date,
        last_updated,

        medicines1 (
          id,
          medicine_name,
          manufacturer,
          category,
          price,
          prescription_required
        ),

        branches (
          id,
          branch_name,
          address
        )
      `,
      )
      .order("last_updated", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const totalMedicines = data.length;

    const lowStock = data.filter((item) => item.quantity < 10).length;

    const outOfStock = data.filter((item) => item.quantity === 0).length;

    return res.status(200).json({
      success: true,

      statistics: {
        totalInventoryItems: totalMedicines,
        lowStock,
        outOfStock,
      },

      inventory: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};

exports.getBranchOverview = async (req, res) => {
  try {
    // 1. Get all branches
    const { data: branches, error } = await supabase
      .from("branches")
      .select("*")
      .order("branch_name");

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const overview = [];

    for (const branch of branches) {
      // Pharmacists
      const { data: pharmacists } = await supabase
        .from("pharmacists")
        .select("id, full_name, email, phone")
        .eq("branch_id", branch.id);

      // Delivery Partners
      const { data: deliveryPartners } = await supabase
        .from("delivery_partners")
        .select("id, full_name, phone, status")
        .eq("branch_id", branch.id);

      // Inventory
      const { data: inventory } = await supabase
        .from("inventory")
        .select(
          `
          id,
          quantity,
          expiry_date,
          medicines1(
            medicine_name,
            manufacturer
          )
        `,
        )
        .eq("branch_id", branch.id);

      // Statistics
      const totalMedicines = inventory.length;

      const totalStock = inventory.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const lowStock = inventory.filter((item) => item.quantity < 10).length;

      const outOfStock = inventory.filter((item) => item.quantity === 0).length;

      overview.push({
        branch,

        totalPharmacists: pharmacists.length,

        pharmacists,

        totalDeliveryPartners: deliveryPartners.length,

        deliveryPartners,

        inventoryStatistics: {
          totalMedicines,

          totalStock,

          lowStock,

          outOfStock,
        },

        inventory,
      });
    }

    return res.status(200).json({
      success: true,

      totalBranches: overview.length,

      branches: overview,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const {
      medicine_name,
      manufacturer,
      category,
      description,
      price,
      prescription_required,
    } = req.body;

    if (!medicine_name || !manufacturer || !category || price == null) {
      return res.status(400).json({
        success: false,
        error: "Required fields are missing.",
      });
    }

    // Check duplicate medicine
    const { data: existingMedicine } = await supabase
      .from("medicines1")
      .select("id")
      .eq("medicine_name", medicine_name)
      .maybeSingle();

    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine already exists.",
      });
    }

    const { data, error } = await supabase
      .from("medicines1")
      .insert({
        medicine_name,
        manufacturer,
        category,
        description,
        price,
        prescription_required,
      })
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully.",
      medicine: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("medicines1")
      .select("*")
      .order("medicine_name");

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,

      totalMedicines: data.length,

      medicines: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if medicine exists in inventory
    const { data: inventory } = await supabase
      .from("inventory")
      .select("id")
      .eq("medicine_id", id);

    if (inventory && inventory.length > 0) {
      return res.status(400).json({
        success: false,

        message: "Cannot delete medicine because it exists in inventory.",
      });
    }

    const { error } = await supabase.from("medicines1").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        success: false,

        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,

      message: "Medicine deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,

      error: err.message,
    });
  }
};
