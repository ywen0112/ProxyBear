const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type:   { type: String, enum: ['recharge', 'purchase'], required: true },
    amount: { type: Number, required: true }, 
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    status:   { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    credited: { type: Boolean, default: false }, 
    orderId:       { type: String, index: true }, 
    cryptomusUuid: { type: String, index: true }, 
    rate:           { type: Number, default: 1 }, 
    creditedAmount: { type: Number, default: 0 }, 
    payerCurrency:  { type: String, default: '' },
    payerAmount:    { type: Number, default: 0 },
    network:        { type: String, default: '' },
    txid:           { type: String, default: '' },
    lastWebhook: { type: Object, default: null },
    events:      [{ type: Object }],
    paymentUrl: { type: String, default: '' }, 
    expiresAt:  { type: Date },               
    expired:    { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, status: 1, expiresAt: 1 }); 

module.exports = mongoose.model('Transaction', transactionSchema);
