/**
 * Progress Routes
 *
 * GET /api/progress/:mode - Get user's cursor position
 * PUT /api/progress/:mode - Update cursor position
 */

import { Router, Response } from 'express';
import { queryOne, execute } from '../db/connection';
import { requireAuth, requireWorkspace } from '../middleware/auth';
import {
  AuthenticatedRequest,
  Mode,
  UserProgress,
  UpdateProgressRequest,
  Workspace,
} from '../types';
import { getFeed } from '../services/feedGenerator';

const router = Router();

/**
 * GET /api/progress/:mode
 * Get user's cursor position for a mode
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

    const progress = queryOne<UserProgress>(
      'SELECT * FROM user_progress WHERE user_id = ? AND mode = ?',
      [req.user!.id, mode]
    );

    res.json({
      cursor: progress?.cursor_index ?? 0,
      updatedAt: progress?.updated_at ?? new Date().toISOString(),
    });
  }
);

/**
 * PUT /api/progress/:mode
 * Update user's cursor position
 */
router.put(
  '/:mode',
  requireAuth,
  requireWorkspace,
  (req: AuthenticatedRequest, res: Response) => {
    const mode = req.params.mode as Mode;
    const { cursor } = req.body as UpdateProgressRequest;

    if (mode !== 'archive' && mode !== 'recent') {
      res.status(400).json({ error: 'Invalid mode. Must be "archive" or "recent"' });
      return;
    }

    if (typeof cursor !== 'number' || cursor < 0) {
      res.status(400).json({ error: 'Cursor must be a non-negative number' });
      return;
    }

    // Get workspace to validate cursor bounds
    const workspace = queryOne<Workspace>('SELECT * FROM workspaces WHERE id = ?', [
      req.user!.workspace_id,
    ]);

    const feed = getFeed(mode, workspace!.seed);
    const maxCursor = Math.max(0, feed.length - 1);
    const boundedCursor = Math.min(cursor, maxCursor);

    // Upsert progress
    const now = new Date().toISOString();

    // Check if exists
    const existing = queryOne<UserProgress>(
      'SELECT * FROM user_progress WHERE user_id = ? AND mode = ?',
      [req.user!.id, mode]
    );

    if (existing) {
      execute(
        'UPDATE user_progress SET cursor_index = ?, updated_at = ? WHERE user_id = ? AND mode = ?',
        [boundedCursor, now, req.user!.id, mode]
      );
    } else {
      execute(
        'INSERT INTO user_progress (user_id, mode, cursor_index, updated_at) VALUES (?, ?, ?, ?)',
        [req.user!.id, mode, boundedCursor, now]
      );
    }

    res.json({
      cursor: boundedCursor,
      updatedAt: now,
    });
  }
);

export default router;
