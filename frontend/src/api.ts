export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(data?.message ?? "API error");
    this.status = status;
    this.data = data;
  }
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return { message: text }; } })() : null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const api = {
  // Auth
  register: (login: string, password: string) => req("/api/register", { method: "POST", body: JSON.stringify({ login, password }) }),
  login: (login: string, password: string) => req("/api/login", { method: "POST", body: JSON.stringify({ login, password }) }),
  logout: () => req("/api/logout", { method: "POST" }),
  me: () => req("/api/me"),

  // Public catalog
  publicProducts: (limit = 12) => req(`/public/products?limit=${limit}`),
  publicCategories: () => req("/public/categories"),

  // Cart + Orders
  cart: () => req("/api/cart"),
  cartAdd: (productId: number, qty = 1) => req("/api/cart", { method: "POST", body: JSON.stringify({ productId, qty }) }),
  cartSetQty: (productId: number, qty: number) => req(`/api/cart/${productId}`, { method: "PUT", body: JSON.stringify({ qty }) }),
  cartRemove: (productId: number) => req(`/api/cart/${productId}`, { method: "DELETE" }),
  checkout: () => req("/api/checkout", { method: "POST", body: JSON.stringify({ method: "mock" }) }),
  orders: () => req("/api/orders"),
  order: (id: number) => req(`/api/orders/${id}`),

// External integrations
externalWeather: (params: { city?: string; lat?: number; lon?: number }) => {
  const qs = new URLSearchParams();
  if (params.city) qs.set("city", params.city);
  if (params.lat !== undefined) qs.set("lat", String(params.lat));
  if (params.lon !== undefined) qs.set("lon", String(params.lon));
  return req(`/external/weather?${qs.toString()}`);
},
externalRates: (base: string, symbols: string) => {
  const qs = new URLSearchParams();
  qs.set("base", base);
  if (symbols.trim()) qs.set("symbols", symbols);
  return req(`/external/rates?${qs.toString()}`);
},

  // Admin (CRUD x2)
  adminProducts: (q = "", categoryId: number | null = null) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId !== null) params.set("categoryId", String(categoryId));
    const qs = params.toString();
    return req(`/api/admin/products${qs ? "?" + qs : ""}`);
  },
  adminCreateProduct: (p: any) => req("/api/admin/products", { method: "POST", body: JSON.stringify(p) }),
  adminUpdateProduct: (id: number, p: any) => req(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  adminDeleteProduct: (id: number) => req(`/api/admin/products/${id}`, { method: "DELETE" }),

  adminCategories: () => req("/api/admin/categories"),
  adminCreateCategory: (c: any) => req("/api/admin/categories", { method: "POST", body: JSON.stringify(c) }),
  adminUpdateCategory: (id: number, c: any) => req(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(c) }),
  adminDeleteCategory: (id: number) => req(`/api/admin/categories/${id}`, { method: "DELETE" }),
};
