const { getPlan,readPlan, updateIPv6Whitelist, extendPlan } = require('../config/lightningResell');
const ResellPlan = require('../models/ResellPlan');

// 如果你已有 sendErr 工具就用你的，这里给一个兜底
function sendErr(res, code, message, detail) {
  return res.status(code).json({ message, detail });
}

/**
 * POST /api/lightning-resell/getplan/:option
 * Body:
 *  - residential/mobile: { bandwidth: number }
 *  - ipv6: { plan:number, speed:number } 或 { bandwidth:number }
 *  - isp: { ip:number, region:string }
 *
 * 返回：
 *  - { planID: string }
 */
const createPlan = async (req, res) => {
  try {
    const option = String(req.params.option || '').toLowerCase();
    const allowed = ['residential', 'mobile', 'ipv6', 'isp'];
    if (!allowed.includes(option)) {
      return sendErr(res, 400, `option must be one of: ${allowed.join(', ')}`);
    }

    // 提取 body，并把 price 单独拿出来；其余字段给上游
    const body = req.body || {};
    const rawPrice = body.price;
    const { price, ...planData } = body; 

    // 校验 price（你的系统内部记账用，单位=credit）
    const priceNum = Number(rawPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return sendErr(res, 400, 'price must be a positive number');
    }

    // 业务参数校验（针对 planData）
    switch (option) {
      case 'residential':
      case 'mobile': {
        const bw = Number(planData.bandwidth);
        if (!Number.isFinite(bw) || bw <= 0) {
          return sendErr(res, 400, 'bandwidth must be a positive number');
        }
        break;
      }
      case 'ipv6': {
        const hasUnlimited = planData.plan !== undefined && planData.speed !== undefined;
        const hasBandwidth = planData.bandwidth !== undefined;
        if (!hasUnlimited && !hasBandwidth) {
          return sendErr(res, 400, 'ipv6 requires either {plan, speed} or {bandwidth}');
        }
        if (hasUnlimited) {
          const plan = Number(planData.plan);
          const speed = Number(planData.speed);
          if (!Number.isFinite(plan) || plan <= 0) return sendErr(res, 400, 'plan must be a positive number');
          if (!Number.isFinite(speed) || speed <= 0) return sendErr(res, 400, 'speed must be a positive number');
        }
        if (hasBandwidth) {
          const bw = Number(planData.bandwidth);
          if (!Number.isFinite(bw) || bw <= 0) return sendErr(res, 400, 'bandwidth must be a positive number');
        }
        break;
      }
      case 'isp': {
        const ip = Number(planData.ip);
        const region = String(planData.region || '');
        if (!Number.isFinite(ip) || ip <= 0) return sendErr(res, 400, 'ip must be a positive number');
        if (!region) return sendErr(res, 400, 'region is required');
        // 可选：校验 region 是否在 allowlist
        break;
      }
    }

    // 调上游 Resell API —— 只发 planData，不含 price
    const r = await getPlan(option, planData);

    // 预期返回 { planID }
    const planId = r?.data?.planID || r?.data?.planId;
    if (!planId) {
      return sendErr(res, 502, 'Provider did not return planID', r?.data);
    }

    // 存库（只记录 planId / option / user / price）
    await ResellPlan.findOneAndUpdate(
      { planId },
      {
        planId,
        option,
        user: req.user?.id,   // protect 中间件会把它塞到 req.user
        price: String(priceNum),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 返回给前端（可一并回传 price，方便 UI 提示）
    return res.json({ planID: planId});
  } catch (err) {
    console.error('[LP-RESELL createPlan] error:', err);
    const code = err.status || 500;
    return sendErr(res, code, err.message, err.data);
  }
};

const listMyPlans = async (req, res) => {
  try {
    const items = await ResellPlan
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('_id planId option price createdAt')
      .lean();
    res.json(items);
  } catch (e) {
    console.error('[listMyPlans] error:', e);
    res.status(500).json({ message: 'Failed to load plans' });
  }
};

async function listPlansByUser(req, res) {
  try {
    const { userId } = req.params;
    const rows = await ResellPlan.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('planId option price createdAt')
      .lean();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取购买记录失败' });
  }
}

async function readPlanCommon(req, res, option) {
  try {
    const planId = req.params.planId;
    if (!planId) return sendErr(res, 400, 'planId is required');

    const r = await readPlan(option, planId);
    return res.json(r.data);
  } catch (err) {
    console.error(`[LP-RESELL readPlan ${option}]`, err);
    const code = err.status || 500;
    return sendErr(res, code, err.message, err.data);
  }
}

// ✅ 对应每种类型
const readResidentialPlan = (req, res) => readPlanCommon(req, res, 'residential');
const readMobilePlan = (req, res) => readPlanCommon(req, res, 'mobile');
const readIPv6Plan = (req, res) => readPlanCommon(req, res, 'ipv6');
const readDatacenterPlan = (req, res) => readPlanCommon(req, res, 'datacenter');
const readISPPlan = (req, res) => readPlanCommon(req, res, 'isp');

const ipv6Whitelist = async (req, res) => {
  try {
    const { action, planId, ip } = req.body || {};
    if (!action || !planId || !ip) {
      return sendErr(res, 400, 'action, planId, ip are required');
    }
    if (!['add', 'remove'].includes(String(action))) {
      return sendErr(res, 400, 'action must be "add" or "remove"');
    }
    if (!isIP(ip)) {
      return sendErr(res, 400, 'Invalid IP address');
    }

    // 归属校验：只允许操作自己拥有的 IPv6 计划
    const owned = await ResellPlan.findOne({
      planId,
      option: 'ipv6',
      user: req.user?._id,
    }).lean();

    if (!owned) {
      return sendErr(res, 403, 'Not allowed: plan not found or not owned by you');
    }

    const r = await updateIPv6Whitelist(action, planId, ip);
    return res.json({
      success: true,
      message: r?.data?.message || 'OK',
    });
  } catch (err) {
    console.error('[LP-RESELL ipv6Whitelist] error:', err);
    const code = err.status || 500;
    return sendErr(res, code, err.message, err.data);
  }
};

const extendPlanController = async (req, res) => {
  try {
    const { planId, type, speed, duration, value } = req.body;

    if (!planId || !type)
      return res.status(400).json({ message: 'planId and type are required' });

    const owned = await ResellPlan.findOne({ planId, user: req.user._id });
    if (!owned) return res.status(403).json({ message: 'Plan not owned by user' });

    let payload = {};
    if (type === 'ipv6') {
      if (!speed || !duration) {
        return res.status(400).json({ message: 'speed and duration required for IPv6' });
      }
      payload = { type: 'ipv6', speed, duration };
    } else if (type === 'isp') {
      if (value !== '30') {
        return res.status(400).json({ message: 'ISP only supports 30-day extension' });
      }
      payload = { type: 'isp', value };
    }

    const response = await extendPlan(planId, type, payload);
    res.json({
      success: true,
      message: '延期成功',
      data: response.data,
    });
  } catch (err) {
    console.error('extendPlan error', err);
    res
      .status(err.status || 500)
      .json({ message: err.message || '延期失败', data: err.data });
  }
};

module.exports = { createPlan, listMyPlans, readResidentialPlan,  readIPv6Plan,  readDatacenterPlan, readMobilePlan, readISPPlan, listPlansByUser, ipv6Whitelist, extendPlanController};
