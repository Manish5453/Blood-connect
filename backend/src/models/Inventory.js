const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalName: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  units: { type: Number, required: true, min: 0 },
  city: { type: String, required: true },
  contactPhone: { type: String, required: true },
  batchNumber: { type: String, default: 'BATCH-001' }, // Naya field
  expiryDate: { type: Date, required: true }          // Naya field
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;