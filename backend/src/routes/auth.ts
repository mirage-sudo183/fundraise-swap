/**
 * Auth Routes
 *
 * GET /api/auth/users - List available users for login
 * POST /api/auth/login - Login by name (simple selector)
 * POST /api/auth/logout - Logout (invalidate session)
 * GET /api/auth/me - Get current user
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db/connection';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest, User, Workspace, AuthRequest } from '../types';

const router = Router();

// Session expiry in hours (default 7 days)
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '168', 10);

/**
 * GET /api/auth/users
 * List available users for the login selector
 */
router.get('/users', (req, res: Response) => {
  const users = queryAll<User>('SELECT id, name, display_name, workspace_id FROM users');
  res.json({ users });
});

/**
 * POST /api/auth/login
 * Login by name (simple selector, no password)
 */
router.post('/login', (req, res: Response) => {
  const { name } = req.body as AuthRequest;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const normalizedName = name.toLowerCase().trim();

  // Find user by name
  const user = queryOne<User>('SELECT * FROM users WHERE name = ?', [normalizedName]);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  console.log(`[Auth] User logged in: ${user.display_name}`);

  // Create session
  const sessionId = uuidv4();
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000
  ).toISOString();

  execute('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [
    sessionId,
    user.id,
    expiresAt,
  ]);

  res.json({
    user,
    token: sessionId,
  });
});

/**
 * POST /api/auth/logout
 * Invalidate current session
 */
router.post('/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  execute('DELETE FROM sessions WHERE id = ?', [req.session!.id]);
  res.json({ success: true });
});

/**
 * GET /api/auth/me
 * Get current user and workspace
 */
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let workspace: Workspace | null = null;
  if (req.user!.workspace_id) {
    workspace =
      queryOne<Workspace>('SELECT * FROM workspaces WHERE id = ?', [
        req.user!.workspace_id,
      ]) || null;
  }

  res.json({
    user: req.user,
    workspace,
  });
});

export default router;
