/* eslint-disable no-undef */
const {dbConnect, getData, cleanData} = require('../utils');
require('../../../config/dbWrapper');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const faker = require('faker');
const {expect} = require('chai');
dbConnect();

// this object will mutate, and will be filled with test data
const testSeed = {};

describe('Model User', () => {
  before('waiting for connection', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('clean test data', cleanData(testSeed));
  it('should create a User model', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const user = new User(newUser);
    expect(user).to.be.an.instanceof(User);
    expect(user.name).to.equal(newUser.name);
    expect(user.email).to.equal(newUser.email);
    expect(user.password).to.equal(newUser.password);
  });

  it('should save user document with all fields', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const user = new User(newUser);
    await user.save();
    const mongoUser = await User.find({email: newUser.email}).lean();
    expect(mongoUser).to.be.an('array');
    expect(mongoUser).to.have.lengthOf(1);
    expect(mongoUser[0]).to.have.a.property('name');
    expect(mongoUser[0]).to.have.a.property('email');
    expect(mongoUser[0]).to.have.a.property('password');
    expect(mongoUser[0].name).to.equal(newUser.name);
    expect(mongoUser[0].email).to.equal(newUser.email);
    expect(mongoUser[0].password).to.equal(newUser.password);
    testSeed.users.push(...mongoUser);
  });

  it('should save user document using create method', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const mongoUser = await User.create(newUser);
    expect(mongoUser).to.be.an('object');
    expect(mongoUser).to.have.a.property('name');
    expect(mongoUser).to.have.a.property('email');
    expect(mongoUser).to.have.a.property('password');
    expect(mongoUser.name).to.equal(newUser.name);
    expect(mongoUser.email).to.equal(newUser.email);
    expect(mongoUser.password).to.equal(newUser.password);
    testSeed.users.push(mongoUser);
  });
  it('should save user document with only required fields', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      extraField: faker.internet.password(),
      extraField2: faker.name.firstName()
    };

    const mongoUser = await User.create(newUser);
    expect(mongoUser).to.be.an('object');
    expect(mongoUser).to.have.a.property('name');
    expect(mongoUser).to.have.a.property('email');
    expect(mongoUser).to.have.a.property('password');
    expect(mongoUser).to.not.have.a.property('extraField');
    expect(mongoUser).to.not.have.a.property('extraField2');
    expect(mongoUser.name).to.equal(newUser.name);
    expect(mongoUser.email).to.equal(newUser.email);
    expect(mongoUser.password).to.equal(newUser.password);
    testSeed.users.push(mongoUser);
  });
  it('should catch duplicate email', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.helpers.randomize(testSeed.users).email,
      password: faker.internet.password()
    };
    try {
      await User.create(newUser);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.a.property('name');
      expect(err).to.have.a.property('code');
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
    }
  });
  it('should catch invalid email format', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.name.firstName(),
      password: faker.internet.password()
    };
    try {
      await User.create(newUser);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.a.property('name');
      expect(err.name).to.equal('ValidationError');
      expect(err).to.have.a.property('errors');
      expect(err.errors).to.have.a.property('email');
      expect(err.errors.email).to.have.a.property('message');
      expect(err.errors.email.message).to.equal(`${newUser.email} is not a valid format`);
    }
  });
  it('should catch not all required fields present', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.internet.email()
    };
    try {
      await User.create(newUser);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.a.property('name');
      expect(err.name).to.equal('ValidationError');
      expect(err).to.have.a.property('errors');
      expect(err.errors).to.have.a.property('password');
      expect(err.errors.password).to.have.a.property('message');
      expect(err.errors.password.message).to.equal('Path `password` is required.');
    }
  });
});
