---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: c3fde22f026d7eea8b9511f8b9279ed9_e22872de74f511f1aabe5254007bceed
    ReservedCode1: hLdrlJdPtPHmDzYfjXodPFyE2goFm2Y1SJ2w57PZlHO1KvkkjqP6NyFC5bOwSM0QpE7AZQ+Gf4o35WbaNBWVXEp+PvYK1Oz0U4zOmo7RIL/9XacrPDeKJbAoX13BODVAmO37M/9ckiGWi7QkeAYKOR8n1EvblYwKp/EzYIno1cIv0Omi225UfsZoAMU=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: c3fde22f026d7eea8b9511f8b9279ed9_e22872de74f511f1aabe5254007bceed
    ReservedCode2: hLdrlJdPtPHmDzYfjXodPFyE2goFm2Y1SJ2w57PZlHO1KvkkjqP6NyFC5bOwSM0QpE7AZQ+Gf4o35WbaNBWVXEp+PvYK1Oz0U4zOmo7RIL/9XacrPDeKJbAoX13BODVAmO37M/9ckiGWi7QkeAYKOR8n1EvblYwKp/EzYIno1cIv0Omi225UfsZoAMU=
---

# BattleCommand — Cloudflare Pages 全栈项目

基于 Cloudflare Pages + D1 的角色认证系统。前端登录/注册页面，后端 JWT 鉴权 API，支持日间/夜间/护眼三模式主题。

## 部署（3 步）

### 1. 代码同步
项目已关联 GitHub，`push` 后 Cloudflare Pages 自动构建部署，无需手动操作。

### 2. 配置 D1 数据库绑定
Pages 项目 → **设置** → **绑定** → 添加 D1：
- 变量名：`DB`
- 数据库：`db_battlecommand`

### 3. 配置 JWT 密钥
Pages 项目 → **设置** → **环境变量** → 添加：
- 名称：`JWT_SECRET`
- 值：随机字符串（https://randomkeygen.com → 256-bit WPA Key）
- 勾选 **加密**

## API 接口

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| POST | `/api/login` | 登录，返回 token + role | 否 |
| POST | `/api/register` | 注册（固定 executor 刀手） | 否 |
| GET | `/api/me` | 获取当前用户信息 | 是 |
| * | `/api/executor/*` | 刀手专属 | 是 + executor |
| * | `/api/commander/*` | 指挥专属 | 是 + commander |

## 角色

| 值 | 含义 |
|----|------|
| `executor` | 刀手 |
| `commander` | 指挥 |
*（内容由AI生成，仅供参考）*
