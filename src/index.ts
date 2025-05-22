import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    logger.info('Starting server initialization...');
    
    // Step 1: Initialize database
    logger.info('Connecting to database...');
    await initializeDatabase();
    logger.info('Database connection established successfully');
    
    // Step 2: Set up routes (only after DB is ready)
    logger.info('Setting up routes...');
    app.use('/api/v1', routes);
    logger.info('Routes configured successfully');

    // Step 3: Start listening for requests
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info('Server is ready to accept requests');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled error during server startup:', error);
  process.exit(1);
}); 