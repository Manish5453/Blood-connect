const mongoose = require('mongoose');

const patientIssuanceSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  unitsIssued: { type: Number, required: true, min: 1 },
  doctorName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  reason: { type: String, required: true }
}, { timestamps: true });

const PatientIssuance = mongoose.model('PatientIssuance', patientIssuanceSchema);
module.exports = PatientIssuance;