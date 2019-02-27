'use strict';

const util = require('util');
const Boom = require('boom');
const _ = require('lodash');

module.exports = function create(fittingDef) {
  function errorMessage(err) {
    if (_.isArray(err.errors) && !_.isEmpty(err.errors)) {
      return errorMessage(err.errors[0]);
    } else {
      return err.message;
    }
  }

  function manageContext(context) {
    if (!context.statusCode || context.statusCode < 400) {
      if (context.response && context.response.statusCode && context.response.statusCode >= 400) {
        context.statusCode = context.response.statusCode;
      } else if (context.error.statusCode && context.error.statusCode >= 400) {
        context.statusCode = context.error.statusCode;
        //delete err.statusCode;
      } else {
        context.statusCode = 500;
      }
    }
    return context;
  }

  function catchError2(context, err, err2, next) {
    const log =
      (context.request && (context.request.log || (context.request.app && context.request.app.log))) ||
      (context.response && context.response.log);

    const body = {
      message: 'unable to stringify error properly',
      stringifyErr: err2.message,
      originalErrInspect: util.inspect(err)
    };
    context.statusCode = 500;

    if (log) log.error(err2, 'onError: json_error_handler - unable to stringify error', err);

    next(null, JSON.stringify(body));
  }

  function handle500(context, next) {
    if (context.statusCode === 500 && !fittingDef.handle500Errors) {
      const err = Boom.internal();
      return next(err);
    }
  }
  return function errorHandler(context, next) {
    if (!util.isError(context.error)) {
      return next();
    }
    let err = context.error;

    context = manageContext(context);

    try {
      handle500(context, next);
      context.headers['Content-Type'] = 'application/json';
      Object.defineProperty(err, 'message', {enumerable: true}); // include message property in response
      if (fittingDef.includeErrStack) {
        Object.defineProperty(err, 'stack', {enumerable: true}); // include stack property in response
      }

      delete context.error;

      const boomData = err;
      err = Boom.create(err.statusCode || 400, errorMessage(err), boomData).output.payload;
      Object.keys(boomData).forEach(key => {
        if (key !== 'message' && key !== 'statusCode') {
          err[key] = boomData[key];
        }
      }); // 10, 20, 30
      next(null, JSON.stringify(err));
    } catch (err2) {
      catchError2(context, err, err2, next);
    }
  };
};
