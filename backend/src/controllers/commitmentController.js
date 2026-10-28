const DonorCommitment = require('../models/DonorCommitment');

// Get commitments for hospital or donor
const getCommitments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'hospital') {
      query.hospital = req.user._id;
    } else if (req.user.role === 'donor') {
      query.donor = req.user._id;
    }
    const commitments = await DonorCommitment.find(query).sort({ createdAt: -1 });
    res.json(commitments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Donor commits to help with actual logged-in user details
const createCommitment = async (req, res) => {
  try {
    const { hospitalId, hospitalName, bloodGroup, referenceType } = req.body;

    // Ensure logged-in user is a donor
    if (!req.user || req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only registered donors can commit to help.' });
    }

    const commitment = await DonorCommitment.create({
      donor: req.user._id,
      donorName: req.user.name,         // Logs the exact name of currently logged-in donor
      donorPhone: req.user.phone || 'N/A', // Logs the exact phone number
      bloodGroup: bloodGroup || req.user.bloodGroup || 'A+',
      hospital: hospitalId,
      hospitalName,
      referenceType: referenceType || 'SOS'
    });

    res.status(201).json(commitment);
  } catch (error) {
    console.error('COMMITMENT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update status
const updateCommitmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const commitment = await DonorCommitment.findById(req.params.id);

    if (!commitment) {
      return res.status(404).json({ message: 'Commitment record not found' });
    }

    commitment.status = status;
    await commitment.save();
    res.json(commitment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommitments,
  createCommitment,
  updateCommitmentStatus
};