const mongoose = require('mongoose');

const donorCommitmentSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  donorPhone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  referenceLabel: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Accepted', 'On the Way', 'Donated', 'Cancelled'], 
    default: 'Accepted' 
  },
  referenceType: { type: String, enum: ['SOS', 'Camp', 'General'], default: 'SOS' }
}, { timestamps: true });

const DonorCommitment = mongoose.model('DonorCommitment', donorCommitmentSchema);
module.exports = DonorCommitment;
