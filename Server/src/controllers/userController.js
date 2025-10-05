const {
  updateUserBasic,
  updateUserPassword,
  upsertUserBilling,
  getUserById
} = require("../maintenance/userMaintenance");

const getUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getUserById(id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const updateBasicInfo = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await updateUserBasic(req.user.id, { username, email });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await updateUserPassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const upsertBillingInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const billing = await upsertUserBilling(userId, req.body);
    res.json({ billing });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getUserInfo, updateBasicInfo, updatePassword, upsertBillingInfo };
