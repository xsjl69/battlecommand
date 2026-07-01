---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: c3fde22f026d7eea8b9511f8b9279ed9_0e48676e74eb11f1986d525400d9a7a1
    ReservedCode1: rsNeOzzClRHqIQcHIWeCAiAKB/3qy7OKKmV08OppICZpB2W/KiiC1FNfludD92vpHJb8dKGj6ZxrVUt8wfU7FEzWGlEXRprVHug9pclW/mbmE0lG0DYspNIPJKL90lLb4H0LYFEC54htpS4U5HRi6DWmv4WMKyHyFTrahJU2Hl5TMXXj6VU65p9ZERo=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: c3fde22f026d7eea8b9511f8b9279ed9_0e48676e74eb11f1986d525400d9a7a1
    ReservedCode2: rsNeOzzClRHqIQcHIWeCAiAKB/3qy7OKKmV08OppICZpB2W/KiiC1FNfludD92vpHJb8dKGj6ZxrVUt8wfU7FEzWGlEXRprVHug9pclW/mbmE0lG0DYspNIPJKL90lLb4H0LYFEC54htpS4U5HRi6DWmv4WMKyHyFTrahJU2Hl5TMXXj6VU65p9ZERo=
---

# BattleCommand Worker 部署指南（纯网页操作）

## 前提

已在 Cloudflare D1 创建好 `db_battlecommand` 数据库，且 `user` 表已建好。

## 部署步骤

### 第一步：创建 Worker

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单 → **Workers & Pages** → 点 **创建应用程序**
3. 选 **Hello World** 模板 → 点 **部署**
4. 部署完成后点 **编辑代码**

### 第二步：粘贴代码

1. 删除在线编辑器里 `src/index.js` 的全部内容
2. 打开本目录下的 `index.js`，全选并粘贴进去
3. 点右上角 **部署**

### 第三步：绑定 D1 数据库

1. 进入你的 Worker 详情页 → 点 **设置** 标签
2. 左侧选 **变量** → 翻到 **D1 数据库绑定** 区域
3. 点 **添加绑定**：
   - 变量名称：`DB`
   - D1 数据库：选择 `db_battlecommand`
4. 点 **部署**

### 第四步：注入 JWT 密钥

1. Worker 详情页 → **设置** → **变量** → **机密** → 点 **添加机密**
   - 名称：`JWT_SECRET`
   - 值：一串随机字符串（在线生成 https://randomkeygen.com → 选 256-bit WPA Key）
2. 点 **部署**

代码已写好 `env.JWT_SECRET` 读取，无需手动修改。

### 第五步：测试

Worker 的默认域名形如 `battlecommand-api.你的子域.workers.dev`。

```bash
# 登录
curl -X POST https://你的worker域名/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 返回示例
# {"token":"eyJ...","role":"executor"}

# 获取当前用户信息
curl https://你的worker域名/api/me \
  -H "Authorization: Bearer 上面拿到的token"
```

## API 接口

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| POST | `/api/login` | 登录，返回 token+role | 否 |
| POST | `/api/register` | 注册新用户 | 否 |
| GET | `/api/me` | 获取当前用户信息 | 是 |
| * | `/api/executor/*` | executor 专属接口（模板） | 是+executor |
| * | `/api/commander/*` | commander 专属接口（模板） | 是+commander |

## 角色说明

| 角色值 | 含义 | 登录后页面 |
|--------|------|------------|
| `executor` | 刀手 | 执行操作页面 |
| `commander` | 指挥 | 指挥管理页面 |

## 补充说明

- 密码目前是明文比对，建议后续加入 bcrypt（可用 `@tsndr/cloudflare-worker-jwt` + `bcryptjs` 等模块）
- `JWT_SECRET` 必须通过机密注入，千万不要硬编码在代码里
- CORS 目前允许 `*`，生产环境改为你前端的实际域名
*（内容由AI生成，仅供参考）*
