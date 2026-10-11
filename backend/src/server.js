import { ensureJwtSecret } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { bootstrapData } from './services/bootstrapAdmin.js';
import app from './app.js';

ensureJwtSecret();
const port = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDatabase();
    await bootstrapData();
    const server = app.listen(port, () => console.info(`P.N. Central Academy API listening on http://localhost:${port}`));

    const shutdown = (signal) => {
      console.info(`${signal} received; shutting down gracefully.`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Application startup failed:', error.message);
    process.exit(1);
  }
}

start();
