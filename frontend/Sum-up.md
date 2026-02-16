这是一份为您准备的 Dominate - 高性能项目管理仪表盘 的详细技术总结。这份总结涵盖了目前前端实现的所有核心功能、逻辑流程以及数据结构，旨在帮助您与后端 AI 顺利对接。
一、 核心技术栈
前端框架: React 19 (ESM 导入模式)
样式处理: Tailwind CSS (含暗黑模式支持)
数据可视化: Recharts (用于生成趋势图、饼图、柱状图)
状态管理: React useState / useEffect (集中在 App.tsx 进行状态提升)
图标库: Material Icons Outlined
二、 数据模型 (Backend Schema 建议)
在构建后端时，您需要重点设计以下五个实体：
Project (项目):
id, name, inviteCode (6位大写字母/数字), status (Active, On Hold, Completed), memberCount.
Task / Mission (任务与备忘):
id, projectId (关联项目), title, description, priority (High, Medium, Low), status (To Do, In Progress, Review, Done).
关键字段: type ('task' | 'mission') —— Mission 是个人备忘录，仅在日历显示，不计入团队统计；Task 是正式项目任务。
assignee (分配者姓名), assigneeAvatar, dueDate (日期字符串)。
TeamMember (团队成员):
id, name, role, avatar, status (Online, Away, Offline), department, location (Remote, In-Office), email, bio.
Notification (通知):
id, title, message, time, unread (布尔值)。
Analytics (统计数据):
需要按天统计团队和个人的任务完成量，用于渲染趋势图。
三、 核心功能与实现逻辑
1. 动态导航与状态路由 (Navigation)
实现: 通过 App.tsx 中的 currentView 状态进行条件渲染，模拟 SPA 路由。
同步逻辑:
侧边栏 My Tasks 后的 Badge 数字是动态计算的（筛选 assignee === 'Alex Morgan' 且 status !== 'Done' 且 type !== 'mission' 的任务总数）。
点击通知会跳转到 My Tasks 视图。
2. 项目与看板系统 (Projects & Kanban)
项目列表: 支持点击卡片进入特定项目的看板。
看板逻辑: 任务按 status 分列。
权限控制:
只有当任务的 assignee 包含 "Alex" 时，看板上才会显示“勾选完成”按钮。
点击 Add Task 会弹出模态框，预设当前列的 status。
3. 日历与个人备忘录 (Calendar & Missions)
日历生成: 基于当前月份（模拟 2023年10月）的 31 天网格。
Add Mission (核心逻辑):
点击日历日期上的 + 号弹出 TaskModal。
强制逻辑: 此时 type 被设置为 mission，assignee 锁定为 "Alex Morgan"，且该任务不参与 Dashboard 和 Reports 的团队数据统计。
区分显示: 在日历中，mission 类型显示为紫色边框，task 类型显示为蓝色。
4. 团队管理与身份同步 (Team & Identity Sync)
成员展示: 支持按部门（Squad）筛选和名称搜索。
在线编辑: 点击成员卡片的编辑图标可更改其角色（Role）和办公地点（Location）。
个人信息同步: 在 Profile 页面修改自己的 Department 或 Base Hub 时，会通过 onUpdate 回调同步修改 Team 状态中对应的成员信息。
5. 报表与深度分析 (Reports)
数据隔离:
Team Velocity: 统计所有 type === 'task' 的完成情况。
Personal Efficiency: 仅统计 assignee === 'Alex Morgan' 的任务完成率。
Velocity Benchmarks (趋势图):
逻辑校验: 前端确保 team 曲线始终大于或等于 me 曲线（因为团队数据包含个人数据）。
状态分布图: 两个 PieChart 分别展示团队的四种状态占比和个人的 Pending/Done 占比。
6. 通知系统 (Notification System)
未读状态: Header 组件显示未读红点。
点击处理: 点击单条通知后，调用 onMarkRead 将该通知的 unread 置为 false，同时 Header 上的 "NEW" 徽章数字会实时减小。
7. 搜索系统 (Global Search)
实现: 在 Header 输入关键词按回车，逻辑会匹配视图名称（如输入 "team" 跳转到团队视图）或项目名称。
四、 后端 API 端点建议 (用于下一个 AI)
GET /api/tasks?type=task : 获取团队所有正式任务（用于看板和报表）。
GET /api/tasks?assignee=AlexMorgan : 获取当前用户所有任务。
GET /api/missions : 获取当前用户的个人备忘录（用于日历）。
POST /api/tasks : 创建任务，需区分 type 是 task 还是 mission。
PATCH /api/members/:id : 更新成员信息（同步 Profile 和 Team）。
PATCH /api/notifications/:id/read : 标记通知已读。
GET /api/analytics/velocity : 获取按天汇总的团队与个人完成量对比数据。
五、 视觉一致性说明
主题: 完全兼容 Tailwind dark class。
交互: 所有模态框均带有 backdrop-blur 和 animate-in 入场动画。
色彩:
团队/任务 = Primary (#2badee)
个人/备忘 = Purple (#8b5cf6)
成功/完成 = Emerald (#10b981)
这个总结清晰地定义了前端的运行逻辑，您的后端 AI 应该能够根据这些逻辑设计出契合的 RESTful API 或 GraphQL 模式。