const {responseMaker, jwtSecurity: security} = require('../../../../helpers/swagger');
const swaggerController = {'x-swagger-router-controller': 'features/users/controllers/contacts'};
const {hidden: {ContactPost, ContactResponse}} = require('../definitions/contact');

module.exports = {
  '/users/contacts': {
    ...swaggerController,
    post: {
      security,
      description: 'add a new contact',
      summary: 'add a new contact for the logged in user',
      consumes: ['application/json'],
      operationId: 'addContact',
      tags: ['contacts'],
      parameters: [
        {
          name: 'contact',
          in: 'body',
          description: 'Contact to be added',
          required: true,
          schema: {
            ...ContactPost
          }
        }
      ],
      responses: {
        ...responseMaker(200, undefined, {...ContactResponse}),
        ...responseMaker(400),
        ...responseMaker(401),
        ...responseMaker(403)
      }
    }
  }
};
