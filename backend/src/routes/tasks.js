import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Create task routes with fileWatcher dependency
 */
export function createTaskRoutes(fileWatcher) {
  const router = Router();

  /**
   * GET /api/tasks
   * List all tasks across all teams
   * Supports filtering by team via query param: ?team=teamName
   */
  router.get('/', (req, res) => {
    try {
      const { team } = req.query;
      let tasks;

      if (team) {
        tasks = fileWatcher.getTasksByTeam(team);
      } else {
        tasks = fileWatcher.getAllTasks();
      }

      // Sort by updated time (newest first)
      const sortedTasks = tasks.sort((a, b) => {
        const timeA = a._updatedAt || a.updatedAt || a.createdAt || 0;
        const timeB = b._updatedAt || b.updatedAt || b.createdAt || 0;
        return new Date(timeB) - new Date(timeA);
      });

      res.json({
        success: true,
        data: sortedTasks,
        count: sortedTasks.length,
        filter: team ? { team } : undefined
      });
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks'
      });
    }
  });

  /**
   * GET /api/tasks/:id
   * Get a specific task by ID
   */
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const allTasks = fileWatcher.getAllTasks();
      const task = allTasks.find(t => t.id === id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Task '${id}' not found`
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error(`Error fetching task ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch task'
      });
    }
  });

  return router;
}
