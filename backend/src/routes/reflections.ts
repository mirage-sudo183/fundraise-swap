/**
 * Reflections Routes
 *
 * POST /api/reflections - Save a reflection for a Like swipe
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '../db/connection';
import { requireAuth, requireWorkspace } from '../middleware/auth';
import {
  AuthenticatedRequest,
  SwipeRecord,
  ReflectionRecord,
  SaveReflectionRequest,
} from '../types';

const router = Router();

/**
 * POST /api/reflections
 * Save a reflection for a Like swipe
 */
router.post(
  '/',
  requireAuth,
  requireWorkspace,
  (req: AuthenticatedRequest, res: Response) => {
    const { swipeId, chips, note } = req.body as SaveReflectionRequest;
    const userId = req.user!.id;

    // Validate swipeId
    if (!swipeId || typeof swipeId !== 'string') {
      res.status(400).json({ error: 'swipeId is required' });
      return;
    }

    // Validate chips
    if (!Array.isArray(chips)) {
      res.status(400).json({ error: 'chips must be an array' });
      return;
    }

    // Verify the swipe exists and belongs to this user
    const swipe = queryOne<SwipeRecord>(
      'SELECT * FROM swipe_decisions WHERE id = ? AND user_id = ?',
      [swipeId, userId]
    );

    if (!swipe) {
      res.status(404).json({ error: 'Swipe not found' });
      return;
    }

    // Only allow reflections on Likes
    if (swipe.decision !== 'like') {
      res.status(400).json({ error: 'Reflections are only allowed on Like swipes' });
      return;
    }

    const now = new Date().toISOString();
    const chipsJson = JSON.stringify(chips);

    // Check if reflection already exists for this swipe
    const existing = queryOne<ReflectionRecord>(
      'SELECT * FROM reflections WHERE swipe_id = ?',
      [swipeId]
    );

    let reflectionId: string;

    if (existing) {
      // Update existing reflection
      reflectionId = existing.id;
      execute(
        'UPDATE reflections SET chips = ?, note = ?, created_at = ? WHERE id = ?',
        [chipsJson, note || null, now, reflectionId]
      );
    } else {
      // Insert new reflection
      reflectionId = uuidv4();
      execute(
        'INSERT INTO reflections (id, swipe_id, user_id, chips, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [reflectionId, swipeId, userId, chipsJson, note || null, now]
      );
    }

    res.json({
      id: reflectionId,
      swipeId,
      chips,
      note: note || null,
      createdAt: now,
    });
  }
);

export default router;
