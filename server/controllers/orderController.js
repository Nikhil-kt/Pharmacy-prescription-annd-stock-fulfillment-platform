const orderModel = require("../models/orderModel");

exports.placeOrder = async (req, res) => {

    const { data, error } =
        await orderModel.placeOrder(req.body);

    if (error)
        return res.status(500).json({

            success: false,

            error: error.message

        });

    res.json({

        success: true,

        message: "Order Placed",

        data

    });

};

exports.getOrders = async (req, res) => {

    const { data, error } =
        await orderModel.getOrders();

    if (error)
        return res.status(500).json({

            success: false,

            error: error.message

        });

    res.json({

        success: true,

        data

    });

};

exports.getOrder = async (req, res) => {

    const { data, error } =
        await orderModel.getOrder(req.params.id);

    if (error)
        return res.status(500).json({

            success: false,

            error: error.message

        });

    res.json({

        success: true,

        data

    });

};

exports.updateOrderStatus = async (req, res) => {

    const { status } = req.body;

    const { data, error } =
        await orderModel.updateOrderStatus(
            req.params.id,
            status
        );

    if (error)
        return res.status(500).json({

            success: false,

            error: error.message

        });

    res.json({

        success: true,

        message: "Status Updated",

        data

    });

};

exports.cancelOrder = async (req, res) => {

    const { data, error } =
        await orderModel.cancelOrder(req.params.id);

    if (error)
        return res.status(500).json({

            success: false,

            error: error.message

        });

    res.json({

        success: true,

        message: "Order Cancelled",

        data

    });

};