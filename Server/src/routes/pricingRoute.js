// src/routes/pricingRoute.js
const express = require("express");
const router = express.Router();
const {
  PRICING,
  requirePrice,
  getIPv6UnlimitedPrice,
  getIPv6BandwidthPrice,   // ← 新增：按档位取价
} = require("../config/pricing");

// 查看全部价格配置（可调试）
router.get("/", (req, res) => {
  res.json(PRICING);
});

/**
 * 报价接口
 * POST /api/pricing/quote
 * Body: { category, formData }
 */
router.post("/quote", async (req, res) => {
  try {
    const { category, formData = {} } = req.body || {};
    if (!category) {
      return res.status(400).json({ success: false, message: "缺少 category 参数" });
    }

    let total = 0;

    switch (category) {
      // ---------------- Residential ----------------
      case "Residential": {
        const gb = Number(formData.bandwidth);
        if (!Number.isInteger(gb) || gb <= 0) {
          return res.status(400).json({ success: false, message: "bandwidth 必须为正整数" });
        }
        const perGb = requirePrice("residentialPerGb");
        total = gb * perGb;
        break;
      }

      // ---------------- Mobile ----------------
      case "Mobile": {
        const gb = Number(formData.bandwidth);
        if (!Number.isInteger(gb) || gb <= 0) {
          return res.status(400).json({ success: false, message: "bandwidth 必须为正整数" });
        }
        const perGb = requirePrice("mobilePerGb");
        total = gb * perGb;
        break;
      }

      // ---------------- IPv6 ----------------
      case "IPv6": {
        // A) Unlimited：需要 plan + speed
        if (formData.plan && formData.speed) {
          const days = Number(formData.plan);
          const speed = Number(formData.speed);
          total = getIPv6UnlimitedPrice(days, speed);
        }
        // B) Bandwidth：只能选择固定档位（100/250/...）
        else if (formData.bandwidth) {
          const size = Number(formData.bandwidth);
          if (!Number.isInteger(size) || size <= 0) {
            return res.status(400).json({ success: false, message: "bandwidth 必须为正整数" });
          }
          total = getIPv6BandwidthPrice(size); // ← 从阶梯价表取，未配置会抛错
        } else {
          return res.status(400).json({ success: false, message: "IPv6 需要 (plan+speed) 或 bandwidth 其一" });
        }
        break;
      }

      // ---------------- ISP ----------------
      case "ISP": {
        const ip = Number(formData.ip);
        const region = String(formData.region || "");
        if (![1, 2, 3].includes(ip)) {
          return res.status(400).json({ success: false, message: "ip 仅支持 1/2/3" });
        }
        if (!region) {
          return res.status(400).json({ success: false, message: "缺少 region" });
        }
        // 可选：校验 region 是否在允许列表中（若你在产品里有 validRegions，可拉进来校验）
        const perIp = requirePrice("ispPerIp");
        total = ip * perIp;
        break;
      }

      default:
        return res.status(400).json({ success: false, message: `未知的类别: ${category}` });
    }

    return res.json({
      success: true,
      data: {
        category,
        total: Number(total.toFixed(2)), // 返回数字，前端可直接 .toFixed(2)
        currency: "USD",
      },
    });
  } catch (err) {
    console.error("报价计算失败:", err);
    const msg = err?.message || "服务器错误";
    return res.status(500).json({ success: false, message: msg });
  }
});

module.exports = router;
