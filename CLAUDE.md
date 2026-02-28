# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Teams Monitor is a real-time monitoring dashboard for Claude Code Agent Teams. It monitors team configurations, inbox messages, and task files in the `~/.claude/` directory and displays them in a web UI.

## Commands

```bash
# Install dependencies
npm install

# Development - runs both backend and frontend concurrently
npm run dev

# Development - individual services
npm run dev:backend   # Express server on http://localhost:3001
npm run dev:frontend  # Vite dev server on http://localhost:5173

# Production build
npm run build
npm start              # Start production server (backend only)
```

## API Endpoints

- `GET /api/teams` - List all teams with configs and inbox counts
- `GET /api/teams/:name` - Get detailed team info including inbox messages
- `GET /api/tasks` - List all tasks
- `GET /api/health` - Health check with team/task counts

## Architecture

### Backend (Node.js + Express)

- **Entry**: `backend/src/index.js` - Express server with Socket.io
- **File Watcher**: `backend/src/services/fileWatcher.js` - Monitors `~/.claude/teams/` and `~/.claude/tasks/` using Chokidar
- **Routes**:
  - `backend/src/routes/teams.js` - Team CRUD endpoints
  - `backend/src/routes/tasks.js` - Task endpoints

The backend monitors three file patterns:
- `~/.claude/teams/*/config.json` - Team configurations
- `~/.claude/teams/*/inboxes/*.json` - Inbox messages
- `~/.claude/tasks/*/*.json` - Task files

### Frontend (React + Vite + Tailwind)

- **Entry**: `frontend/src/main.jsx`
- **Routing**: Single page (Dashboard)
- **Components**: `frontend/src/components/` - Reusable UI components
- **Pages**: `frontend/src/pages/Dashboard.jsx` - Main dashboard
- **Hooks**:
  - `useSocket.js` - Socket.io connection management
  - `useTeams.js` - Team data fetching and caching
  - `useTasks.js` - Task data fetching and caching
  - `useMessages.js` - Inbox messages management
  - `useTheme.js` - Light/dark theme toggle

### Real-time Communication

Uses Socket.io for bi-directional communication:
- Server → Client events:
  - `teams:initial` - Initial team list on connect
  - `teams:update` - Team config or inbox changes
  - `tasks:initial` - Initial task list on connect
  - `task:update` - Individual task changes (add/change/remove)
  - `inbox:message` - New inbox message notification
- Client connects to `http://localhost:3001` with CORS enabled for `http://localhost:5173`

Frontend hooks (`useSocket.js`, `useTeams.js`, `useTasks.js`, `useMessages.js`) handle these events and update React state.

## Structure

This is a monorepo using npm workspaces:
- Root `package.json` orchestrates backend and frontend
- `backend/` - Express + Socket.io server (port 3001)
- `frontend/` - React + Vite + Tailwind (port 5173)
