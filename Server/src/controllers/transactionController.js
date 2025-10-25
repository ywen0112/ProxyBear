const Transaction = require('../models/Transaction');

// 统一错误
const sendErr = (res, code, message, extra = {}) =>
  res.status(code).json({ message, ...extra });

const listMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const q = { user: userId };
    if (req.query.status) q.status = req.query.status;
    if (req.query.type)   q.type   = req.query.type;

    const [items, total] = await Promise.all([
      Transaction.find(q)
        .select('type amount expectedCredits status orderId paymentUrl expiresAt createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(q),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[listMyTransactions]', err);
    sendErr(res, 500, '加载交易失败');
  }
};

module.exports = { listMyTransactions };
