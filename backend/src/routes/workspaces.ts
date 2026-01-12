/**
 * Workspace Routes
 *
 * POST /api/workspaces - Create a new workspace
 * POST /api/workspaces/join - Join an existing workspace
 * GET /api/workspaces/current - Get current workspace with members
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db/connection';
import { requireAuth } from '../middleware/auth';
import {
  AuthenticatedRequest,
  Workspace,
  User,
  CreateWorkspaceRequest,
  JoinWorkspaceRequest,
} from '../types';
import { generateWorkspaceSeed } from '../utils/deterministicShuffle';
import { generateInviteCode, normalizeInviteCode } from '../utils/inviteCode';

const router = Router();

/**
 * POST /api/workspaces
 * Create a new workspace
 */
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body as CreateWorkspaceRequest;

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: 'Workspace name is required' });
    return;
  }

  // Check if user already in a workspace
  if (req.user!.workspace_id) {
    res.status(400).json({ error: 'User is already in a workspace' });
    return;
  }

  // Generate unique invite code
  let inviteCode: string;
  let attempts = 0;
  do {
    inviteCode = generateInviteCode();
    const existing = queryOne<{ id: string }>(
      'SELECT id FROM workspaces WHERE invite_code = ?',
      [inviteCode]
    );
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    res.status(500).json({ error: 'Failed to generate unique invite code' });
    return;
  }

  // Create workspace
  const workspaceId = uuidv4();
  const seed = generateWorkspaceSeed();

  execute(
    'INSERT INTO workspaces (id, name, seed, invite_code) VALUES (?, ?, ?, ?)',
    [workspaceId, name.trim(), seed, inviteCode]
  );

  // Add user to workspace
  execute('UPDATE users SET workspace_id = ? WHERE id = ?', [
    workspaceId,
    req.user!.id,
  ]);

  const workspace = queryOne<Workspace>('SELECT * FROM workspaces WHERE id = ?', [
    workspaceId,
  ]);

  console.log(`[Workspace] Created: ${name} (${inviteCode}) by ${req.user!.display_name}`);

  res.json({ workspace });
});

/**
 * POST /api/workspaces/join
 * Join an existing workspace via invite code
 */
router.post('/join', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { inviteCode } = req.body as JoinWorkspaceRequest;

  if (!inviteCode) {
    res.status(400).json({ error: 'Invite code is required' });
    return;
  }

  // Check if user already in a workspace
  if (req.user!.workspace_id) {
    res.status(400).json({ error: 'User is already in a workspace' });
    return;
  }

  const normalizedCode = normalizeInviteCode(inviteCode);

  // Find workspace
  const workspace = queryOne<Workspace>(
    'SELECT * FROM workspaces WHERE invite_code = ?',
    [normalizedCode]
  );

  if (!workspace) {
    res.status(404).json({ error: 'Invalid invite code' });
    return;
  }

  // Add user to workspace
  execute('UPDATE users SET workspace_id = ? WHERE id = ?', [
    workspace.id,
    req.user!.id,
  ]);

  console.log(`[Workspace] User ${req.user!.display_name} joined ${workspace.name}`);

  res.json({ workspace });
});

/**
 * GET /api/workspaces/current
 * Get current workspace with members
 */
router.get('/current', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user!.workspace_id) {
    res.json({ workspace: null, members: [] });
    return;
  }

  const workspace = queryOne<Workspace>('SELECT * FROM workspaces WHERE id = ?', [
    req.user!.workspace_id,
  ]);

  if (!workspace) {
    res.json({ workspace: null, members: [] });
    return;
  }

  const members = queryAll<Pick<User, 'id' | 'name' | 'display_name' | 'created_at'>>(
    'SELECT id, name, display_name, created_at FROM users WHERE workspace_id = ?',
    [workspace.id]
  );

  res.json({ workspace, members });
});

export default router;
