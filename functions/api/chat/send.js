import { auth, json } from '../../_lib/jwt';

export async function onRequestPost({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }

  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const payload = await auth(request, JWT_SECRET);
  if (!payload) return json({ error: '未登录或 Token 无效' }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }

  const { content } = body;
  if (!content || !content.trim()) return json({ error: '消息内容不能为空' }, 400);

  const senderId = payload.id;
  const senderRole = payload.role;
  const db = env.DB;

  // Determine receivers
  let receivers;
  if (senderRole === 'commander') {
    receivers = await db.prepare("SELECT id FROM user WHERE role = 'executor'").all();
  } else {
    receivers = await db.prepare("SELECT id FROM user WHERE role = 'commander' LIMIT 1").all();
  }

  if (!receivers.results.length) {
    return json({ error: '没有可接收消息的用户' }, 400);
  }

  const stmt = db.prepare(
    'INSERT INTO chat_message (sender_id, receiver_id, content, is_pinned, created_at) VALUES (?, ?, ?, 0, ?)'
  );

  const now = Math.floor(Date.now() / 1000);
  const batch = receivers.results.map(r => stmt.bind(senderId, r.id, content.trim(), now));
  await db.batch(batch);

  return json({ success: true, count: receivers.results.length });
}
