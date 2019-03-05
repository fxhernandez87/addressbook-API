const {responseMaker, jwtSecurity: security} = require('../../../../helpers/swagger');
const swaggerController = {'x-swagger-router-controller': 'features/users/controllers/contacts'};
const {hidden: {ContactPost, ContactResponse}} = require('../definitions/contact');

module.exports = {
  '/contacts': {
    ...swaggerController,
    post: {
      security,
      description:
        '>' +
        'Adding a new contact requires you to be logged in, set an Authorization header with a valid token ' +
        '(not expired).\nNew contacts will be added on a firebase database (firestore) in a collection "**contacts**"' +
        ' with the fields passed on the body and additionally the userId that is creating that contact. This way ' +
        ' on the client side can retrieve all the contacts using the userId key.',
      summary: 'add a new contact for the logged in user',
      consumes: ['application/json'],
      operationId: 'addContact',
      tags: ['Contacts'],
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
