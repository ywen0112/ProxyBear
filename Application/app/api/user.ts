import axios from "axios"

const API_BASE = "http://localhost:8210/api/users"

export async function getUserInfo(userId: string) {
  const response = await axios.get(`${API_BASE}/${userId}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  })
  return response.data
}

export async function updateBasicInfo(username: string, email: string) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  if (!user?.id) throw new Error("用户未登录")

  const response = await axios.put(
    `${API_BASE}/basic`,
    { username, email },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  )
  return response.data
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  const response = await axios.put(
    `${API_BASE}/password`,
    { currentPassword, newPassword },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  )
  return response.data
}

export async function upsertBillingInfo(billingData: Record<string, any>) {
  const response = await axios.post(`${API_BASE}/billing`, billingData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  })
  return response.data
}
