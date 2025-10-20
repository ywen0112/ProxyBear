const { createInvoice, getPaymentInfo } = require('../config/cryptomus');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const rechargeCredit = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  try {
    const usd = Number(amount);
    if (!Number.isFinite(usd) || usd <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    const orderId = `recharge_${userId}_${Date.now()}`;
    const invoice = await createInvoice(usd, orderId); // { uuid, url/link/checkout_url, ... }

    const RATE = Number(process.env.CREDITS_PER_USD || 1);
    const expectedCredits = Math.floor(usd * RATE);
    const paymentUrl = invoice.url || invoice.link || invoice.checkout_url;

    const lifetimeSec = Number(process.env.CREDITS_INVOICE_LIFETIME || 3600);
    const expiresAt = new Date(Date.now() + lifetimeSec * 1000);

    const trx = await Transaction.create({
      type: 'recharge',
      amount: usd,
      user: userId,
      orderId,
      cryptomusUuid: invoice.uuid,
      status: 'pending',
      credited: false,
      paymentUrl,
      expiresAt,
      expired: false,
    });

    return res.json({
      paymentUrl,
      transactionId: trx._id,
      orderId,
      rate: RATE,
      expectedCredits,
      expiresAt,
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

const getActivePaymentLink = async (req, res) => {
  const userId = req.user.id;

  let trx = await Transaction.findOne({
    user: userId,
    type: 'recharge',
    status: 'pending',
    credited: false,
    expired: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!trx) return res.json({ hasActive: false });

  try {
    if (trx.cryptomusUuid) {
      const info = await getPaymentInfo(trx.cryptomusUuid); // { status, ... }
      if (['paid', 'paid_over'].includes(info.status)) {
        trx.status = 'completed';
        trx.credited = true;
        await trx.save();
        return res.json({ hasActive: false });
      }
      if (['fail', 'cancel', 'system_fail', 'wrong_amount', 'expired'].includes(info.status)) {
        trx.status = 'failed';
        await trx.save();
        return res.json({ hasActive: false });
      }
    }
  } catch (e) {
    console.warn('[getActivePaymentLink] info fetch warn:', e?.message);
  }

  return res.json({
    hasActive: true,
    transactionId: trx._id,
    orderId: trx.orderId,
    paymentUrl: trx.paymentUrl,
    expiresAt: trx.expiresAt,
  });
};

const expirePayment = async (req, res) => {
  const userId = req.user.id;
  const { transactionId } = req.params;

  const trx = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!trx) return res.status(404).json({ message: 'Transaction not found' });

  if (trx.status !== 'pending' || trx.credited) {
    return res.status(400).json({ message: 'Transaction already closed' });
  }

  trx.expired = true;
  trx.status = 'failed'; 
  await trx.save();

  return res.json({ ok: true });
};

module.exports = {
  rechargeCredit,
  getCreditBalance,
  getActivePaymentLink,
  expirePayment,
};
