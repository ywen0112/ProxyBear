// services/authService.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  // 不把 credit 放进 token（是易变数据，容易过期）
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const registerUser = async ({ username, email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.create({
    username,
    email: normalizedEmail,
    password,
    role: "main",
    credit: 0,
  });
  return { token: generateToken(user) };
};

const loginUser = async ({ identifier, password }) => {
  if (!identifier || !password) throw new Error("登录凭证无效");

  const id = String(identifier).trim();
  const query = id.includes("@")
    ? { email: id.toLowerCase() }
    : { username: id };

  // 关键：显式取回 password（schema 里 password: select:false）
  const user = await User.findOne(query).select(
    "+password role email username credit parent usesPool"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new Error("登录凭证无效");
  }

  // 计算可用余额
  let effectiveCredit = 0;
  if (user.role === "main") {
    effectiveCredit = user.credit || 0;
  } else {
    // sub：看主账号的 credit
    const main = await User.findById(user.parent).select("credit").lean();
    effectiveCredit = main ? (main.credit || 0) : 0;
  }

  return {
    token: generateToken(user),
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      parent: user.parent || undefined,
      // main 才返回自己的 credit；sub 不返回（以免误导）
      credit: user.role === "main" ? (user.credit || 0) : undefined,
      usesPool: user.role === "sub" ? true : undefined,
      effectiveCredit, // ✅ 前端请用这个来展示余额
    },
  };
};

module.exports = { registerUser, loginUser };
