const BASE = '/api';
function getToken() { return localStorage.getItem('token'); }
function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}
async function request(path, options = {}) {
  const res = await fetch(BASE + path, { ...options, headers: headers(options.headers) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}
export const api = {
  getProducts: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/products${q ? '?' + q : ''}`); },
  getProduct: (slug) => request(`/products/${slug}`),
  getCategories: () => request('/categories'),
  register: (data) => request('/auth?action=register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth?action=login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth?action=me'),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request('/orders'),
};
