const mongoose = require('mongoose');

const ResellPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    option: { type: String, enum: ['residential', 'mobile', 'ipv6', 'isp'] },
    planId: { type: String, required: true, unique: true, index: true },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResellPlan', ResellPlanSchema);
