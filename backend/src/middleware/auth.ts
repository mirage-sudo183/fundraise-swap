/**
 * Authentication Middleware
 *
 * Validates session tokens and attaches user to request.
 */

import { Response, NextFunction } from 'express';
import { queryOne } from '../db/connection';
import { AuthenticatedRequest, User, Session } from '../types';

/**
 * Require authentication for a route
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Find session (check not expired)
  const session = queryOne<Session>(
    `SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`,
    [token]
  );

  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  // Find user
  const user = queryOne<User>('SELECT * FROM users WHERE id = ?', [session.user_id]);

  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  // Attach to request
  req.user = user;
  req.session = session;

  next();
}

/**
 * Require user to be in a workspace
 */
export function requireWorkspace(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.workspace_id) {
    res.status(403).json({ error: 'User must be in a workspace' });
    return;
  }

  next();
}
