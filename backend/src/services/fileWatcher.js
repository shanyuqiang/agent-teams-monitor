import chokidar from 'chokidar';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

const DEBOUNCE_MS = 300;

/**
 * FileWatcher service monitors team configs, inbox messages, and task files
 * and broadcasts changes via Socket.io
 */
export class FileWatcher {
  constructor(io, teamsPath, tasksPath) {
    this.io = io;
    this.teamsPath = teamsPath;
    this.tasksPath = tasksPath;
    this.watchers = [];

    // In-memory cache
    this.teams = new Map(); // teamName -> { config, inbox: [] }
    this.tasks = new Map(); // taskId -> taskData

    // Debounced broadcast functions
    this.debouncedBroadcastTeams = this.debounce(this.broadcastTeamsUpdate.bind(this), DEBOUNCE_MS);
    this.debouncedBroadcastInbox = this.debounce(this.broadcastInboxUpdate.bind(this), DEBOUNCE_MS);
    this.debouncedBroadcastTasks = this.debounce(this.broadcastTasksUpdate.bind(this), DEBOUNCE_MS);
  }

  /**
   * Simple debounce implementation
   */
  debounce(fn, ms) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), ms);
    };
  }

  /**
   * Start watching all directories
   */
  async start() {
    logger.info('Starting file watchers...');

    // Watch team configs: ~/.claude/teams/*/config.json
    const teamConfigWatcher = chokidar.watch(
      path.join(this.teamsPath, '*', 'config.json'),
      {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      }
    );

    teamConfigWatcher
      .on('add', (filePath) => this.handleTeamConfigChange(filePath, 'add'))
      .on('change', (filePath) => this.handleTeamConfigChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleTeamConfigRemove(filePath))
      .on('error', (error) => logger.error('Team config watcher error:', error));

    this.watchers.push(teamConfigWatcher);

    // Watch inbox messages: ~/.claude/teams/*/inboxes/*.json
    const inboxWatcher = chokidar.watch(
      path.join(this.teamsPath, '*', 'inboxes', '*.json'),
      {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      }
    );

    inboxWatcher
      .on('add', (filePath) => this.handleInboxChange(filePath, 'add'))
      .on('change', (filePath) => this.handleInboxChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleInboxRemove(filePath))
      .on('error', (error) => logger.error('Inbox watcher error:', error));

    this.watchers.push(inboxWatcher);

    // Watch task files: ~/.claude/tasks/*/*.json
    const taskWatcher = chokidar.watch(
      path.join(this.tasksPath, '*', '*.json'),
      {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      }
    );

    taskWatcher
      .on('add', (filePath) => this.handleTaskChange(filePath, 'add'))
      .on('change', (filePath) => this.handleTaskChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleTaskRemove(filePath))
      .on('error', (error) => logger.error('Task watcher error:', error));

    this.watchers.push(taskWatcher);

    logger.info('All file watchers initialized');
  }

  /**
   * Stop all watchers
   */
  async stop() {
    logger.info('Stopping file watchers...');
    for (const watcher of this.watchers) {
      await watcher.close();
    }
    this.watchers = [];
    logger.info('File watchers stopped');
  }

  /**
   * Handle team config file changes
   */
  async handleTeamConfigChange(filePath, eventType) {
    try {
      const teamName = this.extractTeamName(filePath);
      if (!teamName) return;

      const content = await fs.readFile(filePath, 'utf-8');
      const config = JSON.parse(content);

      // Update cache
      if (!this.teams.has(teamName)) {
        this.teams.set(teamName, { config: null, inbox: [] });
      }
      this.teams.get(teamName).config = config;

      logger.debug(`Team config ${eventType}: ${teamName}`);
      this.debouncedBroadcastTeams();
    } catch (error) {
      logger.error(`Error handling team config change for ${filePath}:`, error);
    }
  }

  /**
   * Handle team config file removal
   */
  handleTeamConfigRemove(filePath) {
    const teamName = this.extractTeamName(filePath);
    if (!teamName) return;

    this.teams.delete(teamName);
    logger.debug(`Team config removed: ${teamName}`);
    this.debouncedBroadcastTeams();
  }

  /**
   * Handle inbox message changes
   */
  async handleInboxChange(filePath, eventType) {
    try {
      logger.info(`Inbox ${eventType}: ${filePath}`);
      const teamName = this.extractTeamNameFromInbox(filePath);
      logger.info(`Extracted team name: ${teamName}`);
      if (!teamName) return;

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      logger.info(`Parsed data type: ${Array.isArray(data) ? 'array' : 'object'}, length: ${Array.isArray(data) ? data.length : 1}`);

      // Handle both array format (message list) and object format (single message)
      const messages = Array.isArray(data) ? data : [data];

      // Add file info to each message
      const fileName = path.basename(filePath, '.json');
      const processedMessages = messages.map((msg, index) => ({
        ...msg,
        _fileId: `${fileName}_${index}`,
        _sourceFile: filePath
      }));

      // Update cache
      if (!this.teams.has(teamName)) {
        this.teams.set(teamName, { config: null, inbox: [] });
      }
      const team = this.teams.get(teamName);

      // Replace all messages from this file
      team.inbox = team.inbox.filter(m => m._sourceFile !== filePath);
      team.inbox.push(...processedMessages);

      // Sort by timestamp
      team.inbox.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0);
        const timeB = new Date(b.timestamp || 0);
        return timeA - timeB;
      });

      logger.info(`Inbox updated: ${teamName} now has ${team.inbox.length} total messages`);

      // Broadcast each new message
      processedMessages.forEach(msg => {
        this.debouncedBroadcastInbox(teamName, msg, eventType);
      });

      // Broadcast updated teams list
      this.debouncedBroadcastTeams();
    } catch (error) {
      logger.error(`Error handling inbox change for ${filePath}:`, error);
    }
  }

  /**
   * Handle inbox message removal
   */
  handleInboxRemove(filePath) {
    const teamName = this.extractTeamNameFromInbox(filePath);
    if (!teamName) return;

    const messageId = path.basename(filePath, '.json');
    const team = this.teams.get(teamName);
    if (team) {
      team.inbox = team.inbox.filter(m => m.id !== messageId);
      logger.debug(`Inbox message removed: ${teamName}/${messageId}`);
      this.debouncedBroadcastInbox(teamName, { id: messageId }, 'remove');
    }
  }

  /**
   * Handle task file changes
   */
  async handleTaskChange(filePath, eventType) {
    try {
      const taskId = this.extractTaskId(filePath);
      if (!taskId) return;

      const content = await fs.readFile(filePath, 'utf-8');
      const task = JSON.parse(content);

      // Extract team from path
      const relativePath = path.relative(this.tasksPath, filePath);
      const teamName = relativePath.split(path.sep)[0];

      const taskData = {
        id: taskId,
        team: teamName,
        ...task,
        _updatedAt: new Date().toISOString()
      };

      this.tasks.set(taskId, taskData);

      logger.debug(`Task ${eventType}: ${taskId}`);
      this.debouncedBroadcastTasks(taskData, eventType);
    } catch (error) {
      logger.error(`Error handling task change for ${filePath}:`, error);
    }
  }

  /**
   * Handle task file removal
   */
  handleTaskRemove(filePath) {
    const taskId = this.extractTaskId(filePath);
    if (!taskId) return;

    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.delete(taskId);
      logger.debug(`Task removed: ${taskId}`);
      this.debouncedBroadcastTasks({ id: taskId, ...task }, 'remove');
    }
  }

  /**
   * Extract team name from config file path
   */
  extractTeamName(filePath) {
    const relativePath = path.relative(this.teamsPath, filePath);
    const parts = relativePath.split(path.sep);
    return parts[0] || null;
  }

  /**
   * Extract team name from inbox file path
   */
  extractTeamNameFromInbox(filePath) {
    const relativePath = path.relative(this.teamsPath, filePath);
    const parts = relativePath.split(path.sep);
    return parts[0] || null;
  }

  /**
   * Extract task ID from task file path
   */
  extractTaskId(filePath) {
    return path.basename(filePath, '.json');
  }

  /**
   * Broadcast teams update to all clients
   */
  broadcastTeamsUpdate() {
    const teamsList = this.getAllTeams();
    this.io.emit('teams:update', teamsList);
    logger.debug('Broadcasted teams update');
  }

  /**
   * Broadcast inbox update to all clients
   */
  broadcastInboxUpdate(teamName, message, eventType) {
    this.io.emit('inbox:message', {
      team: teamName,
      message,
      event: eventType
    });
    logger.debug(`Broadcasted inbox update for ${teamName}`);
  }

  /**
   * Broadcast task update to all clients
   */
  broadcastTasksUpdate(task, eventType) {
    this.io.emit('task:update', {
      task,
      event: eventType
    });
    logger.debug(`Broadcasted task update for ${task.id}`);
  }

  /**
   * Get all teams with their configs and inbox messages
   */
  getAllTeams() {
    const result = [];
    for (const [name, data] of this.teams) {
      result.push({
        id: name,
        name,
        config: data.config,
        inbox: data.inbox
      });
    }
    return result;
  }

  /**
   * Get a specific team by name
   */
  getTeam(name) {
    const data = this.teams.get(name);
    if (!data) return null;
    return {
      id: name,
      name,
      config: data.config,
      inbox: data.inbox
    };
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks for a specific team
   */
  getTasksByTeam(teamName) {
    return Array.from(this.tasks.values()).filter(task => task.team === teamName);
  }

  /**
   * Get count of teams
   */
  getTeamsCount() {
    return this.teams.size;
  }

  /**
   * Get count of tasks
   */
  getTasksCount() {
    return this.tasks.size;
  }
}
