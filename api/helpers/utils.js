require('dotenv').config();
const Boom = require('boom');
const jwt = require('jsonwebtoken');

/**
 * Get a random integer from min to max
 * @param min - integer
 * @param max - integer
 * @returns integer
 */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/**
 * Makes a deep copy of an object, to lose all reference from the copied one
 * @param source
 * @returns copied object
 */
const deepCopy = source => JSON.parse(JSON.stringify(source));

/**
 * format the result data in a specific way
 * @param dataKey - the property that will stay as data, the rest will pass to a meta object
 * @param results - object to transform
 * @returns {data, meta}
 */
const mapResponse = (dataKey, results) => {
  const response = {};
  response.data = results[dataKey];
  delete results[dataKey];
  response.meta = results;
  return response;
};

/**
 * A middleware that will add an error function to handle errors and returns an error json in specific way
 * @param req
 * @param res
 * @param next
 */
const error = (req, res, next) => {
  res.error = err => {
    if (!err.isBoom) {
      err = Boom.badRequest(err);
    }
    res.status(err.output.statusCode).json(err.output.payload);
  };
  next();
};

/**
 * A middleware that will validate the Authorization header and fill req object with user data
 * @param req
 * @param res
 * @param next
 */
const jwtDecode = (req, res, next) => {
  if (req.header('Authorization')) {
    const token = req.header('Authorization').split(' ');
    if (token[0] === 'Bearer' && token[1]) {
      const decoded = jwt.decode(token[1]);
      req.user = decoded.payload;
      req.token = token[1];
    }
  }
  next();
};
/**
 * A security handler that will verify if a token is valid
 * @param req
 * @param _
 * @param apiKey
 * @param next
 */
const jwtVerify = (req, _, apiKey, next) => {
  if (req.header('Authorization')) {
    const token = req.header('Authorization').split(' ');
    if (token[0] === 'Bearer' && token[1]) {
      try {
        jwt.verify(token[1], process.env.JWT_SECRET);
        next();
      } catch (err) {
        // we don't send much information about the error
        next(err);
      }
    } else {
      // we don't send much information about the error
      next(new Error('Unauthorized Access'));
    }
  } else {
    // we don't send much information about the error
    next(new Error('Unauthorized Access'));
  }
};

/**
 * A wrapper function to handle thrown exceptions and to return a json response when the function
 * wrapped finished correctly
 * @param func
 * @returns void
 */
const responder = func => async (req, res, next) => {
  try {
    res.json(await func(req, res, next));
  } catch (err) {
    res.error(err);
  }
};

/**
 * Given a check function and a response, if the check function fails, it will throw an exception
 * @param check - check function
 * @param rejection - rejection object or message
 * @returns response if there is no error or rejection instead
 */
const rejectResolver = (check, rejection) => async response => {
  if (check(await response)) {
    return Promise.reject(rejection);
  }
  return response;
};

/**
 * object containing the different middleware in utils
 * @type {{error: error, jwtDecode: jwtDecode}}
 */
const middleware = {
  error,
  jwtDecode,
  jwtVerify
};

module.exports = {
  randomInt,
  deepCopy,
  mapResponse,
  middleware,
  rejectResolver,
  responder
};
