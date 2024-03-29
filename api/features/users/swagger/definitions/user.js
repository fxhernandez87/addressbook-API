const _id = {type: 'string'};
const email = {type: 'string'};
const password = {type: 'string'};
const name = {type: 'string'};

const User = {
  properties: {
    _id,
    email,
    name
  }
};
const UserPost = {
  required: ['email', 'password'],
  properties: {
    email,
    password,
    name
  }
};

const UserLogin = {
  required: ['email', 'password'],
  properties: {
    email,
    password
  }
};
const UserResponse = {
  required: ['data'],
  properties: {
    data: {$ref: '#/definitions/User'}
  }
};

module.exports = {
  shown: {
    User
  },
  hidden: {
    UserPost,
    UserLogin,
    UserResponse
  }
};
