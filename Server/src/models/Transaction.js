// const mongoose = require('mongoose');

// const transactionSchema = new mongoose.Schema({
//   type: { type: String, enum: ['recharge', 'purchase'], required: true },
//   amount: { type: Number, required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   subUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
//   status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
//   cryptomusUuid: { type: String, default: null },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Transaction', transactionSchema);

// models/Transaction.js
// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // 业务信息
    type:   { type: String, enum: ['recharge', 'purchase'], required: true },
    amount: { type: Number, required: true }, // 下单时的 USD 金额

    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },

    // 状态流转
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },

    // 对账与幂等
    orderId:       { type: String, index: true }, // 你传给 Cryptomus 的 order_id
    cryptomusUuid: { type: String, index: true }, // Cryptomus 返回的发票 uuid
    credited:      { type: Boolean, default: false }, // 是否已入账

    // 审计信息（可用于退款/对账）
    rate:           { type: Number, default: 1 }, // 入账时使用的汇率（credits per USD）
    creditedAmount: { type: Number, default: 0 }, // 实际加到用户的 credits
    payerCurrency:  { type: String, default: '' },
    payerAmount:    { type: Number, default: 0 },
    network:        { type: String, default: '' },
    txid:           { type: String, default: '' },

    // 回调追踪
    lastWebhook: { type: Object, default: null },
    events:      [{ type: Object }],
  },
  { timestamps: true }
);

// 常用查询加速
transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
