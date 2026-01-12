/**
 * Swipes Routes
 *
 * POST /api/swipes/:mode - Save a swipe decision (like/pass)
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db/connection';
import { requireAuth, requireWorkspace } from '../middleware/auth';
import {
  AuthenticatedRequest,
  Mode,
  SwipeRecord,
  SaveSwipeRequest,
  MatchRecord,
  User,
} from '../types';

const router = Router();

/**
 * Check if all users in the workspace have liked this fundraise
 * If so, create a match (idempotent)
 */
function checkAndCreateMatch(
  workspaceId: string,
  fundraiseId: string,
  mode: Mode
): MatchRecord | null {
  // Get all users in the workspace
  const workspaceUsers = queryAll<User>(
    'SELECT id FROM users WHERE workspace_id = ?',
    [workspaceId]
  );

  if (workspaceUsers.length < 2) {
    return null; // Need at least 2 users for a match
  }

  // Check if all users have liked this fundraise
  const likes = queryAll<SwipeRecord>(
    `SELECT * FROM swipe_decisions
     WHERE fundraise_id = ? AND mode = ? AND decision = 'like'
     AND user_id IN (SELECT id FROM users WHERE workspace_id = ?)`,
    [fundraiseId, mode, workspaceId]
  );

  // All users must have liked
  if (likes.length < workspaceUsers.length) {
    return null;
  }

  // Check if match already exists (idempotent)
  const existingMatch = queryOne<MatchRecord>(
    'SELECT * FROM matches WHERE workspace_id = ? AND fundraise_id = ? AND mode = ?',
    [workspaceId, fundraiseId, mode]
  );

  if (existingMatch) {
    return existingMatch;
  }

  // Create new match
  const matchId = uuidv4();
  const now = new Date().toISOString();

  execute(
    'INSERT INTO matches (id, workspace_id, fundraise_id, mode, created_at) VALUES (?, ?, ?, ?, ?)',
    [matchId, workspaceId, fundraiseId, mode, now]
  );

  console.log(`[Match] Created match for fundraise ${fundraiseId} in mode ${mode}`);

  return queryOne<MatchRecord>('SELECT * FROM matches WHERE id = ?', [matchId]) || null;
}

/**
 * POST /api/swipes/:mode
 * Save a swipe decision for a fundraise
 */
router.post(
  '/:mode',
  requireAuth,
  requireWorkspace,
  (req: AuthenticatedRequest, res: Response) => {
    const mode = req.params.mode as Mode;
    const { fundraiseId, decision } = req.body as SaveSwipeRequest;

    // Validate mode
    if (mode !== 'archive' && mode !== 'recent') {
      res.status(400).json({ error: 'Invalid mode. Must be "archive" or "recent"' });
      return;
    }

    // Validate fundraiseId
    if (!fundraiseId || typeof fundraiseId !== 'string') {
      res.status(400).json({ error: 'fundraiseId is required' });
      return;
    }

    // Validate decision
    if (decision !== 'like' && decision !== 'pass') {
      res.status(400).json({ error: 'decision must be "like" or "pass"' });
      return;
    }

    const now = new Date().toISOString();
    const userId = req.user!.id;
    const workspaceId = req.user!.workspace_id;

    // Check if decision already exists for this user/fundraise/mode
    const existing = queryOne<SwipeRecord>(
      'SELECT * FROM swipe_decisions WHERE user_id = ? AND fundraise_id = ? AND mode = ?',
      [userId, fundraiseId, mode]
    );

    let swipeId: string;

    if (existing) {
      // Update existing decision
      swipeId = existing.id;
      execute(
        'UPDATE swipe_decisions SET decision = ?, created_at = ? WHERE id = ?',
        [decision, now, swipeId]
      );
    } else {
      // Insert new decision
      swipeId = uuidv4();
      execute(
        'INSERT INTO swipe_decisions (id, user_id, fundraise_id, mode, decision, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [swipeId, userId, fundraiseId, mode, decision, now]
      );
    }

    // Check for match if this was a Like
    let matchCreated = false;
    if (decision === 'like' && workspaceId) {
      const match = checkAndCreateMatch(workspaceId, fundraiseId, mode);
      matchCreated = match !== null;
    }

    res.json({
      id: swipeId,
      decision,
      createdAt: now,
      matchCreated,
    });
  }
);

export default router;
