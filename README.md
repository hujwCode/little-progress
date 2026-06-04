# ✨ 小进步 - 微信小程序版

> 和他/她一起，每天小进步一点点。

两个用户、七个习惯、一张积分表。把每天的小进步变成看得见的积分——攒够了就一起庆祝。

## 项目说明

这是 **小进步** 的微信小程序前端，后端是 Python FastAPI 服务，使用相同的 API。

### 核心功能

- **双人打卡** — 你和另一半各自打卡，互相激励
- **积分系统** — 每个习惯有分值，完成即得分
- **周奖励** — 每周完成率 ≥ 70% 额外奖励 30 分
- **兑换机制** — 积分够了就兑换奖励（饮品/SPA/短途旅行等）
- **动态广播** — 两个人的实时动态，看到对方在努力
- **进度日历** — 月度热力图 + 周/月完成率

## 项目结构

```
month-betterment-miniapp/
├── app.js                # 小程序入口
├── app.json              # 全局配置（含 tabBar）
├── app.wxss              # 全局样式 + 主题变量
├── theme.json            # 深色模式主题色
├── project.config.json   # 项目配置
├── sitemap.json
├── images/               # Tab 图标
├── utils/
│   ├── api.js            # API 请求封装
│   └── util.js           # 工具函数
└── pages/
    ├── index/            # 登录/选择用户
    ├── checkin/          # 打卡首页
    ├── progress/         # 进度日历
    ├── rewards/          # 积分与奖励
    ├── broadcast/        # 动态广播
    └── settings/         # 设置
```

## 部署步骤

### 1. 准备后端

首先确保 `month-betterment-server` 已部署并可访问。见原项目 `deploy.sh` 一键部署。

要求：
- 服务器已配置 HTTPS（微信小程序强制要求）
- API 端点可通过公网访问

### 2. 修改 API 地址

打开 `app.js`，将 `API_BASE` 改为你的服务器地址：

```js
globalData: {
  API_BASE: 'https://your-server.com',  // ← 改为你的域名
}
```

### 3. 配置小程序

在 `project.config.json` 中填入你的微信小程序 AppID：

```json
{
  "appid": "wx你的AppID"
}
```

### 4. 微信公众平台配置

在 [微信公众平台](https://mp.weixin.qq.com/) → 开发管理 → 服务器域名，添加：

| 类型 | 地址 |
|------|------|
| request 合法域名 | `https://你的服务器域名` |

### 5. 预览与上传

使用微信开发者工具打开本项目目录：
1. `工具` → `预览` 可在手机上体验
2. `上传` 发布到微信小程序

## 与原 Web 版差异

| 特性 | Web 版 | 小程序版 |
|------|--------|----------|
| 登录 | localStorage + 用户选择 | 相同逻辑，使用 wx 存储 |
| 打卡 | 带广播滚动条的 SPA | 带动态条的独立页面 |
| 进度 | 日历 + 周/月统计 | 同 Web 版功能 |
| 奖励 | 积分 + 奖励列表 + 历史 | 同 Web 版 + 微信弹窗确认 |
| 动态 | 帖子和自动广播 | 发送 + 列表展示 |
| 设置 | 切换用户、重置数据 | 同 Web 版 |
| 深色模式 | CSS prefers-color-scheme | 微信 darkmode 支持 |
| 兑换交互 | confirm() | wx.showModal() |

## API 接口

小程序通过 HTTP 请求与后端通信，所有接口与后端 `main.py` 定义一致：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 登录获取用户数据 |
| POST | `/api/toggle` | 切换打卡状态 |
| GET | `/api/points` | 获取积分和奖励 |
| GET | `/api/records/month` | 月度打卡记录 |
| GET | `/api/week-stats` | 周统计 |
| GET | `/api/broadcasts` | 获取动态 |
| POST | `/api/broadcasts` | 发送动态 |
| POST | `/api/rewards/claim` | 兑换奖励 |
| GET | `/api/rewards/history` | 兑换历史 |
| POST | `/api/reset-all` | 重置所有数据 |
