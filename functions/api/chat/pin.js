import { auth, json } from '../../_lib/jwt';

export async function onRequestPost({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }

  const JWT_SECRET = env.JWT_SECRET || 'fallback-dev';
  const payload = await auth(request, JWT_SECRET);
  if (!payload) return json({ error: '未登录或 Token 无效' }, 401);
  if (payload.role !== 'commander') return json({ error: '仅指挥官可发送置顶消息' }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }

  const { content } = body;
  if (!content || !content.trim()) return json({ error: '消息内容不能为空' }, 400);

  const senderId = payload.id;
  const db = env.DB;

  // Get all executors as receivers
  const receivers = await db.prepare("SELECT id FROM user WHERE role = 'executor'").all();
  if (!receivers.results.length) {
    return json({ error: '没有可接收消息的刀手' }, 400);
  }

  const receiverIds = receivers.results.map(r => r.id);

  // Clear old pinned messages for each receiver
  if (receiverIds.length === 1) {
    await db.prepare('UPDATE chat_message SET is_pinned = 0 WHERE receiver_id = ? AND is_pinned = 1')
      .bind(receiverIds[0]).run();
  } else {
    const placeholders = receiverIds.map(() => '?').join(',');
    await db.prepare(`UPDATE chat_message SET is_pinned = 0 WHERE receiver_id IN (${placeholders}) AND is_pinned = 1`)
      .bind(...receiverIds).run();
  }

  // Insert new pinned message for each receiver
  const stmt = db.prepare(
    'INSERT INTO chat_message (sender_id, receiver_id, content, is_pinned, created_at) VALUES (?, ?, ?, 1, ?)'
  );

  const now = Math.floor(Date.now() / 1000);
  const batch = receiverIds.map(id => stmt.bind(senderId, id, content.trim(), now));
  await db.batch(batch);

  return json({ success: true, count: receiverIds.length });
}
