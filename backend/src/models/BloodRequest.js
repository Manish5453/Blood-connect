const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  hospitalName: { type: String, required: true },
  city: { type: String, required: true },
  contactPhone: { type: String, required: true },
  urgencyLevel: { 
    type: String, 
    enum: ['Critical', 'Urgent', 'Moderate'], 
    default: 'Critical' 
  },
  status: { type: String, enum: ['Pending', 'Fulfilled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);