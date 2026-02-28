# Agent Teams Monitor Frontend

A modern React dashboard for monitoring agent teams with real-time updates via Socket.io.

## Features

- **Real-time Updates**: Socket.io client for live data synchronization
- **Dark Mode Support**: Toggle between light and dark themes
- **Team Management**: View team details, members, and configuration
- **Inbox Messages**: Real-time message feed with filtering
- **Task Board**: Kanban-style task management with status columns
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18 with Vite
- Tailwind CSS for styling
- Socket.io client for real-time communication
- Lucide React for icons
- date-fns for timestamp formatting
- clsx + tailwind-merge for class name utilities

## Project Structure

```
src/
├── components/          # React components
│   ├── Layout.jsx      # Main layout with sidebar
│   ├── TeamList.jsx    # Sidebar team list
│   ├── TeamDetail.jsx  # Team configuration view
│   ├── MessageList.jsx # Real-time inbox messages
│   ├── MessageCard.jsx # Individual message display
│   ├── TaskBoard.jsx   # Tasks kanban board
│   └── StatusIndicator.jsx # Connection status
├── hooks/              # Custom React hooks
│   ├── useTheme.js     # Dark/light mode management
│   ├── useSocket.js    # Socket.io connection
│   ├── useTeams.js     # Teams data management
│   ├── useMessages.js  # Messages data management
│   └── useTasks.js     # Tasks data management
├── pages/              # Page components
│   └── Dashboard.jsx   # Main dashboard page
├── utils/              # Utility functions
│   └── cn.js           # Class name merging
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on localhost:3000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
npm run build
```

## Configuration

### Backend Connection

The frontend connects to the backend at `http://localhost:3000` by default. This can be changed in `src/hooks/useSocket.js` or via environment variables.

### Socket.io Events

The frontend listens for the following events:

**Teams:**
- `teams:list` - Initial teams list
- `team:update` - Team data update
- `team:remove` - Team removed

**Messages:**
- `messages:list` - Messages list for selected team
- `message:new` - New message received

**Tasks:**
- `tasks:list` - Tasks list for selected team
- `task:update` - Task data update
- `task:remove` - Task removed

## Customization

### Theme Colors

Theme colors are defined in `tailwind.config.js` and `src/index.css`. The primary color scheme uses blue tones by default.

### Task Status Columns

Task board columns are defined in `src/components/TaskBoard.jsx`:
- `pending` - To Do
- `in_progress` - In Progress
- `review` - Review
- `done` - Done
