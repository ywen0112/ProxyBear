const axios = require('axios');
const FormData = require('form-data');

const BASE = process.env.LP_BASE_URL;
const API_KEY = process.env.LP_API_KEY;
// const DRY_RUN = process.env.LP_DRY_RUN === 'false';

if (!API_KEY) {
  console.warn('[LP-RESELL] LP_RESELL_API_KEY not set, requests will fail.');
}

const client = axios.create({
  baseURL: BASE,
  timeout: 20000,
});

// 统一错误透传
client.interceptors.response.use(
  r => r,
  e => {
    const status = e?.response?.status || 500;
    const data = e?.response?.data;
    const message = data?.message || data?.error || e.message || 'LP Resell request failed';
    return Promise.reject({ status, data, message });
  }
);

/**
 * 调用 /api/getplan/:option
 * @param {'residential'|'mobile'|'ipv6'|'isp'} option
 * @param {Record<string, string|number|boolean>} fields - 将以 multipart/form-data 发送
 */
async function getPlan(option, fields) {
    // if (DRY_RUN) {
    //     // 模拟响应结构，planID 要和真实返回一致的键名
    //     return {
    //     status: 200,
    //     data: { planID: `dryrun-${option}-${Date.now()}` },
    //     };
    // }

  const form = new FormData();
  Object.entries(fields || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') form.append(k, String(v));
  });

  return client.post(`/api/getplan/${option}`, form, {
    headers: {
      'x-api-key': API_KEY,
      ...form.getHeaders(), // multipart 头
    },
  });
}

async function readPlan(option, planId) {
  return client.get(`/api/plan/${option}/read/${planId}`, {
    headers: { 'x-api-key': API_KEY },
  });
}

async function updateIPv6Whitelist(action, planId, ipaddress) {
  if (!['add', 'remove'].includes(action)) {
    throw { status: 400, message: 'action must be "add" or "remove"' };
  }
  return client.post(
    `/api/plan/ipv6/${action}/whitelist/${encodeURIComponent(planId)}/${encodeURIComponent(ipaddress)}`,
    null,
    { headers: { 'x-api-key': API_KEY } }
  );
}

async function extendPlan(subscriptionId, type, payload) {
  if (!['ipv6', 'isp'].includes(type)) {
    throw { status: 400, message: 'Invalid type (must be ipv6 or isp)' };
  }

  return client.patch(
    `/api/extend-plan/${encodeURIComponent(subscriptionId)}`,
    payload,
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

module.exports = { getPlan, readPlan, updateIPv6Whitelist, extendPlan  };
