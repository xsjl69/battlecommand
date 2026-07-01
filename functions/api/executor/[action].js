import { auth, json } from '../../_lib/jwt';

export async function onRequest({ request, env }) {
  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const payload = await auth(request, JWT_SECRET);
  if (!payload) return json({ error: '未登录或 Token 无效' }, 401);
  if (payload.role !== 'executor') return json({ error: '仅 executor 可访问' }, 403);

  return json({ message: 'executor area', user: payload });
}
