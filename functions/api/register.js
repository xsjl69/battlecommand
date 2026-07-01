import { cors, json } from '../_lib/jwt';

export async function onRequestPost({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors() });
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }

  const { username, password, role } = body;
  if (!username || !password || !role) {
    return json({ error: 'username、password、role 必填' }, 400);
  }
  if (!['executor', 'commander'].includes(role)) {
    return json({ error: 'role 只能是 executor 或 commander' }, 400);
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM user WHERE username = ?'
  ).bind(username).first();

  if (existing) {
    return json({ error: '用户名已存在' }, 409);
  }

  const result = await env.DB.prepare(
    'INSERT INTO user (username, password, role) VALUES (?, ?, ?)'
  ).bind(username, password, role).run();

  return json({ id: result.meta.last_row_id, username, role }, 201);
}
