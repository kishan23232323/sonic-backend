import express, { Application } from 'express';
import { corsMiddleware } from './api/middleware/core.middleware';
import { errorHandler } from './api/middleware/error.middleware';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes will be added here

// Error handling
app.use(errorHandler);

export default app;