const { verifySign } = require('../config/cryptomus');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const cryptomusWebhook = async (req, res) => {
  const body = { ...req.body };
  const receivedSign = body.sign;
  delete body.sign;

  if (!verifySign(body, receivedSign)) {
    return res.status(403).json({ message: 'Invalid signature' });
  }

  const { uuid, status, order_id } = body;

  try {
    const transaction = await Transaction.findOne({ cryptomusUuid: uuid });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (['paid', 'paid_over'].includes(status) && transaction.status === 'pending') {
      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findById(transaction.user);
      user.credit += transaction.amount;
      await user.save();
    } else if (['fail', 'cancel', 'system_fail'].includes(status)) {
      transaction.status = 'failed';
      await transaction.save();
    }

    res.status(200).send('OK');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { cryptomusWebhook };