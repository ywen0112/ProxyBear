const User = require("../models/User");
const UserBillingInfo = require("../models/UserBillingInfo");

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("用户未找到");

  const billing = await UserBillingInfo.findOne({ user: userId });

  return { user, billing: billing || null };
};

const updateUserBasic = async (userId, { username, email }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { username, email },
    { new: true }
  );
  if (!user) throw new Error("用户未找到");

  return user;
};

const updateUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("用户未找到");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new Error("当前密码无效");

  user.password = newPassword;
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

module.exports = {
  getUserById, 
  updateUserBasic,
  updateUserPassword,
  upsertUserBilling,
};
