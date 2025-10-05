const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['recharge', 'purchase'], required: true },
  amount: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  cryptomusUuid: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);