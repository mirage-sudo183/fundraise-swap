/**
 * Matches Routes
 *
 * GET /api/matches - List all matches for the workspace (newest first)
 * GET /api/matches/:id - Get match detail with reflections
 */

import { Router, Response } from 'express';
import { queryAll, queryOne } from '../db/connection';
import { requireAuth, requireWorkspace } from '../middleware/auth';
import {
  AuthenticatedRequest,
  MatchRecord,
  SwipeRecord,
  ReflectionRecord,
  User,
  MatchListItem,
  UserReflection,
} from '../types';
import { getFeed } from '../services/feedGenerator';

const router = Router();

/**
 * Get reflections for all users who liked a fundraise
 */
function getReflectionsForMatch(
  workspaceId: string,
  fundraiseId: string,
  mode: string
): UserReflection[] {
  // Get all likes for this fundraise from workspace users
  const likes = queryAll<SwipeRecord & { user_name: string; user_display_name: string }>(
    `SELECT sd.*, u.name as user_name, u.display_name as user_display_name
     FROM swipe_decisions sd
     JOIN users u ON sd.user_id = u.id
     WHERE sd.fundraise_id = ? AND sd.mode = ? AND sd.decision = 'like'
     AND u.workspace_id = ?
     ORDER BY sd.created_at ASC`,
    [fundraiseId, mode, workspaceId]
  );

  return likes.map((like) => {
    // Get reflection for this swipe if exists
    const reflection = queryOne<ReflectionRecord>(
      'SELECT * FROM reflections WHERE swipe_id = ?',
      [like.id]
    );

    return {
      userId: like.user_id,
      userName: like.user_name,
      displayName: like.user_display_name,
      chips: reflection ? JSON.parse(reflection.chips) : [],
      note: reflection?.note || null,
      likedAt: like.created_at,
    };
  });
}

/**
 * GET /api/matches
 * List all matches for the workspace, newest first
 */
router.get(
  '/',
  requireAuth,
  requireWorkspace,
  (req: AuthenticatedRequest, res: Response) => {
    const workspaceId = req.user!.workspace_id!;

    // Get workspace to get seed for feed
    const workspace = queryOne<{ seed: string }>(
      'SELECT seed FROM workspaces WHERE id = ?',
      [workspaceId]
    );

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    // Get all matches for this workspace, newest first
    const matches = queryAll<MatchRecord>(
      'SELECT * FROM matches WHERE workspace_id = ? ORDER BY created_at DESC',
      [workspaceId]
    );

    // Get feed to look up fundraise details
    const archiveFeed = getFeed('archive', workspace.seed);
    const recentFeed = getFeed('recent', workspace.seed);

    // Build fundraise lookup map
    const fundraiseMap = new Map<string, any>();
    archiveFeed.forEach((f) => fundraiseMap.set(f.id, f));
    recentFeed.forEach((f) => fundraiseMap.set(f.id, f));

    // Build response
    const matchList: MatchListItem[] = matches.map((match) => {
      const fundraise = fundraiseMap.get(match.fundraise_id);
      const reflections = getReflectionsForMatch(workspaceId, match.fundraise_id, match.mode);

      return {
        id: match.id,
        fundraiseId: match.fundraise_id,
        companyName: fundraise?.company_name || 'Unknown Company',
        description: fundraise?.description || '',
        stage: fundraise?.stage || '',
        amountRaised: fundraise?.amount_raised || '',
        mode: match.mode,
        matchedAt: match.created_at,
        reflections,
      };
    });

    res.json({ matches: matchList });
  }
);

/**
 * GET /api/matches/:id
 * Get detailed match info with full fundraise data and reflections
 */
router.get(
  '/:id',
  requireAuth,
  requireWorkspace,
  (req: AuthenticatedRequest, res: Response) => {
    const matchId = req.params.id;
    const workspaceId = req.user!.workspace_id!;

    // Get the match
    const match = queryOne<MatchRecord>(
      'SELECT * FROM matches WHERE id = ? AND workspace_id = ?',
      [matchId, workspaceId]
    );

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // Get workspace seed
    const workspace = queryOne<{ seed: string }>(
      'SELECT seed FROM workspaces WHERE id = ?',
      [workspaceId]
    );

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    // Get fundraise from feed
    const feed = getFeed(match.mode, workspace.seed);
    const fundraise = feed.find((f) => f.id === match.fundraise_id);

    if (!fundraise) {
      res.status(404).json({ error: 'Fundraise not found' });
      return;
    }

    // Get reflections
    const reflections = getReflectionsForMatch(workspaceId, match.fundraise_id, match.mode);

    const matchItem: MatchListItem = {
      id: match.id,
      fundraiseId: match.fundraise_id,
      companyName: fundraise.company_name,
      description: fundraise.description,
      stage: fundraise.stage,
      amountRaised: fundraise.amount_raised,
      mode: match.mode,
      matchedAt: match.created_at,
      reflections,
    };

    res.json({
      match: matchItem,
      fundraise,
    });
  }
);

export default router;
