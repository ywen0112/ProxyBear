const crypto = require('crypto');
const User = require('../models/User');
const UserBillingInfo = require('../models/UserBillingInfo');

// ---------- 工具 ----------
const rand = (len = 10) =>
  crypto.randomBytes(32).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);

// 共享池下“有效余额”（展示用）：main=自己的credit；sub=主账号credit
const computeEffectiveCredit = (user, main) => {
  if (!user) return 0;
  if (user.role === 'main') return user.credit || 0;
  return main?.credit || 0; // 子用户一律看主池
};

// ---------- 读取 ----------
const getUserById = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('用户未找到');

  let main = null;
  if (user.role === 'sub' && user.parent) {
    main = await User.findById(user.parent).select('credit').lean();
  }

  const billing = await UserBillingInfo.findOne({ user: userId });
  const effectiveCredit = computeEffectiveCredit(user, main);
  return { user: { ...user, effectiveCredit }, billing: billing || null };
};

const updateUserBasic = async (userId, { username, email }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(username != null ? { username } : {}),
      ...(email != null ? { email: String(email).trim().toLowerCase() } : {}),
    },
    { new: true, runValidators: true }
  ).lean();
  if (!user) throw new Error('用户未找到');
  return user;
};

const updateUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new Error('用户未找到');

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw new Error('当前密码无效');

  user.password = newPassword; // 走 model 的 pre('save') 自动哈希
  await user.save();
  return true;
};

const upsertUserBilling = async (userId, data) => {
  let billing = await UserBillingInfo.findOne({ user: userId });
  if (billing) {
    billing.set(data);
    await billing.save();
  } else {
    billing = await UserBillingInfo.create({ user: userId, ...data });
  }
  return billing;
};

// ---------- 生成唯一 sub 用户名 ----------
const genSubUsername = async () => {
  for (let i = 0; i < 20; i++) {
    const username = `sub_${rand(8)}`;
    const exists = await User.findOne({ username }).lean();
    if (!exists) return username;
  }
  const err = new Error('生成唯一用户名失败，请重试');
  err.code = 'GEN_USERNAME_FAILED';
  throw err;
};

// ---------- 创建子用户（共享池：usesPool=true, credit=0） ----------
const createSubUser = async (mainUserId, { subEmail }) => {
  const main = await User.findById(mainUserId).select('role');
  if (!main) throw new Error('主账号不存在');
  if (main.role !== 'main') throw new Error('无权限创建子账号');

  const email = String(subEmail || '').trim().toLowerCase();
  if (!email) throw new Error('用户邮件是必要的');

  const taken = await User.findOne({ email }).lean();
  if (taken) {
    const err = new Error('该邮箱已存在');
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }

  const username = await genSubUsername();
  const plainPassword = rand(10);

  const sub = await User.create({
    username,
    email,
    password: plainPassword,  // pre('save') 会自动哈希
    role: 'sub',
    parent: main._id,
    usesPool: true,           // ✅ 共享池
    credit: 0,                // ✅ 共享池下固定 0（占位）
  });

  const clean = await User.findById(sub._id).lean();
  return { user: clean, plainPassword }; // ✅ 仅创建时返回明文
};

// ---------- 获取主账号下的子用户（共享池视图） ----------
const getSubUsersByMainEmail = async (mainEmail) => {
  const email = String(mainEmail || '').trim().toLowerCase();
  if (!email) throw new Error('主账号邮箱是需要的');

  const main = await User.findOne({ email }).select('_id role credit').lean();
  if (!main) throw new Error('主账号不存在');
  if (main.role !== 'main') throw new Error('该邮箱不是主账号');

  const subs = await User.find({ role: 'sub', parent: main._id })
    .select('email username createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return subs.map(s => ({
    ...s,
    usesPool: true,
    credit: 0,
    effectiveCredit: main.credit || 0,
  }));
};

// ---------- 删除子用户 ----------
const deleteSubUser = async (mainUserId, subId) => {
  const sub = await User.findOneAndDelete({ _id: subId, role: 'sub', parent: mainUserId }).lean();
  if (!sub) {
    const err = new Error('子用户不存在或不属于你');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return {
    email: sub.email,
    username: sub.username,
    credit: 0,
    id: sub._id.toString(),
  };
};

/**
 * ---------- 消费（买东西扣款） ----------
 * 共享池规则：
 * - main 购买：从 main.credit 扣
 * - sub  购买：从 parent(main).credit 扣
 * 使用原子条件更新（无需事务），防止透支
 */
const spendCredit = async (spenderUserId, amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    const err = new Error('amount 必须是 > 0 的数字');
    err.code = 'INVALID_AMOUNT';
    throw err;
  }

  const spender = await User.findById(spenderUserId).select('role parent credit').lean();
  if (!spender) {
    const err = new Error('用户未找到');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  if (spender.role === 'main') {
    const res = await User.updateOne(
      { _id: spender._id, credit: { $gte: value } },
      { $inc: { credit: -value } }
    );
    if (res.modifiedCount === 0) {
      const err = new Error('主账号余额不足');
      err.code = 'INSUFFICIENT_MAIN';
      throw err;
    }
    const updated = await User.findById(spender._id).select('credit').lean();
    return { main: { id: spender._id.toString(), pool: updated.credit || 0 } };
  }

  // sub → 扣 parent
  const main = await User.findById(spender.parent).select('credit').lean();
  if (!main) {
    const err = new Error('主账号不存在');
    err.code = 'MAIN_NOT_FOUND';
    throw err;
  }

  const res = await User.updateOne(
    { _id: main._id, credit: { $gte: value } },
    { $inc: { credit: -value } }
  );
  if (res.modifiedCount === 0) {
    const err = new Error('主账号余额不足');
    err.code = 'INSUFFICIENT_MAIN';
    throw err;
  }

  const updated = await User.findById(main._id).select('credit').lean();
  return {
    main: { id: main._id.toString(), pool: updated.credit || 0 },
    sub:  { id: spenderUserId, usesPool: true, effectiveCredit: updated.credit || 0 },
  };
};

module.exports = {
  getUserById,
  updateUserBasic,
  updateUserPassword,
  upsertUserBilling,
  createSubUser,
  getSubUsersByMainEmail,
  deleteSubUser,
  spendCredit,
}