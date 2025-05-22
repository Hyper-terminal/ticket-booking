import knex from 'knex';
import config from '../knexfile';
import { logger } from '../utils/logger';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment as keyof typeof config];

let db: knex.Knex;
let isInitialized = false;

export const initializeDatabase = async () => {
  if (!db) {
    db = knex(dbConfig);

    try {
      // Test the connection
      await db.raw('SELECT 1');
      logger.info('Database connection successful');
      isInitialized = true;
    } catch (err) {
      logger.error('Database connection failed:', err);
      process.exit(1);
    }
  }
  return db;
};

export const getDatabase = () => {
  if (!isInitialized) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}; 