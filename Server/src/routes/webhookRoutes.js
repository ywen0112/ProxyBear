const express = require('express');
const { cryptomusWebhook } = require('../controllers/webHookController');

const router = express.Router();

const rawJson = express.raw({ type: 'application/json' });

router.post('/cryptomus', rawJson, cryptomusWebhook);
router.post('/cryptomus/payment', rawJson, cryptomusWebhook); // 兼容旧命名

module.exports = router;