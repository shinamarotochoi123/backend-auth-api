import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node MySQL API',
      version: '1.0.0',
      description: 'Authentication API with Node.js + MySQL'
    },
    servers: [
      {
        url: process.env.CLIENT_URL || 'https://backend-auth-api-2.onrender.com',
        description: 'Production server'
      }
    ]
  },
  apis: ['./dist/accounts/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS - Allow frontend
app.use(cors({
  origin: ['http://localhost:4200', 'https://angular-auth-boilerplate.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/accounts', accountsController);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Quick test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Authentication API is running!',
    docs: '/api-docs',
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

// Global error handler
app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`🚀 API available at http://localhost:${port}`);
});