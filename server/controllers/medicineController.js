const medicineModel = require('../models/medicineModel');

/**
 * GET /api/medicines — Search/list medicines.
 */
const getAllMedicines = async (req, res, next) => {
  try {
    const { search, category, is_active, branch_id, available_only, sort_by, page, limit } = req.query;

    const { data: medicines, error, count } = await medicineModel.getAll({
      search,
      category,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    let resultData = medicines || [];

    if (branch_id && resultData.length > 0) {
      const supabase = require('../config/supabase');
      const medicineIds = resultData.map(m => m.id);
      const { data: invData } = await supabase
        .from('branch_inventory')
        .select('*')
        .eq('branch_id', branch_id)
        .in('medicine_id', medicineIds);

      const invMap = {};
      if (invData) {
        invData.forEach(item => {
          invMap[item.medicine_id] = item;
        });
      }

      resultData = resultData
        .map(m => {
          const inv = invMap[m.id];
          const stockQty = inv ? inv.quantity : 0;
          return {
            ...m,
            branch_stock: stockQty,
            in_stock: stockQty > 0,
            low_stock: inv ? (stockQty <= inv.low_stock_threshold && stockQty > 0) : false,
            has_inventory_record: !!inv,
          };
        })
        .filter(m => m.has_inventory_record);

      if (available_only === 'true') {
        resultData = resultData.filter(m => m.in_stock);
      }

      if (sort_by === 'availability') {
        resultData.sort((a, b) => (b.in_stock ? 1 : 0) - (a.in_stock ? 1 : 0));
      }
    }

    res.json({ success: true, data: resultData, total: available_only === 'true' ? resultData.length : count });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/medicines/:id — Get a single medicine with branch inventory details.
 */
const getMedicineById = async (req, res, next) => {
  try {
    const { data: medicine, error } = await medicineModel.getById(req.params.id);
    if (error || !medicine) return res.status(404).json({ success: false, message: 'Medicine not found.' });

    const supabase = require('../config/supabase');
    const { branch_id } = req.query;

    // Fetch stock across all branches for this medicine
    const { data: branchInv } = await supabase
      .from('branch_inventory')
      .select('*, branch:branches(id, name, city, address, is_active)')
      .eq('medicine_id', req.params.id);

    let currentBranchStock = null;
    if (branch_id && branchInv) {
      const match = branchInv.find(b => b.branch_id === branch_id);
      if (match) {
        currentBranchStock = {
          quantity: match.quantity,
          in_stock: match.quantity > 0,
          low_stock: match.quantity <= match.low_stock_threshold && match.quantity > 0,
        };
      } else {
        currentBranchStock = { quantity: 0, in_stock: false, low_stock: false };
      }
    }

    res.json({
      success: true,
      data: {
        ...medicine,
        branch_stock: currentBranchStock,
        all_branch_inventory: branchInv || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/medicines — Create a medicine (admin).
 */
const createMedicine = async (req, res, next) => {
  try {
    const {
      name, generic_name, manufacturer, category,
      requires_prescription, unit, pack_size, mrp,
      description, image_url,
    } = req.body;

    if (!name || mrp === undefined) {
      return res.status(400).json({ success: false, message: 'name and mrp are required.' });
    }

    const { data, error } = await medicineModel.create({
      name, generic_name, manufacturer, category,
      requires_prescription: requires_prescription || false,
      unit: unit || 'unit', pack_size, mrp,
      description, image_url,
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/medicines/:id — Update a medicine (admin).
 */
const updateMedicine = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'generic_name', 'manufacturer', 'category',
      'requires_prescription', 'unit', 'pack_size', 'mrp',
      'description', 'image_url', 'is_active',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    const { data, error } = await medicineModel.update(req.params.id, updates);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/medicines/:id/deactivate — Deactivate a medicine (admin).
 */
const deactivateMedicine = async (req, res, next) => {
  try {
    const { data, error } = await medicineModel.deactivate(req.params.id);
    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMedicines, getMedicineById, createMedicine, updateMedicine, deactivateMedicine };
