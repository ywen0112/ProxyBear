import axios from "axios";

const API_BASE = "http://localhost:8210/api";


function authHeaders() {
  const raw = sessionStorage.getItem("token");
  const token = raw ? raw.trim().replace(/^"+|"+$/g, "") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export interface FormField {
  key: string;
  label: string;
  type: "integer" | "select";
  unit?: string;
  enum?: { value: string | number; label: string }[];
  required?: boolean;
  help?: string;
  min?: number;
  step?: number;
  showIf?: { key: string; value: any } | null;
}

export interface SubCategory {
  name: string;
  pricingType: string;
  formFields: FormField[];
}

export interface ProductDescription {
  short: string;
  long: string;
  long2?: string;
  features: string[];
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  formType: string;
  description: ProductDescription;
  validRegions?: string[];
  subCategories: SubCategory[];
  createdAt: string;
}

/**
 * 获取所有产品定义
 */
export async function getAllProducts(): Promise<Product[]> {
  const res = await axios.get(`${API_BASE}/products/all`,
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  if (!res.data?.success) throw new Error(res.data?.message || "获取产品失败");
  return res.data.data;
}

/**
 * 获取单个产品（通过 category）
 */
export async function getProductByCategory(category: string): Promise<Product | null> {
  const res = await axios.get(`${API_BASE}/products/${category}`,
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  if (!res.data?.success) return null;
  return res.data.data as Product;
}

/**
 * 计算报价（后端会根据 category 判断调用 pricing.js）
 */
export async function getProductQuote(category: string, formData: Record<string, any>) {
  const res = await axios.post(`${API_BASE}/pricing/quote`, {
    category,
    formData,
  }, {
    headers: { "Content-Type": "application/json" }
  });

  if (!res.data?.success) throw new Error(res.data?.message || "报价计算失败");
  return res.data.data;
}

