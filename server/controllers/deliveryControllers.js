const supabase = require("../config/supabase");

// exports.getDeliveries = async (req, res) => {
//   const { data, error } = await supabase

//     .from("delivery_assignments")

//     .select("*");

//   if (error) {
//     return res.status(400).json(error);
//   }

//   res.json(data);
// };

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

// exports.getDeliveryById = async (req, res) => {
//   const { id } = req.params;

//   const { data, error } = await supabase

//     .from("delivery_assignments")

//     .select("*")

//     .eq("id", id)

//     .single();

//   if (error) {
//     return res.status(404).json(error);
//   }

//   res.json(data);
// };

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

// exports.assignDelivery = async (req, res) => {
//   const {
//     order_id,

//     delivery_partner_id,
//   } = req.body;

//   const { data, error } = await supabase

//     .from("delivery_assignments")

//     .insert({
//       order_id,

//       delivery_partner_id,

//       status: "ASSIGNED",
//     })

//     .select();

//   if (error) {
//     return res.status(400).json(error);
//   }

//   res.status(201).json(data);
// };

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

// exports.pickupOrder = async (req, res) => {
//   const { id } = req.params;

//   await supabase

//     .from("delivery_assignments")

//     .update({
//       status: "PICKED_UP",
//     })

//     .eq("id", id);

//   res.json({
//     message: "Order Picked Up",
//   });
// };

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

// exports.startDelivery = async (req, res) => {
//   const { id } = req.params;

//   await supabase

//     .from("delivery_assignments")

//     .update({
//       status: "OUT_FOR_DELIVERY",
//     })

//     .eq("id", id);

//   res.json({
//     message: "Out For Delivery",
//   });
// };

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


// exports.completeDelivery = async (req, res) => {
//   const { id } = req.params;

//   // Update delivery status
//   await supabase

//     .from("delivery_assignments")

//     .update({
//       status: "DELIVERED",
//     })

//     .eq("id", id);

//   // Get order id
//   const { data } = await supabase

//     .from("delivery_assignments")

//     .select("order_id")

//     .eq("id", id)

//     .single();

//   // Update order status
//   await supabase

//     .from("orders")

//     .update({
//       status: "DELIVERED",
//     })

//     .eq("id", data.order_id);

//   res.json({
//     success: true,

//     message: "Order Delivered",
//   });
// };

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