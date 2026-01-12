/**
 * Fundraise Swap Backend
 *
 * Express API server with SQLite database.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDb, closeDb } from './db/connection';
import { loadFundraiseData, getDatasetStats } from './services/feedGenerator';

// Routes
import authRoutes from './routes/auth';
import workspaceRoutes from './routes/workspaces';
import feedRoutes from './routes/feed';
import progressRoutes from './routes/progress';
import swipesRoutes from './routes/swipes';
import reflectionsRoutes from './routes/reflections';
import matchesRoutes from './routes/matches';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/swipes', swipesRoutes);
app.use('/api/reflections', reflectionsRoutes);
app.use('/api/matches', matchesRoutes);

// Health check
app.get('/health', (req, res) => {
  const stats = getDatasetStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataset: stats,
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Startup
async function start() {
  console.log('[Server] Initializing database...');
  initializeDb();

  console.log('[Server] Loading fundraise data...');
  loadFundraiseData();

  const stats = getDatasetStats();
  console.log(`[Server] Dataset: ${stats.archiveCount} archive, ${stats.recentCount} recent fundraises`);

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Shutting down...');
  closeDb();
  process.exit(0);
});

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
