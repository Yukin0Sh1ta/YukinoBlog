# YukinoBlog

一个简洁优雅的个人博客系统，支持文章发布、说说动态和在线音乐播放。

## 技术栈

**前端 (Yukino)**

- Vue 3 + Vite — 现代前端框架与构建工具
- Tailwind CSS — 原子化 CSS 框架
- Pinia — 轻量级状态管理
- Vue Router — 单页应用路由
- Axios — HTTP 客户端

**后端 (Yukino-node)**

- Express — Node.js Web 框架
- MySQL2 — 关系型数据库
- CORS — 跨域资源共享

## 功能特性

- 文章发布与浏览，支持 Markdown 渲染
- 说说动态，随时随地记录想法
- 内置音乐播放器，支持播放控制
- 响应式布局，适配桌面与移动端

## 项目结构

```
YukinoBlog
├── Yukino/             # 前端项目
│   ├── src/
│   │   ├── components/ # 组件（头栏、侧栏、音乐播放器等）
│   │   ├── view/       # 页面（主页、文章列表、文章详情、说说）
│   │   ├── router/     # 路由配置
│   │   ├── stores/     # 状态管理
│   │   ├── api/        # API 封装
│   │   └── utils/      # 工具函数
│   └── package.json
└── Yukino-node/        # 后端项目
    ├── routes/         # 路由（文章、说说）
    ├── services/       # 业务逻辑
    ├── db/             # 数据库配置
    └── app.js          # 入口文件
```

## 快速开始

### 前端

```sh
cd Yukino
npm install
npm run dev
```

### 后端

```sh
cd Yukino-node
npm install
npm start
```

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vite.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Express 文档](https://expressjs.com/)
