const {
  updateUserBasic,
  updateUserPassword,
  upsertUserBilling,
  getUserById,
  createSubUser,
  getSubUsersByMainEmail,
  deleteSubUser,
  spendCredit, 
} = require("../maintenance/userMaintenance");

// 统一错误响应
function sendErr(res, status, message, extra = {}) {
  return res.status(status).json({ message, ...extra });
}

const getUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getUserById(id); 
    return res.json(data);
  } catch (err) {
    return sendErr(res, 404, err.message);
  }
};

const updateBasicInfo = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await updateUserBasic(req.user.id, { username, email });
    return res.json({ user });
  } catch (err) {
    return sendErr(res, 400, err.message);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await updateUserPassword(req.user.id, currentPassword, newPassword);
    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return sendErr(res, 400, err.message);
  }
};

const upsertBillingInfo = async (req, res) => {
  try {
    const billing = await upsertUserBilling(req.user.id, req.body);
    return res.json({ billing });
  } catch (err) {
    return sendErr(res, 400, err.message);
  }
};

const createSubuser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendErr(res, 400, "子用户邮箱是必须的");

    const { user, plainPassword } = await createSubUser(req.user.id, { subEmail: email });
    return res.status(201).json({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      password: plainPassword,
      usesPool: true,
      credit: 0,
    });
  } catch (err) {
    const code = err.code === "DUPLICATE_EMAIL" ? 409 : 400;
    return sendErr(res, code, err.message);
  }
};

const getSubuserList = async (req, res) => {
  try {
    if (req.user.role !== "main") return sendErr(res, 403, "Forbidden");

    const requestedEmail = String(req.query.email || "").trim().toLowerCase();
    const authedLower = String(req.user.email || "").toLowerCase();
    const effectiveEmail = requestedEmail || authedLower;

    if (requestedEmail && requestedEmail !== authedLower) {
      return sendErr(res, 403, "Forbidden");
    }

    const subs = await getSubUsersByMainEmail(effectiveEmail);
    const data = subs.map((s) => ({
      id: s._id.toString(),
      email: s.email,
      username: s.username,
      usesPool: true,
      credit: 0,
      effectiveCredit: s.effectiveCredit,
      createdAt: s.createdAt,
    }));

    return res.json({ subusers: data });
  } catch (err) {
    return sendErr(res, 400, err.message);
  }
};

const deleteSubuser = async (req, res) => {
  try {
    if (req.user.role !== "main") return sendErr(res, 403, "Forbidden");

    const { subId } = req.params;
    if (!subId) return sendErr(res, 400, "子用户ID是必要的");

    const deleted = await deleteSubUser(req.user.id, subId);
    return res.json({ message: "Sub user deleted", subuser: deleted });
  } catch (err) {
    const code = err.code === "NOT_FOUND" ? 404 : 400;
    return sendErr(res, code, err.message);
  }
};

const spend = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return sendErr(res, 400, "amount 必须是正数");
    }

    const spenderId = userId || req.user.id;
    if (spenderId !== req.user.id && req.user.role !== "main") {
      return sendErr(res, 403, "Forbidden");
    }

    const result = await spendCredit(spenderId, value);
    return res.json(result); 
  } catch (err) {
    if (err.code === "USER_NOT_FOUND" || err.code === "MAIN_NOT_FOUND") {
      return sendErr(res, 404, err.message);
    }
    if (err.code === "INSUFFICIENT_MAIN" || err.code === "INSUFFICIENT_SUB") {
      return sendErr(res, 409, err.message, { code: err.code });
    }
    return sendErr(res, 400, err.message);
  }
};

module.exports = {
  getUserInfo,
  updateBasicInfo,
  updatePassword,
  upsertBillingInfo,
  createSubuser,
  getSubuserList,
  deleteSubuser,
  spend,
};
