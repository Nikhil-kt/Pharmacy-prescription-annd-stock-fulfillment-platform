const supabase = require("../config/supabase");

// Helper to fetch from a specific table
async function fetchTableData(tableName) {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error.message);
    return [];
  }
  return data || [];
}

exports.getAllMedicines = async (req, res) => {
  try {
    // Fetch from both tables to ensure we get ALL medicines
    const medicinesData = await fetchTableData("medicines");
    const medicines1Data = await fetchTableData("medicines1");

    // Combine them, handling different column names (name vs medicine_name)
    const combined = [
      ...medicinesData.map(m => ({
        ...m,
        name: m.name || m.medicine_name,
        medicine_name: m.medicine_name || m.name
      })),
      ...medicines1Data.map(m => ({
        ...m,
        name: m.name || m.medicine_name,
        medicine_name: m.medicine_name || m.name
      }))
    ];

    // Sort by name
    combined.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return res.status(200).json({
      success: true,
      totalMedicines: combined.length,
      medicines: combined,
    });
  } catch (err) {
    console.error("getAllMedicines error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const tableName = await getMedicinesTable();

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: "Medicine not found." });
    }

    return res.status(200).json({ success: true, medicine: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const { name, medicine_name, manufacturer, category, description, price, prescription_required } = req.body;
    const medName = name || medicine_name;

    if (!medName || price == null) {
      return res.status(400).json({ success: false, error: "Name and price are required." });
    }

    const tableName = await getMedicinesTable();

    const payload = tableName === "medicines1" 
      ? { medicine_name: medName, manufacturer, category, description, price, prescription_required: !!prescription_required }
      : { name: medName, manufacturer, category, description, price, prescription_required: !!prescription_required };

    const { data, error } = await supabase
      .from(tableName)
      .insert([payload])
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully.",
      medicine: data[0],
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const tableName = await getMedicinesTable();

    const { error } = await supabase.from(tableName).delete().eq("id", id);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, message: "Medicine deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};