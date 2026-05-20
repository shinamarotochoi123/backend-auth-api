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
        url: 'https://backend-auth-api-2.onrender.com',
        description: 'Production server'
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
  apis: ['./dist/accounts/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default [swaggerUi.serve, swaggerUi.setup(swaggerSpec)];