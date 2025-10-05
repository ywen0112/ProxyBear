const { createInvoice } = require('../config/cryptomus');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const rechargeCredit = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;
  try {
    const orderId = `recharge_${userId}_${Date.now()}`;
    const invoice = await createInvoice(amount, orderId);
    const transaction = await Transaction.create({
      type: 'recharge',
      amount,
      user: userId,
      cryptomusUuid: invoice.uuid,
      status: 'pending',
    });
    res.json({ paymentUrl: invoice.url, transactionId: transaction._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCreditBalance = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (user.role === 'sub') {
    const parent = await User.findById(user.parent);
    return res.json({ credit: parent.credit });
  }
  res.json({ credit: user.credit });
};

module.exports = { rechargeCredit, getCreditBalance };