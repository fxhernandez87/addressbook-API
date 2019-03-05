const users = require('../features/users/swagger');
const hostname = ['production', 'staging', 'testing'].includes(process.env.ENV)
  ? `${process.env.HEROKU_APP_NAME}.herokuapp.com`
  : `localhost:${process.env.PORT}`;
const schemes = [['production', 'staging', 'testing'].includes(process.env.ENV) ? 'https' : 'http'];
// This will be used to generate the swagger.yaml at startup
module.exports = {
  swagger: '2.0',
  info: {
    version: '0.0.4',
    title: 'STRV Addressbook Api',
    description:
      'This is a sample address book API.  Here you will be able to register yourself or login via email and password' +
      ', and receive a JWT token which you can use in the secured endpoints like [Contacts](#/Contacts).',
    contact: {email: 'fxhernandez87@gmail.com'}
  },
  host: hostname,
  basePath: '/api',
  schemes: schemes,
  tags: [
    {
      name: 'Users',
      description: 'Users operations'
    },
    {
      name: 'Contacts',
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
      properties: {
        statusCode: {type: 'number'},
        message: {type: 'string'},
        error: {type: 'string'},
        code: {type: 'string'}
      },
      required: ['statusCode', 'message', 'error']
    },
    ...users.definitions
  },
  securityDefinitions: {
    jwtAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Bearer token authentication'
    }
  }
};
