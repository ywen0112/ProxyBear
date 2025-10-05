const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { rechargeCredit, getCreditBalance } = require('../controllers/creditController');

const router = express.Router();

router.use(protect);

router.post('/recharge', rechargeCredit);
router.get('/balance', getCreditBalance);

module.exports = router;