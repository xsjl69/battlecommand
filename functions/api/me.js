import { auth, json } from '../_lib/jwt';

export async function onRequest({ request, env }) {
  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const payload = await auth(request, JWT_SECRET);
  if (!payload) return json({ error: '未登录或 Token 无效' }, 401);

  const user = await env.DB.prepare(
    'SELECT id, username, role, created_at FROM user WHERE id = ?'
  ).bind(payload.id).first();

  if (!user) return json({ error: '用户不存在' }, 404);
  return json(user);
}
