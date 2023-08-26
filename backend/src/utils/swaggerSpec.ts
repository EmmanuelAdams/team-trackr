import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TeamTrackr API Documentation',
      version: '1.0.0',
      description: 'API documentation for TeamTrackr',
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'User',
        description: 'User endpoints',
      },
      {
        name: 'Project',
        description: 'Project endpoints',
      },
    ],
  },
  apis: ['./src/utils/swaggerDocs/**/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
