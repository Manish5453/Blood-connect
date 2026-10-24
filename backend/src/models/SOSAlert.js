const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  unitsNeeded: { type: Number, required: true, min: 1 },
  city: { type: String, required: true },
  contactPhone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' }
}, { timestamps: true });

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);
module.exports = SOSAlert;