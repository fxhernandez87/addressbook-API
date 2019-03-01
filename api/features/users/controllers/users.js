const bcrypt = require('bcrypt');
const boom = require('boom');
const {responder, mapResponse} = require('../../../helpers/utils');
const userService = require('../services/user');
const saltFactor = 10;

/**
 * Register a User, every thrown exceptions not wrapped on try/catch will be caught on the responder function
 * Validations:
 *  - email not being used
 *  - email must be valid email format
 *  - password length should be greater equal 8
 * @param req - express request
 * @returns {Promise<data|meta|*>}
 */
const registerUser = async req => {
  const {user: {value: user}} = req.swagger.params;
  const {email, password, name} = user;
  const userData = await userService.getByEmail(email);

  // validate if the email is taken
  if (userData) {
    throw new Error('Email taken, please use another one');
  }

  // validate length of password
  if (password.length < 8) {
    throw new Error('Password too short');
  }

  try {
    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, saltFactor);

    const newUser = await userService.create({email, name, password: hashedPassword});
    // remove the hashed password from the response object
    delete newUser.password;

    // TODO create JWT token and send it to the response headers
    return mapResponse('newUser', {newUser});
  } catch (err) {
    // Mongoose model errors
    if (['ValidationError', 'MongoError'].includes(err.name)) {
      throw new Error(err);
    } else {
      // something went wrong when hashing the password
      throw new Error('Unexpected error hashing password')
    }
  }
};

const loginUser = async req => {
  const {user: {value: user}} = req.swagger.params;
  const {email, password} = user;
  const userData = await userService.getByEmail(email);

  // if userData is null, it means no user was found with the request email
  if (!userData) {
    throw boom.unauthorized('Email not found, please sign up');
  }
  // compare the passwords
  const areEquals = await bcrypt.compare(password, userData.password);

  if (!areEquals) {
    throw boom.unauthorized('Wrong password');
  }

  delete userData.password;
  // TODO create JWT token and send it to the response headers
  return mapResponse('userData', {userData});
};

module.exports = {
  registerUser: responder(registerUser),
  loginUser: responder(loginUser)
};
