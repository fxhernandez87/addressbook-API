const {expect} = require('chai');
const faker = require('faker');
const {dbConnect, getData, cleanData} = require('../../utils');
require('../../../../config/dbWrapper');
const UserService = require('../../../../api/features/users/services/user');
dbConnect();
// this object will mutate, and will be filled with test data
const testSeed = {};

describe('service user create', () => {
  before('waiting for connection', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('cleaning test data', cleanData(testSeed));
  it('should create a User', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const user = await UserService.create(newUser);
    expect(user).to.be.an('object');
    expect(user).to.have.a.property('name');
    expect(user).to.have.a.property('email');
    expect(user).to.have.a.property('password');
    expect(user.name).to.equal(newUser.name);
    expect(user.email).to.equal(newUser.email);
    expect(user.password).to.equal(newUser.password);
    testSeed.users.push(user);
  });
  it('should catch invalid email', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.name.firstName(), //not an email
      password: faker.internet.password()
    };
    try {
      await UserService.create(newUser);
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
  it('should catch email already taken', async () => {
    const newUser = {
      name: faker.name.firstName(),
      email: faker.helpers.randomize(testSeed.users).email,
      password: faker.internet.password()
    };
    try {
      await UserService.create(newUser);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.a.property('name');
      expect(err).to.have.a.property('code');
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
    }
  });
  it('should catch invalid schema', async () => {
    const newUser = {
      random: faker.name.firstName(),
      testing: faker.helpers.randomize(testSeed.users).email,
      case: faker.internet.password()
    };
    try {
      await UserService.create(newUser);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.a.property('name');
      expect(err.name).to.equal('ValidationError');
      expect(err).to.have.a.property('errors');
      expect(err.errors).to.have.a.property('email');
      expect(err.errors.email).to.have.a.property('message');
      expect(err.errors.email.message).to.equal('Path `email` is required.');
      expect(err.errors).to.have.a.property('password');
      expect(err.errors.password).to.have.a.property('message');
      expect(err.errors.password.message).to.equal('Path `password` is required.');
    }
  });
});
