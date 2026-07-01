// JWT（纯 Web Crypto，零依赖）

const TOKEN_EXPIRE_SEC = 86400; // 24h

function base64url(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlToBytes(b64) {
  const base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64 + padding);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

const encoder = new TextEncoder();
function utf8(str) { return encoder.encode(str); }

export async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: now, exp: now + TOKEN_EXPIRE_SEC };

  const h = base64url(JSON.stringify(header));
  const c = base64url(JSON.stringify(claims));
  const unsigned = `${h}.${c}`;

  const key = await crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, utf8(unsigned));
  const s = base64url(String.fromCharCode(...new Uint8Array(sig)));

  return `${unsigned}.${s}`;
}

export async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, c, s] = parts;
    const unsigned = `${h}.${c}`;

    const key = await crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, base64urlToBytes(s), utf8(unsigned));
    if (!ok) return null;

    const claims = JSON.parse(new TextDecoder().decode(base64urlToBytes(c)));
    if (claims.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: claims.id, role: claims.role };
  } catch {
    return null;
  }
}

// CORS 头
export function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

// 鉴权中间件 — 从 Authorization header 提取 token 并验证
export async function auth(req, secret) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyJWT(authHeader.slice(7), secret);
}
