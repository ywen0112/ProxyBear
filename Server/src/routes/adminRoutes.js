const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers, getAllTransactions, addProduct } = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.post('/products', addProduct);

module.exports = router;