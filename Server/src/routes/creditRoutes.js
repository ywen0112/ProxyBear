const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  rechargeCredit,
  getCreditBalance,
  getActivePaymentLink,
  expirePayment,
} = require('../controllers/creditController');

const router = express.Router();
router.use(protect);

router.post('/recharge', rechargeCredit);
router.get('/balance', getCreditBalance);
router.get('/active-payment', getActivePaymentLink);
router.post('/expire/:transactionId', expirePayment);

module.exports = router;
