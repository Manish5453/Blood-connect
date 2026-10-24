const BloodRequest = require('../models/BloodRequest');

// Create Emergency Blood Request
const createBloodRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsNeeded, hospitalName, city, contactPhone, urgencyLevel } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user session missing' });
    }

    if (!patientName || !bloodGroup || !hospitalName || !city || !contactPhone) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const bloodRequest = await BloodRequest.create({
      user: req.user._id, // <--- Yahan 'requester' ki jagah 'user' hona chahiye
      patientName,
      bloodGroup,
      unitsNeeded: unitsNeeded || 1,
      hospitalName,
      city,
      contactPhone,
      urgencyLevel: urgencyLevel || 'Critical',
    });

    res.status(201).json(bloodRequest);
  } catch (error) {
    console.error('CREATE REQUEST ERROR:', error);
    res.status(500).json({ message: error.message || 'Server error while creating request' });
  }
};

// Get all active blood requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'Pending' })
      .populate('user', 'name phone') // <--- Yahan bhi 'requester' ki jagah 'user'
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('GET REQUESTS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBloodRequest,
  getAllRequests,
};