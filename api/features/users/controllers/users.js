const bcrypt = require('bcrypt');
const boom = require('boom');
const jwt = require('jsonwebtoken');
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
 * @param res - express response
 * @returns {Promise<data|meta|*>}
 */
const registerUser = async (req, res) => {
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

    // create the token with the user data, and set expiration date in an hour
    const token = await jwt.sign(
      {
        payload: newUser,
        uid: newUser._id
      },
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );
    // set the header in response
    res.header('Authorization', `Bearer ${token}`);
    res.status(201);
    return mapResponse('newUser', {newUser});
  } catch (err) {
    // Mongoose model errors
    if (['ValidationError', 'MongoError'].includes(err.name)) {
      throw new Error(err);
    } else {
      // something went wrong when hashing the password
      throw boom.internal('Unexpected error hashing password or saving on db');
    }
  }
};

const loginUser = async (req, res) => {
  const {user: {value: user}} = req.swagger.params;
  const {email, password} = user;
  const userData = await userService.getByEmail(email);

  // if userData is null, it means no user was found with the request email
  if (!userData) {
    throw boom.notFound('Email not found, please sign up');
  }
  // compare the passwords
  const areEquals = await bcrypt.compare(password, userData.password);

  if (!areEquals) {
    throw boom.unauthorized('Wrong password');
  }

  delete userData.password;
  // create the token with the user data, and set expiration date in an hour
  const token = await jwt.sign(
    {
      payload: userData,
      uid: userData._id
    },
    process.env.JWT_SECRET,
    {expiresIn: '1h'}
  );
  // set the header in response
  res.header('Authorization', `Bearer ${token}`);
  return mapResponse('userData', {userData});
};

module.exports = {
  registerUser: responder(registerUser),
  loginUser: responder(loginUser)
};
