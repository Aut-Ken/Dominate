# Dominate

> 一款现代化的全栈团队项目管理平台，提供任务追踪、日历视图、数据分析和团队协作功能。

---

## 📸 功能概览

| 模块 | 说明 |
|------|------|
| **Dashboard** | 项目统计概览、Weekly Momentum 柱状图、Productivity Index 环形进度条 |
| **Projects** | 看板式（Kanban）项目管理，按 To Do / In Progress / Review / Done 分栏 |
| **My Tasks** | 个人任务列表，支持 All / Today / Upcoming 三种时间维度筛选 |
| **Calendar** | 月历视图，支持前后月份导航，高亮当天日期，点击日期快速添加任务 |
| **Reports** | 团队 vs 个人 Velocity 趋势图、任务状态分布饼图、健康指数指标 |
| **Team** | 团队成员列表，支持搜索和按部门筛选，显示在线状态和任务负载 |
| **Settings** | 个人资料编辑页面 |

---

## 🏗 技术架构

```
Dominate/
├── backend/          # Go + Gin + GORM
│   ├── cmd/
│   │   └── main.go           # 入口文件
│   └── internal/
│       ├── config/
│       │   └── db.go          # TiDB Cloud 数据库连接配置
│       ├── handlers/
│       │   ├── auth.go        # 注册 & 登录（JWT + bcrypt）
│       │   ├── project_task.go # 项目 & 任务 CRUD
│       │   └── team.go        # 团队成员查询
│       ├── models/
│       │   ├── user.go        # 用户模型（UUID 主键）
│       │   ├── project.go     # 项目模型（邀请码 + 状态管理）
│       │   ├── task.go        # 任务模型（优先级 / 状态 / 指派人）
│       │   └── team.go        # 团队成员模型（部门 / 位置 / 头像）
│       └── routes/
│           └── routes.go      # 路由定义 + CORS 中间件
│
├── frontend/         # React 19 + TypeScript + Vite 6
│   ├── App.tsx                # 应用主入口，管理全局状态和路由
│   ├── types.ts               # TypeScript 接口定义
│   ├── constants.ts           # 导航配置
│   ├── services/
│   │   └── api.ts             # RESTful API 调用封装
│   └── components/
│       ├── Login.tsx           # 登录 / 注册页面
│       ├── Header.tsx          # 顶栏（搜索、通知、头像下拉菜单）
│       ├── Sidebar.tsx         # 左侧导航栏（动态任务徽章）
│       ├── Dashboard.tsx       # 仪表盘（动态生成图表数据）
│       ├── Projects.tsx        # 项目看板（Kanban 拖拽式布局）
│       ├── MyTasks.tsx         # 个人任务（基于实时日期过滤）
│       ├── Calendar.tsx        # 日历（带月份导航 + 今日高亮）
│       ├── Reports.tsx         # 报表（Velocity + 饼图分析）
│       ├── Team.tsx            # 团队管理
│       ├── Profile.tsx         # 个人资料
│       ├── Settings.tsx        # 设置页面
│       ├── NewProjectModal.tsx # 新建项目弹窗
│       └── TaskModal.tsx       # 新建任务弹窗
│
├── go.work           # Go Workspace 配置
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
| **TailwindCSS** | — | 原子化 CSS 框架 |

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

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| `POST` | `/api/auth/register` | 注册新用户 | `{ "username", "password", "name" }` |
| `POST` | `/api/auth/login` | 用户登录 | `{ "username", "password" }` |

**登录响应示例：**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a1b2c3d4-...",
    "username": "alex",
    "roles": "user",
    "team_member": { ... }
  }
}
```

### 项目接口

| 方法 | 路径 | 说明 | 请求体 / 参数 |
|------|------|------|--------------|
| `GET` | `/api/projects` | 获取所有项目 | — |
| `POST` | `/api/projects` | 创建新项目 | `{ "name", "description" }` |

### 任务接口

| 方法 | 路径 | 说明 | 请求体 / 参数 |
|------|------|------|--------------|
| `GET` | `/api/tasks` | 获取所有任务 | `?project_id=xxx`（可选筛选） |
| `POST` | `/api/tasks` | 创建新任务 | `{ "project_id", "title", "description", "priority", "status", "assignee_id", "due_date", "type" }` |
| `PUT` | `/api/tasks/:id` | 更新任务 | `{ "status", "priority", ... }` |

### 团队接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/team` | 获取所有团队成员 |

---

## 🗃 数据模型

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `VARCHAR(36)` | UUID 主键 |
| `username` | `VARCHAR` | 唯一用户名 |
| `password_hash` | `VARCHAR` | bcrypt 加密的密码 |
| `roles` | `VARCHAR` | 角色，逗号分隔（如 `"admin,user"`） |
| `created_at` | `TIMESTAMP` | 创建时间 |

### Project（项目）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `VARCHAR(36)` | UUID 主键 |
| `name` | `VARCHAR` | 项目名称 |
| `invite_code` | `VARCHAR` | 唯一邀请码 |
| `description` | `TEXT` | 项目描述 |
| `status` | `VARCHAR` | `Active` / `On Hold` / `Completed` |
| `member_count` | `INT` | 成员数量，默认 1 |

### Task（任务）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `VARCHAR(36)` | UUID 主键 |
| `project_id` | `VARCHAR(36)` | 所属项目 ID |
| `title` | `VARCHAR` | 任务标题 |
| `description` | `TEXT` | 任务描述 |
| `priority` | `VARCHAR` | `High` / `Medium` / `Low` |
| `status` | `VARCHAR` | `To Do` / `In Progress` / `Review` / `Done` |
| `assignee_id` | `VARCHAR(36)` | 指派人的用户 ID |
| `assignee` | `VARCHAR` | 指派人姓名（冗余快照） |
| `due_date` | `DATETIME` | 截止日期 |
| `type` | `VARCHAR` | `task` / `mission` |
| `tags` | `VARCHAR` | 标签，逗号分隔 |
| `comments_count` | `INT` | 评论数量，默认 0 |

### TeamMember（团队成员）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `VARCHAR(36)` | UUID 主键 |
| `user_id` | `VARCHAR(36)` | 关联的用户 ID |
| `name` | `VARCHAR` | 姓名 |
| `role` | `VARCHAR` | 角色（如 `Lead Developer`） |
| `avatar` | `VARCHAR` | 头像 URL |
| `status` | `VARCHAR` | `Online` / `Offline` / `Away` |
| `department` | `VARCHAR` | 部门 |
| `location` | `VARCHAR` | `Remote` / `In-Office` |
| `email` | `VARCHAR` | 邮箱 |
| `bio` | `TEXT` | 个人简介 |
| `tasks_count` | `INT` | 当前任务数 |

---

## 🧩 前端组件说明

| 组件 | 文件 | 功能说明 |
|------|------|---------|
| `App` | `App.tsx` | 全局状态管理、API 数据获取、认证流程和视图路由 |
| `Login` | `Login.tsx` | 用户登录和注册表单，支持登录模式切换 |
| `Header` | `Header.tsx` | 页面标题、搜索栏、通知面板、用户头像下拉菜单 |
| `Sidebar` | `Sidebar.tsx` | 左侧导航，显示各视图入口和动态任务计数徽章 |
| `Dashboard` | `Dashboard.tsx` | 四个统计卡片 + Weekly Momentum 柱状图 + Productivity Index 环形进度，**所有数据均动态计算** |
| `Projects` | `Projects.tsx` | 看板布局，按状态分栏展示任务卡片，支持项目内新建任务 |
| `MyTasks` | `MyTasks.tsx` | 任务表格，支持 All/Today/Upcoming 三种时间维度，**从系统实时日期计算** |
| `Calendar` | `Calendar.tsx` | 月历视图，**支持前后月导航和 Today 按钮**，自动高亮当天，展示每日任务标签 |
| `Reports` | `Reports.tsx` | Velocity 趋势面积图、团队/个人状态饼图，**从真实任务数据生成** |
| `Team` | `Team.tsx` | 团队成员网格，支持搜索过滤和部门筛选，内含编辑弹窗 |
| `TaskModal` | `TaskModal.tsx` | 新建任务弹窗，支持设置标题、项目、优先级、状态、截止日期等 |
| `NewProjectModal` | `NewProjectModal.tsx` | 新建项目弹窗 |
| `Profile` | `Profile.tsx` | 个人资料展示和编辑 |
| `Settings` | `Settings.tsx` | 应用设置页面 |

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

# 预览生产构建
npm run preview

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
2. **数据库迁移**：启动后端时会自动运行 `AutoMigrate`，无需手动建表。
3. **密码安全**：用户密码使用 `bcrypt` 哈希存储，不会以明文保存。
4. **数据隔离**：所有前端视图（Dashboard / Reports / MyTasks / Calendar）均使用从后端获取的真实数据，不包含任何硬编码或 Mock 数据。

---

## 🛣 后续规划

- [ ] 为 API 接口添加 JWT 认证中间件保护
- [ ] 实现任务拖拽排序功能
- [ ] 添加 WebSocket 实时通知推送
- [ ] 支持任务评论和附件上传
- [ ] 添加项目成员权限管理
- [ ] 支持暗色模式持久化存储
- [ ] 实现任务到期提醒通知

---

## 📄 License

本项目仅供学习和个人使用。
