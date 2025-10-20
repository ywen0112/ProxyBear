// controllers/webhook.controller.js
const { verifySign } = require('../config/cryptomus');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const cryptomusWebhook = async (req, res) => {
  try {
    // 原始 body（因为该路由用了 express.raw）
    const raw = req.body instanceof Buffer ? req.body.toString('utf8') : '';

    // 1) 验签（必须用原始 JSON 字符串）
    if (!verifySign(raw)) {
      return res.status(403).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(raw || '{}');
    const { uuid, status, order_id } = event;

    // 2) 查找交易：优先 uuid，兜底 orderId
    let trx = await Transaction.findOne({ cryptomusUuid: uuid });
    if (!trx && order_id) trx = await Transaction.findOne({ orderId: order_id });
    if (!trx) return res.status(404).json({ message: 'Transaction not found' });

    // 记录事件与最后一次回调
    trx.events.push(event);
    trx.lastWebhook = event;

    // 3) 失败/取消类态
    if (['fail', 'cancel', 'system_fail', 'wrong_amount', 'expired'].includes(status)) {
      if (trx.status !== 'completed') trx.status = 'failed';
      await trx.save();
      return res.status(200).send('OK');
    }

    // 4) 成功入账（幂等）
    if (['paid', 'paid_over'].includes(status) && trx.status === 'pending' && !trx.credited) {
      const RATE = Number(process.env.CREDITS_PER_USD || 1);

      // 若回调有实际到账美元字段（按你的事件字段名调整），优先用；否则用下单金额
      const usd = Number(event.paid_amount ?? trx.amount);
      const creditsToAdd = Math.floor(usd * RATE);

      const updated = await Transaction.findOneAndUpdate(
        { _id: trx._id, credited: false, status: 'pending' },
        {
          $set: {
            credited: true,
            status: 'completed',
            rate: RATE,
            creditedAmount: creditsToAdd,
            payerCurrency: event.payer_currency || trx.payerCurrency,
            payerAmount: Number(event.payer_amount ?? trx.payerAmount) || 0,
            network: event.network || trx.network,
            txid: event.txid || trx.txid,
            lastWebhook: event,
          },
          $push: { events: event },
        },
        { new: true }
      );

      if (updated) {
        await User.updateOne({ _id: trx.user }, { $inc: { credit: creditsToAdd } });
      }
    } else {
      await trx.save();
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[cryptomusWebhook] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { cryptomusWebhook };
