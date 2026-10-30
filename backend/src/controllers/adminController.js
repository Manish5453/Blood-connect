const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Inventory = require('../models/Inventory');
const Camp = require('../models/Camp');
const SOSAlert = require('../models/SOSAlert');
const DonorCommitment = require('../models/DonorCommitment');
const PatientIssuance = require('../models/PatientIssuance');

const models = {
  users: User,
  inventory: Inventory,
  requests: BloodRequest,
  camps: Camp,
  sos: SOSAlert,
  commitments: DonorCommitment,
  issuances: PatientIssuance,
};

const editableFields = {
  users: ['name', 'email', 'phone', 'city', 'bloodGroup', 'role'],
  inventory: ['units', 'bloodGroup', 'hospitalName', 'city', 'contactPhone', 'batchNumber', 'expiryDate'],
  requests: ['status', 'urgencyLevel'],
  camps: ['title', 'venue', 'city', 'date', 'startTime', 'endTime', 'contactPhone', 'description'],
  sos: ['status'],
  commitments: ['status'],
};

const digest = (value) => crypto.createHash('sha256').update(String(value)).digest();
const matchesSecret = (provided, expected) => crypto.timingSafeEqual(digest(provided), digest(expected));

const adminLogin = (req, res) => {
  const { username, password } = req.body || {};
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword || !process.env.JWT_SECRET) {
    return res.status(503).json({ message: 'Admin login is not configured on the server' });
  }

  const validUsername = matchesSecret(username || '', expectedUsername);
  const validPassword = matchesSecret(password || '', expectedPassword);
  if (!validUsername || !validPassword) {
    return res.status(401).json({ message: 'Invalid admin username or password' });
  }

  const token = jwt.sign(
    { role: 'admin', username: expectedUsername },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  return res.json({ username: expectedUsername, role: 'admin', token });
};

const getDashboard = async (req, res) => {
  try {
    const [users, inventory, requests, camps, sos, commitments, issuances] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }).limit(200).lean(),
      Inventory.find({}).sort({ createdAt: -1 }).limit(200).lean(),
      BloodRequest.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(200).lean(),
      Camp.find({}).sort({ date: 1 }).limit(200).lean(),
      SOSAlert.find({}).sort({ createdAt: -1 }).limit(200).lean(),
      DonorCommitment.find({}).sort({ createdAt: -1 }).limit(200).lean(),
      PatientIssuance.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    ]);
    const [userCount, hospitalCount, stockUnits, pendingRequests, activeAlerts, campCount, commitmentCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'hospital' }),
      Inventory.aggregate([{ $group: { _id: null, units: { $sum: '$units' } } }]),
      BloodRequest.countDocuments({ status: 'Pending' }),
      SOSAlert.countDocuments({ status: 'Active' }),
      Camp.countDocuments(),
      DonorCommitment.countDocuments(),
    ]);

    return res.json({
      metrics: {
        users: userCount,
        hospitals: hospitalCount,
        stockUnits: stockUnits[0]?.units || 0,
        pendingRequests,
        activeAlerts,
        camps: campCount,
        commitments: commitmentCount,
      },
      records: { users, inventory, requests, camps, sos, commitments, issuances },
    });
  } catch (error) {
    console.error('ADMIN DASHBOARD ERROR:', error.message);
    return res.status(500).json({ message: 'Unable to load admin dashboard data' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = models[collection];
    const allowed = editableFields[collection];
    if (!Model || !allowed) return res.status(404).json({ message: 'This record type cannot be edited' });

    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key))
    );
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No editable fields provided' });
    if (collection === 'users' && updates.role === 'admin') {
      return res.status(400).json({ message: 'Admin role is reserved for environment-backed admin access' });
    }

    const record = await Model.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      ...(collection === 'users' ? { select: '-password' } : {}),
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    return res.json(record);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to update record' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { collection, id } = req.params;
    if (!['users', 'inventory', 'camps'].includes(collection)) {
      return res.status(400).json({ message: 'This record type cannot be deleted' });
    }
    const record = await models[collection].findByIdAndDelete(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    return res.json({ message: 'Record deleted' });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to delete record' });
  }
};

module.exports = { adminLogin, getDashboard, updateRecord, deleteRecord };
