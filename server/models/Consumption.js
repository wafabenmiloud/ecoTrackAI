const mongoose = require('mongoose');

const ConsumptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, required: true },
  value: { type: Number, required: true },
  unit: { type: String, default: 'kWh' },
  source: { type: String, enum: ['manual', 'csv', 'api'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Consumption', ConsumptionSchema);
