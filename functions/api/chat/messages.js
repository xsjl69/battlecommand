import { auth, json } from '../../_lib/jwt';

export async function onRequestGet({ request, env }) {
  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const payload = await auth(request, JWT_SECRET);
  if (!payload) return json({ error: '未登录或 Token 无效' }, 401);

  const userId = payload.id;
  const db = env.DB;

  const messages = await db.prepare(`
    SELECT cm.id, cm.sender_id, cm.receiver_id, cm.content,
           cm.is_read, cm.is_pinned, cm.created_at,
           u.username AS sender_name
    FROM chat_message cm
    JOIN user u ON cm.sender_id = u.id
    WHERE cm.receiver_id = ? OR cm.sender_id = ?
    ORDER BY cm.created_at ASC
    LIMIT 200
  `).bind(userId, userId).all();

  return json(messages.results);
}
