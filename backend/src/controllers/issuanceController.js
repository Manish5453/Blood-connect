const PatientIssuance = require('../models/PatientIssuance');
const Inventory = require('../models/Inventory');

// Get all issuance logs for logged-in hospital
const getIssuanceLogs = async (req, res) => {
  try {
    const logs = await PatientIssuance.find({ hospital: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log a new patient issuance and automatically deduct from inventory stock
const createIssuanceLog = async (req, res) => {
  try {
    const { patientName, patientAge, gender, bloodGroup, unitsIssued, doctorName, reason } = req.body;

    if (!patientName || !patientAge || !gender || !bloodGroup || !unitsIssued || !doctorName || !reason) {
      return res.status(400).json({ message: 'Please complete all required fields for issuance log' });
    }

    const units = Number(unitsIssued);

    // Check available stock in hospital inventory for this blood group
    const inventoryItems = await Inventory.find({ hospital: req.user._id, bloodGroup });
    let totalStock = inventoryItems.reduce((acc, item) => acc + item.units, 0);

    if (totalStock < units) {
      return res.status(400).json({ 
        message: `Insufficient blood stock for ${bloodGroup}. Available: ${units} units required, but only ${totalStock} units in stock.` 
      });
    }

    // Automatically deduct units from inventory batches (FIFO logic)
    let remainingToDeduct = units;
    for (let item of inventoryItems) {
      if (remainingToDeduct <= 0) break;
      if (item.units >= remainingToDeduct) {
        item.units -= remainingToDeduct;
        remainingToDeduct = 0;
        await item.save();
      } else {
        remainingToDeduct -= item.units;
        item.units = 0;
        await item.save();
      }
    }

    // Clean up empty inventory items if needed (optional)
    await Inventory.deleteMany({ hospital: req.user._id, units: 0 });

    // Create the issuance log record
    const log = await PatientIssuance.create({
      hospital: req.user._id,
      hospitalName: req.user.name,
      patientName,
      patientAge,
      gender,
      bloodGroup,
      unitsIssued: units,
      doctorName,
      reason
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('ISSUANCE LOG ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIssuanceLogs,
  createIssuanceLog
};