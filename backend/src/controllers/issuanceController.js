const PatientIssuance = require('../models/PatientIssuance');

// Get all issuance logs for logged-in hospital
const getIssuanceLogs = async (req, res) => {
  try {
    const logs = await PatientIssuance.find({ hospital: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log a new patient issuance
const createIssuanceLog = async (req, res) => {
  try {
    const { patientName, patientAge, gender, bloodGroup, unitsIssued, doctorName, reason } = req.body;

    if (!patientName || !patientAge || !gender || !bloodGroup || !unitsIssued || !doctorName || !reason) {
      return res.status(400).json({ message: 'Please complete all required fields for issuance log' });
    }

    const log = await PatientIssuance.create({
      hospital: req.user._id,
      hospitalName: req.user.name,
      patientName,
      patientAge,
      gender,
      bloodGroup,
      unitsIssued,
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