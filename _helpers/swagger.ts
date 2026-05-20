import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
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
  apis: ['./dist/accounts/*.js', './dist/_helpers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default [swaggerUi.serve, swaggerUi.setup(swaggerSpec)];