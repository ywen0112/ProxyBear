import axios from "axios"
import { jwtDecode } from "jwt-decode"

export type UserToken = {
  id: string
  username: string
  email: string
  role: string
  exp: number
  iat: number
}

const API_BASE = "http://localhost:8210/api/auth"

export async function login(identifier: string, password: string) {
  const response = await axios.post(
    `${API_BASE}/login`,
    { identifier, password },
    { headers: { "Content-Type": "application/json" } }
  )
  const { token } = response.data
  sessionStorage.setItem("token", token)
  const decoded: UserToken = jwtDecode(token)
  const { id, username, email, role } = decoded
  const user = { id, username, email, role }
  sessionStorage.setItem("user", JSON.stringify(user))
  return user
}

export async function register(username: string, email: string, password: string) {
  const response = await axios.post(
    `${API_BASE}/register`,
    { username, email, password },
    { headers: { "Content-Type": "application/json" } }
  )
  const { token } = response.data
  sessionStorage.setItem("token", token)
  const decoded: UserToken = jwtDecode(token)
  const { id, username: decodedUsername, email: userEmail, role } = decoded
  const user = { id, username: decodedUsername, email: userEmail, role }
  sessionStorage.setItem("user", JSON.stringify(user))
  return user
}
