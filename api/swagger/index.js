const users = require('../features/users/swagger');

// This will be used to generate the swagger.yaml at startup
module.exports = {
  swagger: '2.0',
  info: {
    version: '0.0.2',
    title: 'STRB addressbook Api'
  },
  host: process.env.NODE_ENV === 'production' ? 'xxxx' : `localhost:${process.env.PORT}`,
  basePath: '/api',
  schemes: [['production', 'test'].includes(process.env.NODE_ENV) ? 'https' : 'http'],
  tags: [
    {
      name: 'users',
      description: 'Users operations'
    },
    {
      name: 'contacts',
      description: 'Contacts operations'
    }
  ],
  consumes: ['application/json'],
  produces: ['application/json'],
  paths: {
    ...users.paths,
    '/swagger': {
      'x-swagger-pipe': 'swagger_raw'
    }
  },
  definitions: {
    Error: {
      properties: {message: {type: 'string'}}
    },
    ErrorResponse: {
      properties: {error: {$ref: '#/definitions/Error'}}
    },
    ...users.definitions
  },
  securityDefinitions: {
    jwtAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
};
