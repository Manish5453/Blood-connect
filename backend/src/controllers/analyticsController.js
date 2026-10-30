const Inventory = require('../models/Inventory');
const PatientIssuance = require('../models/PatientIssuance');
const SOSAlert = require('../models/SOSAlert');

const getDashboardAnalytics = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Sign in to view analytics.' });
    }

    // Hospitals see their own operational data. Other signed-in accounts get
    // network-wide totals only; no patient or donor details are exposed here.
    const isHospital = req.user.role === 'hospital';
    const inventoryFilter = isHospital ? { hospital: req.user._id } : {};
    const issuanceFilter = isHospital ? { hospital: req.user._id } : {};
    const sosFilter = { status: 'Active', ...(isHospital ? { hospital: req.user._id } : {}) };

    const [inventory, issuances, activeSos] = await Promise.all([
      Inventory.find(inventoryFilter),
      PatientIssuance.find(issuanceFilter),
      SOSAlert.find(sosFilter),
    ]);

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
      scope: isHospital ? 'hospital' : 'network',
      stockByGroup,
      shortageGroups
    });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: error.message || 'Internal server error while fetching analytics' });
  }
};

module.exports = { getDashboardAnalytics };
