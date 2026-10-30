const SOSAlert = require('../models/SOSAlert');

// Get all SOS alerts
const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({}).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create SOS broadcast (Hospital only)
const createSOSAlert = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Only hospital accounts can broadcast an emergency SOS.' });
    }
    const { bloodGroup, unitsNeeded, city, contactPhone, message, hospitalName } = req.body;

    if (!bloodGroup || !unitsNeeded || !city || !contactPhone || !message) {
      return res.status(400).json({ message: 'Please fill all fields for emergency broadcast' });
    }

    const alert = await SOSAlert.create({
      hospital: req.user._id,
      hospitalName: hospitalName || req.user.name,
      bloodGroup,
      unitsNeeded,
      city,
      contactPhone,
      message,
      status: 'Active'
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('SOS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Resolve SOS alert (Owner only)
const resolveSOSAlert = async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    if (alert.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this alert' });
    }

    alert.status = 'Resolved';
    await alert.save();
    res.json({ message: 'SOS alert marked as resolved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSOSAlerts,
  createSOSAlert,
  resolveSOSAlert
};
