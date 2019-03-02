const _id = {type: 'string'};
const email = {type: 'string'};
const surName = {type: 'string'};
const name = {type: 'string'};

const Contact = {
  properties: {
    _id,
    email,
    surName,
    name
  }
};
const ContactPost = {
  required: ['email', 'surName', 'name'],
  properties: {
    email,
    surName,
    name
  }
};
const ContactResponse = {
  required: ['data'],
  properties: {
    data: {$ref: '#/definitions/Contact'}
  }
};

module.exports = {
  shown: {
    Contact
  },
  hidden: {
    ContactPost,
    ContactResponse
  }
};
