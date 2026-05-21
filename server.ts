import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { initDb } from './_helpers/db';

// Load environment variables
dotenv.config();

// Initialize database (in-memory for demo)
initDb();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node MySQL API',
      version: '1.0.0',
      description: 'Authentication API with Node.js + MySQL',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: process.env.CLIENT_URL || 'https://backend-auth-api-2.onrender.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:4000',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./dist/accounts/*.js', './dist/_helpers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS Configuration - Allow frontend
app.use(cors({
  origin: ['http://localhost:4200', 'https://angular-auth-boilerplate.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Simple Swagger JSON endpoint (fallback)
app.get('/swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Node MySQL API',
      version: '1.0.0',
      description: 'Authentication API'
    },
    paths: {
      '/accounts/register': {
        post: {
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    confirmPassword: { type: 'string' },
                    acceptTerms: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: { '200': { description: 'Success' } }
        }
      },
      '/accounts/authenticate': {
        post: {
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { '200': { description: 'Success' } }
        }
      }
    }
  });
});

// Routes
app.use('/accounts', accountsController);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Quick test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Authentication API is running!',
    docs: '/api-docs',
    swagger: '/swagger.json',
    endpoints: {
      register: 'POST /accounts/register',
      login: 'POST /accounts/authenticate',
      refresh: 'POST /accounts/refresh-token',
      verify: 'POST /accounts/verify-email',
      forgot: 'POST /accounts/forgot-password',
      reset: 'POST /accounts/reset-password'
    }
  });
});

// Global error handler - must be last
app.use(errorHandler);

// Port configuration
const port = process.env.PORT || 4000;

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`🚀 API available at http://localhost:${port}`);
  console.log(`📖 Simple Swagger: http://localhost:${port}/swagger.json`);
});