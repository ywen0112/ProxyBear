const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listProducts, listAllProducts } = require('../controllers/productController');

const router = express.Router();


router.get('/', listProducts);
router.get('/all', protect, listAllProducts);

module.exports = router;