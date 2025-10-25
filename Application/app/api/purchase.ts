import axios from "axios";

const API_BASE = "http://localhost:8210/api";
const authHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * 创建购买计划 (调用 BE -> LightningResell)
 * @param option 'residential' | 'mobile' | 'ipv6' | 'isp'
 * @param data 购买参数，例如：
 *   - { bandwidth: 100 }
 *   - { plan: 7, speed: 60 }
 *   - { ip: 1, region: "virm" }
 */
export async function createPurchasePlan(
  option: "residential" | "mobile" | "ipv6" | "isp",
  data: Record<string, any>,
  price: number
) {
  const res = await axios.post(
    `${API_BASE}/purchase/getplan/${option}`,
    price ? { ...data, price } : data, 
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    }
  );
  return res.data; // { planID: "xxx" }
}
