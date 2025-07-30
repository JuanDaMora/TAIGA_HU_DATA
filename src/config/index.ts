import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST_NAME: process.env.HOST_NAME || '',
  TOKEN: process.env.TOKEN || '',
  PROYECT_TAIGA: process.env.PROYECT_TAIGA || '',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SPRINTS: `/api/v1/sprints`,
  USER_STORIES: `/api/v1/userstories`,
  USER_STORY_HISTORY: `/api/v1/history/userstory`,
} as const;

// Validation
export const validateConfig = (): void => {
  const requiredVars = ['HOST_NAME', 'TOKEN', 'PROYECT_TAIGA'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
};

// Export configuration object
export const config = {
  env: ENV_CONFIG,
  api: API_ENDPOINTS,
  validate: validateConfig,
} as const; 