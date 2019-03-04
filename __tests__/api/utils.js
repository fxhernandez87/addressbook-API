require('dotenv').config();
//Loading models
require('../../config/dbWrapper');
const mongoose = require('mongoose');
const fireBase = require('firebase');
const {randomInt} = require('../../api/helpers/utils');
const ObjectId = mongoose.Types.ObjectId;
const User = mongoose.model('User');
const faker = require('faker');
const dbConnect = async () => {
  if (mongoose.connection.readyState !== 1) {
    return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
  }
  return true;
};

const fbConnect = () => {
  fireBase.initializeApp({
    apiKey: process.env.FIREBASE_APIKEY,
    projectId: 'strv-addressbook-hernandez-fra',
    authDomain: 'strv-addressbook-hernandez-fra.firebaseapp.com',
    databaseURL: 'https://strv-addressbook-hernandez-fra.firebaseio.com'
  });
};

const save = (model, docs) => {
  return model.insertMany(docs);
};
const remove = (model, docs) => {
  return model.deleteMany({_id: {$in: docs.map(doc => doc._id)}});
};

const generateUsers = () => {
  return [...Array(randomInt(1, 3))].map(() => ({
    _id: new ObjectId(),
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  }));
};
const getData = that => async () => {
  that.users = generateUsers();
  await save(User, that.users);
  return that;
};
const cleanData = that =>
  async function() {
    await remove(User, that.users);
    return that;
  };
module.exports = {
  dbConnect,
  fbConnect,
  getData,
  cleanData
};
