const DonorCommitment = require('../models/DonorCommitment');
const BloodRequest = require('../models/BloodRequest');
const SOSAlert = require('../models/SOSAlert');

// Get commitments for hospital or donor
const getCommitments = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'hospital') {
      query.hospital = req.user._id;
    } else if (req.user.role === 'donor') {
      query.donor = req.user._id;
    } else {
      return res.status(403).json({ message: 'Only donors and hospitals can view donor tracking.' });
    }
    const commitments = await DonorCommitment.find(query)
      .populate('donor', 'name email phone city bloodGroup')
      .sort({ createdAt: -1 });
    res.json(commitments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Donor commits to help with actual logged-in user details
const createCommitment = async (req, res) => {
  try {
    const { requestId, sosId } = req.body;

    // Ensure logged-in user is a donor
    if (!req.user || req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only registered donors can commit to help.' });
    }

    let details;
    if (requestId) {
      const request = await BloodRequest.findOne({ _id: requestId, status: 'Pending' });
      if (!request) return res.status(404).json({ message: 'This blood request is no longer active.' });
      details = {
        hospital: request.user,
        hospitalName: request.hospitalName,
        bloodGroup: request.bloodGroup,
        referenceType: 'General',
        referenceId: request._id,
        referenceLabel: request.patientName,
      };
    } else if (sosId) {
      const alert = await SOSAlert.findOne({ _id: sosId, status: 'Active' });
      if (!alert) return res.status(404).json({ message: 'This emergency alert is no longer active.' });
      if (alert.bloodGroup !== req.user.bloodGroup) {
        return res.status(403).json({ message: `This SOS is for ${alert.bloodGroup} donors. Your registered group is ${req.user.bloodGroup || 'not set'}.` });
      }
      details = {
        hospital: alert.hospital,
        hospitalName: alert.hospitalName,
        bloodGroup: alert.bloodGroup,
        referenceType: 'SOS',
        referenceId: alert._id,
        referenceLabel: alert.message,
      };
    } else {
      return res.status(400).json({ message: 'Choose an active blood request or SOS alert to respond to.' });
    }

    const alreadyResponded = await DonorCommitment.findOne({
      donor: req.user._id,
      referenceType: details.referenceType,
      referenceId: details.referenceId,
    });
    if (alreadyResponded) {
      return res.status(409).json({ message: 'You have already responded to this request.' });
    }

    const commitment = await DonorCommitment.create({
      donor: req.user._id,
      donorName: req.user.name,
      donorPhone: req.user.phone || 'N/A',
      bloodGroup: details.bloodGroup || req.user.bloodGroup || 'A+',
      ...details,
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

    const donorOwnsCommitment = req.user.role === 'donor' && commitment.donor.toString() === req.user._id.toString();
    const hospitalOwnsCommitment = req.user.role === 'hospital' && commitment.hospital.toString() === req.user._id.toString();
    const donorStatuses = ['On the Way', 'Cancelled'];
    const hospitalStatuses = ['Donated', 'Cancelled'];
    const allowedStatuses = donorOwnsCommitment ? donorStatuses : hospitalOwnsCommitment ? hospitalStatuses : [];
    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({ message: 'You are not allowed to make this commitment status change.' });
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
