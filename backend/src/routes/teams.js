import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Create team routes with fileWatcher dependency
 */
export function createTeamRoutes(fileWatcher) {
  const router = Router();

  /**
   * GET /api/teams
   * List all teams with their configs and inbox counts
   */
  router.get('/', (req, res) => {
    try {
      const teams = fileWatcher.getAllTeams();

      // Return team list with full inbox data
      const teamsList = teams.map(team => ({
        id: team.id || team.name,
        name: team.name,
        config: team.config,
        inbox: team.inbox || [],
        inboxCount: team.inbox?.length || 0
      }));

      res.json({
        success: true,
        data: teamsList,
        count: teamsList.length
      });
    } catch (error) {
      logger.error('Error fetching teams:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teams'
      });
    }
  });

  /**
   * GET /api/teams/:name
   * Get detailed information about a specific team including inbox messages
   */
  router.get('/:name', (req, res) => {
    try {
      const { name } = req.params;
      const team = fileWatcher.getTeam(name);

      if (!team) {
        return res.status(404).json({
          success: false,
          error: `Team '${name}' not found`
        });
      }

      // Sort inbox messages by timestamp (newest first) if available
      const sortedInbox = team.inbox?.sort((a, b) => {
        const timeA = a.timestamp || a.createdAt || 0;
        const timeB = b.timestamp || b.createdAt || 0;
        return new Date(timeB) - new Date(timeA);
      }) || [];

      res.json({
        success: true,
        data: {
          id: team.id || team.name,
          name: team.name,
          config: team.config,
          inbox: sortedInbox
        }
      });
    } catch (error) {
      logger.error(`Error fetching team ${req.params.name}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team details'
      });
    }
  });

  return router;
}
