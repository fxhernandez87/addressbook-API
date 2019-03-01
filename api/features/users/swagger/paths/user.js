const { responseMaker } = require('../../../../helpers/swagger');
const swaggerController = {'x-swagger-router-controller': 'features/users/controllers/users'};
const {hidden: {UserPost, UserResponse}} = require('../definitions/user');

module.exports = {
  '/users/signup': {
    ...swaggerController,
    post: {
      description: 'Register a user to manage cantacts',
      summary: 'Register a user to manage cantacts',
      consumes: ['application/json'],
      operationId: 'registerUser',
      tags: ['users'],
      parameters: [
        {
          name: 'user',
          in: 'body',
          description: 'User to be registered',
          required: true,
          schema: {
            ...UserPost
          }
        }
      ],
      responses: {
        ...responseMaker(200, undefined, {...UserResponse}),
        ...responseMaker(400)
      }
    }
  },
  '/users/login': {
    ...swaggerController,
    post: {
      operationId: 'loginUser',
      tags: ['users'],
      description: 'Get the token of the logged in user',
      parameters: [
        {
          name: 'user',
          in: 'body',
          description: 'User to be logged in',
          required: true,
          schema: {
            ...UserPost
          }
        }
      ],
      responses: {
        ...responseMaker(200, undefined, {...UserResponse}),
        ...responseMaker(400),
        ...responseMaker(401),
        ...responseMaker(404)
      }
    }
  }
};
