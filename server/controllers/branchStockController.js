const branchStockModel = require("../models/branchStockModel");

exports.getAllStock = async (req, res) => {
  try {
    const { data, error } = await branchStockModel.getAllStock();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getBranchStock = async (req, res) => {
  try {
    const { branchId } = req.params;

    const { data, error } = await branchStockModel.getBranchStock(branchId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const { branchId } = req.params;

    const { data, error } = await branchStockModel.getLowStock(branchId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { branchId, medicineId } = req.params;
    const { quantity } = req.body;

    const { data, error } = await branchStockModel.updateStock(
      branchId,
      medicineId,
      quantity
    );

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};