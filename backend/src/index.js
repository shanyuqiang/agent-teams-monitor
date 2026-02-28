import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { FileWatcher } from './services/fileWatcher.js';
import { createTeamRoutes } from './routes/teams.js';
import { createTaskRoutes } from './routes/tasks.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Get paths to watch
const homeDir = os.homedir();
const teamsPath = path.join(homeDir, '.claude', 'teams');
const tasksPath = path.join(homeDir, '.claude', 'tasks');

// Initialize file watcher
const fileWatcher = new FileWatcher(io, teamsPath, tasksPath);

// Routes
app.use('/api/teams', createTeamRoutes(fileWatcher));
app.use('/api/tasks', createTaskRoutes(fileWatcher));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    teams: fileWatcher.getTeamsCount(),
    tasks: fileWatcher.getTasksCount()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Send current state to new client
  socket.emit('teams:initial', fileWatcher.getAllTeams());
  socket.emit('tasks:initial', fileWatcher.getAllTasks());

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
  logger.info(`Server running on http://localhost:${PORT}`);

  // Start file watching
  try {
    await fileWatcher.start();
    logger.info('File watcher started successfully');
  } catch (error) {
    logger.error('Failed to start file watcher:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await fileWatcher.stop();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await fileWatcher.stop();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
