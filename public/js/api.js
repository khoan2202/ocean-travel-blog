// Mọi request tới /api đều đi qua đây để xử lý lỗi ở một chỗ.
// Ví dụ: api('posts?category=beach'), api('likes', { method: 'POST', body: {...} })
export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({})); // server có thể trả về body rỗng
  if (!res.ok) throw new Error(data.error || `Lỗi kết nối (${res.status})`);
  return data;
}
