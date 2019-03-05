const {responseMaker} = require('../../../../helpers/swagger');
const swaggerController = {'x-swagger-router-controller': 'features/users/controllers/users'};
const {hidden: {UserPost, UserLogin, UserResponse}} = require('../definitions/user');

module.exports = {
  '/users/signup': {
    ...swaggerController,
    post: {
      description:
        '>' +
        'Using **email** and **password** authentication, it will validate if the email is already taken, ' +
        "if the password isn't too short. \n" +
        'Finally will respond with a token in the **Authorization** response headers',
      summary: 'Register a user to manage cantacts',
      consumes: ['application/json'],
      operationId: 'registerUser',
      tags: ['Users'],
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
        ...responseMaker(201, undefined, {...UserResponse}),
        ...responseMaker(400)
      }
    }
  },
  '/users/login': {
    ...swaggerController,
    post: {
      operationId: 'loginUser',
      tags: ['Users'],
      description:
        '>' +
        'Using **email** and **password** authentication, it will validate if the email exists, if the password ' +
        'match the one in the database.\nFinally will respond with a token in the **Authorization** response headers',
      summary: 'Get the token of the logged in user',
      parameters: [
        {
          name: 'user',
          in: 'body',
          description: 'User to be logged in',
          required: true,
          schema: {
            ...UserLogin
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
