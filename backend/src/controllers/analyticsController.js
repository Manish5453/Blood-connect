const Inventory = require('../models/Inventory');
const PatientIssuance = require('../models/PatientIssuance');
const SOSAlert = require('../models/SOSAlert');

const getDashboardAnalytics = async (req, res) => {
  try {
    // Ensure user is authorized and is a hospital
    if (!req.user || req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const hospitalId = req.user._id;

    // Fetch data belonging ONLY to the logged-in hospital
    const inventory = await Inventory.find({ hospital: hospitalId }) || [];
    const issuances = await PatientIssuance.find({ hospital: hospitalId }) || [];
    const activeSos = await SOSAlert.find({ hospital: hospitalId, status: 'Active' }) || [];

    // Stock per blood group mapping
    const stockByGroup = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };

    let totalUnitsInStock = 0;
    inventory.forEach(item => {
      if (item && item.bloodGroup && stockByGroup[item.bloodGroup] !== undefined) {
        stockByGroup[item.bloodGroup] += Number(item.units) || 0;
        totalUnitsInStock += Number(item.units) || 0;
      }
    });

    // Calculate critical shortages (Threshold < 5 units)
    const shortageGroups = Object.keys(stockByGroup).filter(
      group => stockByGroup[group] < 5
    );

    let totalUnitsIssued = 0;
    issuances.forEach(item => {
      if (item && item.unitsIssued) {
        totalUnitsIssued += Number(item.unitsIssued) || 0;
      }
    });

    res.status(200).json({
      totalUnitsInStock,
      totalUnitsIssued,
      activeSosCount: activeSos.length,
      stockByGroup,
      shortageGroups
    });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: error.message || 'Internal server error while fetching analytics' });
  }
};

module.exports = { getDashboardAnalytics };