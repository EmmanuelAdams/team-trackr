import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TeamTrackr API Documentation',
      version: '1.0.0',
      description: 'API documentation for TeamTrackr',
    },
  },
  apis: ['./src/routes/*.route.ts'], // Replace with the path to your TypeScript file(s) containing JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
