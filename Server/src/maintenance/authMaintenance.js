const jwt = require("jsonwebtoken")
const User = require("../models/User")

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )
}

const registerUser = async ({ username, email, password }) => {
  const user = await User.create({ username, email, password, role: "main" })
  return { token: generateToken(user) }
}

const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  })

  if (!user || !(await user.comparePassword(password))) {
    throw new Error("登录凭证无效")
  }

  return { token: generateToken(user) }
}

module.exports = { registerUser, loginUser }
