/*
* strv-addressbook-api v0.0.3
* By Francisco Hernández
* */
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const fireBase = require('firebase');
mongoose.Promise = global.Promise;
const ObjectId = mongoose.Types.ObjectId;
ObjectId.prototype.valueOf = function() {
  return this.toString();
};
const dbWrapper = require('./config/dbWrapper');
const SwaggerExpress = require('swagger-express-mw');
const SwaggerUI = require('swagger-tools/middleware/swagger-ui');
const app = require('express')();

module.exports = app; // for testing

const docGenerator = require('./api/helpers/yamlGenerator');
const swagger = require('./api/swagger');
const {middleware} = require('./api/helpers/utils');

const config = {
  appRoot: __dirname,
  swaggerSecurityHandlers: {
    jwtAuth: middleware.jwtVerify
  }
};

const init = async () => {
  await docGenerator.initialize(swagger);
  SwaggerExpress.create(config, (err, swaggerExpress) => {
    if (err) {
      throw err;
    }
    const whitelist = [`http://localhost:${process.env.API_PORT}`, /https:\/\/.*\.heroku\.ci$/];
    const corsOptions = {
      origin: whitelist,
      credentials: true,
      exposedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      allowedHeaders: ['Content-Type', 'Authorization']
    };

    app.use(cors(corsOptions));
    app.use(middleware.error);
    app.use(middleware.jwtDecode);
    app.use(
      new SwaggerUI(swaggerExpress.runner.swagger, {
        apiDocs: '/api/api-docs',
        swaggerUi: '/api/docs'
      })
    );

    // install middleware
    swaggerExpress.register(app);

    dbWrapper(mongoose.connection);
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
    if (!fireBase.apps.length) {
      fireBase.initializeApp({
        apiKey: process.env.FIREBASE_APIKEY,
        projectId: 'strv-addressbook-hernandez-fra',
        authDomain: 'strv-addressbook-hernandez-fra.firebaseapp.com',
        databaseURL: 'https://strv-addressbook-hernandez-fra.firebaseio.com'
      });
    }
    app.listen(process.env.PORT || 3000, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on port ${process.env.PORT || 3000}`);
    });
  });
};

init();
