# Agent Teams Monitor

一个漂亮的实时监控面板，用于监控 Claude Code Agent Teams 的日志文件和活动。

![Dashboard Preview](./docs/preview.png)

## 功能特性

- **实时监控**: 通过 WebSocket 实时显示团队活动
- **团队管理**: 查看所有团队配置和成员
- **消息追踪**: 实时显示 inbox 消息和协议通知
- **任务看板**: Kanban 风格的任务状态板
- **暗黑模式**: 支持亮/暗主题切换
- **响应式设计**: 适配各种屏幕尺寸

## 技术栈

### 后端
- Node.js + Express
- Socket.io (WebSocket 实时通信)
- Chokidar (文件监控)
- CORS 支持

### 前端
- React 18 + Vite
- Tailwind CSS
- Socket.io Client
- Lucide React (图标)
- date-fns (日期格式化)

## 安装

```bash
# 克隆项目
cd agent-teams-monitor

# 安装所有依赖
npm install
```

## 使用

### 开发模式

```bash
# 同时启动前后端
npm run dev

# 或者分别启动
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:5173
```

### 生产模式

```bash
npm run build
npm start
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| /api/health | GET | 健康检查 |
| /api/teams | GET | 获取所有团队 |
| /api/teams/:name | GET | 获取团队详情 |
| /api/tasks | GET | 获取所有任务 |

## WebSocket 事件

| 事件 | 方向 | 描述 |
|------|------|------|
| `teams:initial` | Server → Client | 初始团队数据 |
| `teams:update` | Server → Client | 团队配置更新 |
| `inbox:message` | Server → Client | 新消息通知 |
| `task:update` | Server → Client | 任务状态更新 |

## 监控的文件

- `~/.claude/teams/*/config.json` - 团队配置
- `~/.claude/teams/*/inboxes/*.json` - 收件箱消息
- `~/.claude/tasks/*/*.json` - 任务文件

## Chrome DevTools 调试

使用 MCP Chrome DevTools 进行浏览器调试:

```bash
# 在 Chrome 中打开应用
open -a "Google Chrome" http://localhost:5173
```

## 项目结构

```
agent-teams-monitor/
├── backend/
│   ├── src/
│   │   ├── index.js          # 主入口
│   │   ├── services/
│   │   │   └── fileWatcher.js # 文件监控服务
│   │   ├── routes/
│   │   │   ├── teams.js      # 团队 API
│   │   │   └── tasks.js      # 任务 API
│   │   └── utils/
│   │       └── logger.js     # 日志工具
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── pages/            # 页面组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   └── utils/            # 工具函数
│   └── package.json
└── package.json
```

## 贡献

使用 Agent Teams 开发:
1. 架构 Agent - 项目规划
2. 后端 Agent - API 和文件监控
3. 前端 Agent - React UI

## License

MIT
