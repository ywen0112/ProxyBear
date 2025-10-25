const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listMyTransactions } = require('../controllers/transactionController');

const router = express.Router();
router.use(protect);

router.get('/my', listMyTransactions); // GET /api/transactions/my

module.exports = router;
