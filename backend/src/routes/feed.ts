/**
 * Feed Routes
 *
 * GET /api/feed/:mode - Get ordered feed for workspace
 */

import { Router, Response } from 'express';
import { queryOne } from '../db/connection';
import { requireAuth, requireWorkspace } from '../middleware/auth';
import { AuthenticatedRequest, Mode, Workspace, UserProgress } from '../types';
import { getFeed } from '../services/feedGenerator';

const router = Router();

/**
 * GET /api/feed/:mode
 * Get ordered feed for the user's workspace
 */
router.get(
  '/:mode',
  requireAuth,
  requireWorkspace,
  (req: AuthenticatedRequest, res: Response) => {
    const mode = req.params.mode as Mode;

    if (mode !== 'archive' && mode !== 'recent') {
      res.status(400).json({ error: 'Invalid mode. Must be "archive" or "recent"' });
      return;
    }

    // Get workspace seed
    const workspace = queryOne<Workspace>('SELECT * FROM workspaces WHERE id = ?', [
      req.user!.workspace_id,
    ]);

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    // Get ordered feed
    const feed = getFeed(mode, workspace.seed);

    // Get user's cursor for this mode
    const progress = queryOne<UserProgress>(
      'SELECT * FROM user_progress WHERE user_id = ? AND mode = ?',
      [req.user!.id, mode]
    );

    const userCursor = progress?.cursor_index ?? 0;

    res.json({
      feed,
      totalCount: feed.length,
      userCursor: Math.min(userCursor, Math.max(0, feed.length - 1)),
    });
  }
);

export default router;
