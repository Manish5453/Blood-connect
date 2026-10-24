const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  title: { type: String, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  contactPhone: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const Camp = mongoose.model('Camp', campSchema);
module.exports = Camp;