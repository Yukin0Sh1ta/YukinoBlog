# YukinoBlog

个人博客系统，包含前端展示与后端 API 服务。

## 项目结构

```
YukinoBlog/
├── Yukino/          # 前端 - Vue 3 + Vite + Tailwind CSS
└── Yukino-node/     # 后端 - Express + TypeScript + MySQL
```

## 技术栈

### 前端 (Yukino)

| 技术 | 说明 |
|------|------|
| Vue 3 | `<script setup>` 组合式 API |
| Vite | 构建与开发服务器 |
| Tailwind CSS 4 | 原子化样式 |
| Pinia | 状态管理 |
| Vue Router | 路由（Hash 模式）|
| Axios | HTTP 请求 |

### 后端 (Yukino-node)

| 技术 | 说明 |
|------|------|
| Express | Web 框架 |
| TypeScript | 类型安全 |
| MySQL2 | 数据库驱动（连接池）|
| svg-captcha | 图形验证码 |
| express-rate-limit | 接口限流 |

## 功能

- **个人主页** — 名片展示与 GitHub 链接
- **文章系统** — 文章列表、分类标题、正文详情
- **留言板** — 带图形验证码与频率限制的留言功能
- **音乐播放器** — 网易云音乐外链代理播放

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL

### 后端

```bash
cd Yukino-node
npm install
```

创建 `.env` 文件（参考 `.env.example`）：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=data
```

启动开发服务器：

```bash
npm run dev
```

后端运行在 `http://localhost:3000`。

### 前端

```bash
cd Yukino
npm install
npm run dev
```

前端运行在 Vite 默认端口（`http://localhost:5173`）。

### API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/articles` | 文章列表 |
| GET | `/api/articles/titles/:articleId` | 文章标题 |
| GET | `/api/talk` | 留言列表 |
| GET | `/api/talk/captcha` | 获取验证码 |
| POST | `/api/talk` | 发布留言 |
| GET | `/api/music/url/:id` | 音乐代理 |

## License

MIT
