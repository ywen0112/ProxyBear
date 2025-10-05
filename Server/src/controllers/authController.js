const { registerUser, loginUser } = require("../maintenance/authMaintenance")

const register = async (req, res) => {
  const { username, email, password } = req.body
  try {
    const { user, token } = await registerUser({ username, email, password })
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const login = async (req, res) => {
  const { identifier, password } = req.body
  try {
    const { token } = await loginUser({ identifier, password })
    res.json({ token })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { register, login }
