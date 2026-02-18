# Dominate

> 一款现代化的全栈团队项目管理平台，提供任务追踪、看板管理、甘特图、Sprint 迭代、实时通讯、Wiki 知识库、数据可视化和多主题系统。

---

## 📸 功能概览

| 模块 | 说明 |
|------|------|
| **Dashboard** | 项目统计概览、Weekly Momentum 柱状图、Productivity Index 环形进度条 |
| **Projects** | 看板式（Kanban）项目管理，按 To Do / In Progress / Review / Done 分栏 |
| **My Tasks** | 个人任务列表，支持 All / Today / Upcoming 三种时间维度筛选 |
| **Sprints** | Sprint 迭代管理，支持创建/激活 Sprint、燃尽图进度追踪 |
| **Gantt** | 甘特图视图，任务时间线、进度条、今日标记、周末阴影、依赖关系可视化 |
| **Team** | 团队成员列表，支持搜索和按部门筛选，显示在线状态和任务负载 |
| **Chat** | 实时团队通讯，支持文字消息和文件上传 |
| **Wiki** | 项目知识库，按项目组织的文档系统 |
| **Calendar** | 月历视图，支持前后月份导航，高亮当天日期，点击日期快速添加任务 |
| **Reports** | 团队 vs 个人 Velocity 趋势图、任务状态分布饼图、健康指数指标 |
| **Activity** | 全局活动流，实时展示团队操作历史（创建/更新/删除/评论等） |
| **Settings** | 主题切换、6 套配色方案选择、密码修改、语言设置、数据导出（CSV/JSON） |
| **AI Assistant** | 集成 AI 对话面板，提供智能辅助功能 |
| **Notifications** | 通知面板，支持按类型高亮、标记已读/全部已读 |

---

## 🏗 技术架构

```
Dominate/
├── backend/               # Go + Gin + GORM + WebSocket
│   ├── cmd/
│   │   └── main.go                # 入口文件 + AutoMigrate
│   └── internal/
│       ├── config/
│       │   └── db.go              # TiDB Cloud 数据库连接配置
│       ├── handlers/
│       │   ├── auth.go            # 注册 & 登录（JWT + bcrypt）
│       │   ├── project_task.go    # 项目 & 任务 CRUD + WebSocket 广播
│       │   ├── team.go            # 团队成员查询 + 头像更新
│       │   ├── chat.go            # 聊天消息 & 文件上传 + WebSocket 广播
│       │   ├── features.go        # 活动日志 / 附件 / 模板 / 标签 / 通知 /
│       │   │                      # 依赖 / RBAC / 甘特图 / 统计 / 导出 /
│       │   │                      # 搜索 / 评论 / 密码 / 邀请加入
│       │   └── devtools.go        # 开发工具 & Sprint & Wiki & Webhook
│       ├── models/
│       │   ├── user.go            # 用户模型
│       │   ├── project.go         # 项目模型
│       │   ├── task.go            # 任务模型
│       │   ├── team.go            # 团队成员模型
│       │   ├── comment.go         # 评论模型
│       │   ├── message.go         # 聊天消息模型
│       │   ├── features.go        # 活动日志 / 附件 / 模板 / 标签 /
│       │   │                      # 通知 / 依赖 / 角色
│       │   └── devtools.go        # Sprint / WikiPage / Webhook / TimeLog
│       ├── routes/
│       │   └── routes.go          # 路由定义 + CORS 中间件（45+ 路由）
│       └── ws/
│           └── hub.go             # WebSocket Hub（广播 / 定向推送 / 心跳）
│
├── frontend/              # React 19 + TypeScript + Vite 6
│   ├── App.tsx                    # 全局状态管理和视图路由（13 个视图）
│   ├── index.tsx                  # 应用入口 + 主题初始化
│   ├── types.ts                   # TypeScript 接口定义（13 个 View 枚举）
│   ├── constants.ts               # 导航配置（12 个入口）
│   ├── services/
│   │   └── api.ts                 # RESTful API 封装（60+ 方法）
│   ├── hooks/
│   │   └── useWebSocket.ts        # WebSocket Hook（自动重连 + 事件监听）
│   ├── public/
│   │   └── index.css              # 主题系统 CSS（6 套配色方案）
│   └── components/                # 21 个组件
│       ├── Login.tsx              # 登录 / 注册
│       ├── Header.tsx             # 顶栏（搜索、通知、用户菜单）
│       ├── Sidebar.tsx            # 左侧导航栏
│       ├── Dashboard.tsx          # 仪表盘（统计卡片 + 图表）
│       ├── Projects.tsx           # 项目看板（Kanban 布局）
│       ├── MyTasks.tsx            # 个人任务
│       ├── Sprints.tsx            # Sprint 迭代管理
│       ├── GanttChart.tsx         # 甘特图（时间线 + 进度 + 依赖）
│       ├── Calendar.tsx           # 日历视图
│       ├── Reports.tsx            # 报表分析
│       ├── Team.tsx               # 团队管理
│       ├── Chat.tsx               # 团队通讯
│       ├── Wiki.tsx               # 知识库
│       ├── ActivityFeed.tsx       # 活动流
│       ├── NotificationPanel.tsx  # 通知面板
│       ├── AIChatPanel.tsx        # AI 助手
│       ├── Profile.tsx            # 个人资料
│       ├── Settings.tsx           # 设置（主题 + 导出 + 密码）
│       ├── TaskDetailModal.tsx    # 任务详情弹窗
│       ├── TaskModal.tsx          # 新建任务弹窗
│       └── NewProjectModal.tsx    # 新建项目弹窗
│
├── go.work                # Go Workspace 配置
└── README.md
```

---

## ⚙️ 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| **Go** | 1.25+ | 后端编程语言 |
| **Gin** | 1.11 | 高性能 HTTP 框架 |
| **GORM** | 1.31 | Go ORM 框架 |
| **gorilla/websocket** | 1.5 | WebSocket 实时通信 |
| **MySQL (TiDB Cloud)** | — | 云数据库服务，兼容 MySQL 协议 |
| **JWT** | v5 | 用户认证令牌 (`golang-jwt/jwt`) |
| **bcrypt** | — | 密码哈希加密 (`golang.org/x/crypto`) |
| **UUID** | — | 全局唯一 ID 生成 (`google/uuid`) |

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| **React** | 19.2 | UI 框架 |
| **TypeScript** | 5.8 | 类型安全的 JavaScript |
| **Vite** | 6.2 | 下一代构建工具，支持 HMR 热更新 |
| **Recharts** | 3.7 | 基于 React 的图表库（柱状图 / 面积图 / 饼图） |
| **TailwindCSS** | CDN | 原子化 CSS 框架 + CSS 变量主题系统 |

---

## 🚀 快速开始

### 前置要求

- **Go** 1.25 或更高版本
- **Node.js** 18 或更高版本（推荐 20+）
- **npm** 或 **pnpm**
- 可用的 MySQL 数据库（默认使用 TiDB Cloud）

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd Dominate
```

### 2. 启动后端

```bash
cd backend
go mod tidy
go run cmd/main.go
```

后端默认运行在 `http://localhost:8080`。

> **⚠️ 数据库配置**：数据库连接字符串位于 `backend/internal/config/db.go` 中的 `dsn` 变量。如需连接自有 MySQL 实例，请修改该配置。数据库表会通过 GORM 的 `AutoMigrate` 自动创建。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:3000`。

### 4. 访问应用

打开浏览器访问 `http://localhost:3000`，即可看到登录页面。注册新用户后登录即可使用。

---

## 📡 API 接口文档

后端 API 基础路径：`http://localhost:8080/api`

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/auth/register` | 注册新用户 |
| `POST` | `/api/auth/login` | 用户登录 |

### 项目 & 任务接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/projects` | 获取所有项目 |
| `POST` | `/api/projects` | 创建新项目 |
| `GET` | `/api/tasks` | 获取任务列表（`?project_id=xxx`） |
| `POST` | `/api/tasks` | 创建新任务 |
| `PUT` | `/api/tasks/:id` | 更新任务 |
| `DELETE` | `/api/tasks/:id` | 删除任务 |
| `POST` | `/api/join-project` | 通过邀请码加入项目 |

### 团队 & 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/team` | 获取团队成员列表 |
| `PUT` | `/api/team/:id/avatar` | 更新用户头像 |
| `POST` | `/api/change-password` | 修改密码 |

### 聊天接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/messages` | 获取聊天记录 |
| `POST` | `/api/messages` | 发送消息 |
| `POST` | `/api/upload` | 上传文件 |

### 活动日志 & 评论

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/activity-logs` | 获取活动日志 |
| `POST` | `/api/activity-logs` | 记录活动 |
| `GET` | `/api/comments` | 获取评论 |
| `POST` | `/api/comments` | 添加评论 |

### 附件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/attachments` | 上传附件 |
| `GET` | `/api/attachments` | 获取附件列表 |
| `GET` | `/api/attachments/:id/download` | 下载附件 |
| `DELETE` | `/api/attachments/:id` | 删除附件 |

### 标签 & 模板

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/tags` | 获取标签列表 |
| `POST` | `/api/tags` | 创建标签 |
| `PUT` | `/api/tags/:id` | 更新标签 |
| `DELETE` | `/api/tags/:id` | 删除标签 |
| `GET` | `/api/task-templates` | 获取任务模板 |
| `POST` | `/api/task-templates` | 创建任务模板 |
| `DELETE` | `/api/task-templates/:id` | 删除任务模板 |

### 通知系统

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/notifications` | 获取通知列表 |
| `PUT` | `/api/notifications/:id/read` | 标记已读 |
| `PUT` | `/api/notifications/read-all` | 标记全部已读 |
| `GET` | `/api/notifications/unread-count` | 获取未读计数 |

### 任务依赖 & RBAC

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/dependencies` | 获取依赖关系 |
| `POST` | `/api/dependencies` | 添加依赖 |
| `DELETE` | `/api/dependencies/:id` | 删除依赖 |
| `GET` | `/api/roles` | 获取项目角色 |
| `POST` | `/api/roles` | 设置项目角色 |
| `DELETE` | `/api/roles/:id` | 删除角色 |

### 甘特图 & 统计 & 导出

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/gantt` | 获取甘特图数据 |
| `GET` | `/api/stats/dashboard` | 获取仪表盘统计 |
| `GET` | `/api/export/csv` | 导出任务为 CSV |
| `GET` | `/api/export/json` | 导出任务为 JSON |
| `GET` | `/api/search` | 全局搜索（任务/项目/Wiki） |

### WebSocket

| 路径 | 说明 |
|------|------|
| `ws://localhost:8080/ws?user_id=xxx` | WebSocket 实时连接 |
| `GET /api/online` | 获取在线用户数 |

**WebSocket 事件类型：**
- `task_created` / `task_updated` / `task_deleted` — 任务变更实时推送
- `chat_message` — 新聊天消息
- `notification` — 新通知
- `activity_log` — 新活动日志

---

## 🎨 主题系统

支持 **6 套配色方案**，通过 CSS 自定义属性实现动态主题切换：

| 主题 | 主色 | 风格 |
|------|------|------|
| 🌊 **Ocean** (默认) | `#2badee` | 清爽蓝色 |
| 💜 **Violet** | `#8b5cf6` | 优雅紫色 |
| 🌿 **Emerald** | `#10b981` | 自然绿色 |
| 🌹 **Rose** | `#f43f5e` | 热情玫红 |
| 🌟 **Amber** | `#f59e0b` | 温暖琥珀 |
| 🪨 **Slate** | `#64748b` | 极简灰色 |

主题选择在 **Settings → Color Scheme** 中切换，通过 `localStorage` 持久化保存。

---

## 🔧 开发命令

### 后端

```bash
# 安装依赖
cd backend && go mod tidy

# 启动开发服务器
go run cmd/main.go

# 构建生产版本
go build -o dominate-server cmd/main.go
```

### 前端

```bash
# 安装依赖
cd frontend && npm install

# 启动开发服务器（端口 3000，支持 HMR）
npm run dev

# 生产构建
npm run build

# TypeScript 类型检查
npx tsc --noEmit
```

---

## 📁 环境配置

### 数据库配置

数据库连接信息位于 `backend/internal/config/db.go`：

```go
dsn := "用户名:密码@tcp(主机:端口)/Dominate?charset=utf8mb4&parseTime=True&loc=Local&tls=true"
```

> 当前默认连接 TiDB Cloud 的 Serverless 实例。要切换到本地 MySQL，将 `tls=true` 改为 `tls=false` 并修改连接地址。

### 前端 API 地址

API 基础地址配置位于 `frontend/services/api.ts`：

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

如需部署到其他环境，修改此变量指向实际后端地址。

---

## 📌 注意事项

1. **CORS**：后端已配置允许所有来源（`Access-Control-Allow-Origin: *`），生产环境应限制为具体域名。
2. **数据库迁移**：启动后端时会自动运行 `AutoMigrate`（15 个模型），无需手动建表。
3. **密码安全**：用户密码使用 `bcrypt` 哈希存储，不会以明文保存。
4. **数据隔离**：所有前端视图均使用从后端获取的真实数据，不包含任何硬编码或 Mock 数据。
5. **WebSocket**：支持自动重连机制（3 秒间隔），ping/pong 心跳保活（30 秒间隔）。
6. **导出兼容性**：CSV 导出包含 UTF-8 BOM，确保 Excel 正确显示中文。

---

## 📄 License

本项目仅供学习和个人使用。
