import { auth, json } from '../../_lib/jwt';

export async function onRequestGet({ request, env }) {
  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const payload = await auth(request, JWT_SECRET);
  if (!payload) return json({ error: '未登录或 Token 无效' }, 401);

  const userId = payload.id;
  const db = env.DB;

  const msg = await db.prepare(`
    SELECT cm.id, cm.sender_id, cm.content, cm.created_at,
           u.username AS sender_name
    FROM chat_message cm
    JOIN user u ON cm.sender_id = u.id
    WHERE cm.receiver_id = ? AND cm.is_pinned = 1
    ORDER BY cm.created_at DESC
    LIMIT 1
  `).bind(userId).first();

  return json(msg || null);
}
