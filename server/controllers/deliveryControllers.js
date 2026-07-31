const supabase = require("../config/supabase");



exports.getDeliveries = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .order("assigned_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      deliveries: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("deliveries")
      .select(
        `
        *,
        orders(*),
        delivery_partners(
          id,
          full_name,
          phone,
          vehicle_type,
          vehicle_number
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found.",
      });
    }

    return res.status(200).json({
      success: true,
      delivery: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



exports.assignDelivery = async (req, res) => {
  try {
    const { order_id, delivery_partner_id, notes } = req.body;

    // Validate required fields
    if (!order_id || !delivery_partner_id) {
      return res.status(400).json({
        success: false,
        error: "order_id and delivery_partner_id are required.",
      });
    }

    const { data, error } = await supabase
      .from("deliveries")
      .insert([
        {
          order_id,
          delivery_partner_id,
          status: "ASSIGNED",
          assigned_at: new Date().toISOString(),
          notes: notes || null,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Delivery assigned successfully.",
      delivery: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


exports.pickupOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Update the delivery record
    const { data, error } = await supabase
      .from("deliveries")
      .update({
        status: "PICKED_UP",
        picked_up_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found.",
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .update({
        status: "PACKED",
      })
      .eq("id", data[0].order_id)
      .select();

    console.log("Order Update Data:", orderData);
    console.log("Order Update Error:", orderError);

    return res.status(200).json({
      success: true,
      message: "Order picked up successfully.",
      delivery: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



exports.startDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    // Update the delivery
    const { data, error } = await supabase
      .from("deliveries")
      .update({
        status: "OUT_FOR_DELIVERY",
        out_for_delivery_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found.",
      });
    }

    // Update the corresponding order
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: "OUT_FOR_DELIVERY",
      })
      .eq("id", data[0].order_id);

    if (orderError) {
      return res.status(400).json({
        success: false,
        error: orderError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order is now out for delivery.",
      delivery: data[0],
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};




exports.completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    // Update delivery status
    const { data, error } = await supabase
      .from("deliveries")
      .update({
        status: "DELIVERED",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found.",
      });
    }

    // Update the corresponding order
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: "DELIVERED",
      })
      .eq("id", data[0].order_id);

    if (orderError) {
      return res.status(400).json({
        success: false,
        error: orderError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully.",
      delivery: data[0],
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getDeliveryDashboard = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        orders (
          id,
          status,
          total_amount,
          customer_id,
          created_at
        )
      `)
      .eq("delivery_partner_id", partnerId)
      .order("assigned_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const assignedOrders = data.filter(item =>
      ["ASSIGNED", "PICKED_UP"].includes(item.status)
    );

    const currentDeliveries = data.filter(
      item => item.status === "OUT_FOR_DELIVERY"
    );

    const completedDeliveries = data.filter(
      item => item.status === "DELIVERED"
    );

    return res.status(200).json({
      success: true,

      statistics: {
        totalAssigned: assignedOrders.length,
        totalCurrent: currentDeliveries.length,
        totalCompleted: completedDeliveries.length,
      },

      assignedOrders,

      currentDeliveries,

      completedDeliveries,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};