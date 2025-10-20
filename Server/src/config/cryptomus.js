const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const BASE_URL    = process.env.CRYPTOMUS_BASE_URL || 'https://api.cryptomus.com/v1';
const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY;

function generateSign(bodyObj) {
  const json = JSON.stringify(bodyObj);
  const b64  = Buffer.from(json, 'utf8').toString('base64');
  return crypto.createHash('md5').update(b64 + PAYMENT_KEY, 'utf8').digest('hex');
}

function verifySign(rawJson) {
  if (!rawJson) return false;
  let incoming;
  try {
    incoming = JSON.parse(rawJson);
  } catch {
    return false;
  }
  const { sign, ...rest } = incoming || {};
  if (!sign) return false;

  const b64 = Buffer.from(JSON.stringify(rest), 'utf8').toString('base64');
  const calc = crypto.createHash('md5').update(b64 + PAYMENT_KEY, 'utf8').digest('hex');
  return calc === sign;
}


// 通用 POST 包装：带签名头 + 超时 + 错误透出
async function cryptomusPost(path, body) {
  const headers = {
    merchant: MERCHANT_ID,
    sign: generateSign(body),
    'Content-Type': 'application/json',
  };
  const { data } = await axios.post(`${BASE_URL}${path}`, body, { headers, timeout: 15000 });
  if (data?.state !== 0) {
    const msg = data?.message || JSON.stringify(data);
    throw new Error(`Cryptomus error: ${msg}`);
  }
  return data.result;
}

// 创建发票（推荐带上 to_currency/network 与回调跳转）
async function createInvoice(amount, orderId, currency = 'USD') {
  const body = {
    amount: String(amount),                                  
    currency,                                               
    order_id: orderId,                             
    url_callback: `${process.env.PUBLIC_API_URL}/webhook/cryptomus`,
    url_success: `${process.env.APP_URL}/dashboard`,
    url_return: `${process.env.APP_URL}/topup`,
    lifetime: 3600,                                        
  };
  return cryptomusPost('/payment', body);
}

// 查询发票信息
async function getPaymentInfo(uuid) {
  return cryptomusPost('/payment/info', { uuid });
}

module.exports = { createInvoice, getPaymentInfo, verifySign, generateSign };
