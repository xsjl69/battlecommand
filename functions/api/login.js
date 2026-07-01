import { signJWT, cors, json } from '../_lib/jwt';

export async function onRequestPost({ request, env }) {
  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors() });
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }

  const { username, password } = body;
  if (!username || !password) {
    return json({ error: '用户名和密码必填' }, 400);
  }

  const user = await env.DB.prepare(
    'SELECT id, role FROM user WHERE username = ? AND password = ?'
  ).bind(username, password).first();

  if (!user) {
    return json({ error: '用户名或密码错误' }, 401);
  }

  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const token = await signJWT({ id: user.id, role: user.role }, JWT_SECRET);
  return json({ token, role: user.role });
}
