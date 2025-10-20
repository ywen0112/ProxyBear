// controllers/credit.controller.js
const { createInvoice } = require('../config/cryptomus');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const rechargeCredit = async (req, res) => {
  const { amount } = req.body;      // USD 金额
  const userId = req.user.id;

  try {
    const usd = Number(amount);
    if (!Number.isFinite(usd) || usd < 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    const orderId = `recharge_${userId}_${Date.now()}`;
    const invoice = await createInvoice(usd, orderId); // result: uuid, url, ...

    const trx = await Transaction.create({
      type: 'recharge',
      amount: usd,
      user: userId,
      orderId,
      cryptomusUuid: invoice.uuid,
      status: 'pending',
      credited: false,
    });

    const RATE = Number(process.env.CREDITS_PER_USD || 1);
    const expectedCredits = Math.floor(usd * RATE);
    const paymentUrl = invoice.url || invoice.link || invoice.checkout_url;

    return res.json({
      paymentUrl,
      transactionId: trx._id,
      orderId,
      rate: RATE,
      expectedCredits, // 提示用；最终以 webhook 入账为准
    });
  } catch (err) {
    console.error('[rechargeCredit] error:', err?.response?.data || err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getCreditBalance = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.role === 'sub') {
    const parent = await User.findById(user.parent);
    return res.json({ credit: parent?.credit ?? 0 });
  }
  return res.json({ credit: user.credit ?? 0 });
};

module.exports = { rechargeCredit, getCreditBalance };
