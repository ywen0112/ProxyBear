const crypto = require('crypto');
const axios = require('axios');

const BASE_URL = process.env.CRYPTOMUS_BASE_URL;
const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY;

const generateSign = (body) => {
  const data = JSON.stringify(body);
  const base64Data = Buffer.from(data).toString('base64');
  const toHash = base64Data + PAYMENT_KEY;
  return crypto.createHash('md5').update(toHash).digest('hex');
};

const verifySign = (body, receivedSign) => {
  const data = JSON.stringify(body);
  const base64Data = Buffer.from(data).toString('base64');
  const calculated = crypto.createHash('md5').update(base64Data + PAYMENT_KEY).digest('hex');
  return calculated === receivedSign;
};

const createInvoice = async (amount, orderId, currency = 'USD') => {
  const body = {
    amount: amount.toString(),
    currency,
    order_id: orderId,
    url_callback: 'https://your-domain.com/webhook/cryptomus', 
    is_payment_multiple: true,
    lifetime: 3600,
  };
  const sign = generateSign(body);
  const response = await axios.post(`${BASE_URL}/payment`, body, {
    headers: {
      merchant: MERCHANT_ID,
      sign,
      'Content-Type': 'application/json',
    },
  });
  return response.data.result;
};

const getPaymentInfo = async (uuid) => {
  const body = { uuid };
  const sign = generateSign(body);
  const response = await axios.post(`${BASE_URL}/payment/info`, body, {
    headers: {
      merchant: MERCHANT_ID,
      sign,
      'Content-Type': 'application/json',
    },
  });
  return response.data.result;
};

module.exports = { createInvoice, getPaymentInfo, verifySign };