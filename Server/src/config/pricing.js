// src/config/pricing.js
function num(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** IPv6 Bandwidth 阶梯价（按你截图） */
const DEFAULT_IPV6_BW_TIERS = {
  100: 20,
  250: 40,
  500: 70,
  1000: 110,
  3000: 250,
  5000: 350,
  10000: 550,
};
// 若要统一加价（例如 +0.5），在 .env 里设 IPV6_BW_MARKUP_CREDIT=0.5
const MARKUP = num(process.env.IPV6_BW_MARKUP_CREDIT);
const IPV6_BW_TIERS = Object.fromEntries(
  Object.entries(DEFAULT_IPV6_BW_TIERS).map(([k, v]) => [k, Number(v) + MARKUP])
);

/** IPv6 Unlimited（你之前+0.5 的表） */
const DEFAULT_UNLIMITED = {
  1:  { 30: 10.5,  60: 15.5, 120: 20.5, 200: 25.5 },
  7:  { 30: 45.5,  60: 60.5, 120: 90.5, 200: 120.5 },
  30: { 30: 110.5, 60: 150.5, 120: 250.5, 200: 350.5 },
};

const PRICING = {
  // 给默认值，防止未配置 .env 时为 undefined
  residentialPerGb: num(process.env.RES_PRICE_PER_GB, 2.1),
  mobilePerGb: num(process.env.MOBILE_PRICE_PER_GB, 2.3),
  ispPerIp: num(process.env.ISP_PRICE_PER_IP, 2.0),

  // IPv6
  ipv6BandwidthTiers: IPV6_BW_TIERS,      // ← 改为阶梯价表
  ipv6UnlimitedPlans: DEFAULT_UNLIMITED,  // ← 不变，仍按表取价
};

// 工具函数
function requirePrice(key) {
  const val = PRICING[key];
  if (val === undefined) throw new Error(`Pricing for "${key}" is not defined.`);
  return val;
}

function getIPv6UnlimitedPrice(days, speed) {
  const plan = PRICING.ipv6UnlimitedPlans[days];
  if (!plan) throw new Error(`Invalid IPv6 Unlimited plan: ${days} days`);
  const price = plan[speed];
  if (!price) throw new Error(`Invalid speed ${speed} Mbps for ${days}-day plan`);
  return price;
}

function getIPv6BandwidthPrice(sizeGb) {
  const tiers = PRICING.ipv6BandwidthTiers;
  const price = tiers[sizeGb];
  if (!price) throw new Error(`Invalid IPv6 Bandwidth tier: ${sizeGb} GB`);
  return price;
}

module.exports = { PRICING, requirePrice, getIPv6UnlimitedPrice, getIPv6BandwidthPrice };
