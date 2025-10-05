const express = require('express');
const { cryptomusWebhook } = require('../controllers/webHookController');

const router = express.Router();

router.post('/cryptomus', cryptomusWebhook);

module.exports = router;