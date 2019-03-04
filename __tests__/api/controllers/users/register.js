const {expect} = require('chai');
const request = require('supertest');
const server = require('../../../../app');
const faker = require('faker');
const bcrypt = require('bcrypt');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const {dbConnect, getData, cleanData} = require('../../utils');
dbConnect();
// this object will mutate, and will be filled with test data
const testSeed = {};
describe('user controller - Register', () => {
  before('waiting for connection', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('Cleaning data of tests', cleanData(testSeed));
  describe('/users/signup', () => {
    it('should accept json data and add a user', async () => {
      const user = {
        email: 'testemail@test.com',
        password: faker.internet.password()
      };
      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).to.be.an('object');
      expect(body).to.have.a.property('data');
      expect(body).to.have.a.property('meta');
      expect(body.data).to.be.an('object');
      expect(body.data).to.have.a.property('_id');
      expect(body.data).to.have.a.property('email');
      expect(body.data).to.not.have.a.property('password');
      expect(body.data.email).to.equal(user.email);
      // add the user into testSeed to be removed later
      testSeed.users.push(body.data);

      // lets check if the password is encrypted
      User.findById(body.data._id)
        .then(mongoUser => {
          expect(mongoUser.password).to.not.equal(user.password);
          return bcrypt.compare(user.password, mongoUser.password);
        })
        .then(match => {
          expect(match).to.be.true;
        });

      //lets check the token
      expect(headers).to.be.an('object');
      expect(headers).to.have.a.property('authorization');
      expect(headers.authorization).to.be.a('string');
      const [bearer, token] = headers.authorization.split(' ');
      expect(bearer).to.equal('Bearer');
      const decoded = jwt.decode(token);
      expect(decoded).to.be.an('object');
      expect(decoded).to.have.a.property('payload');
      expect(decoded.payload).to.have.a.property('_id');
      expect(decoded.payload).to.have.a.property('email');
      expect(decoded.payload._id).to.equal(body.data._id);
      expect(decoded.payload.email).to.equal(user.email);
      expect(decoded.exp).to.be.a('number');
      expect(decoded.exp).to.equal(decoded.iat + 3600);
    });
    it('should catch error email taken and return 400', async () => {
      // eslint-disable-next-line no-unused-vars
      const {email} = faker.helpers.randomize(testSeed.users);
      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send({email, password: faker.internet.password()})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(body.message).to.equal('Email taken, please use another one');
      expect(body.statusCode).to.equal(400);
      expect(body.error).to.equal('Bad Request');

      expect(headers).to.not.have.a.property('authorization');
    });
    it('should catch error password too short and return 400', async () => {
      const user = {
        email: `${faker.internet.email()}.ar`,
        password: '1234'
      };
      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(body.message).to.equal('Password too short');
      expect(body.statusCode).to.equal(400);
      expect(body.error).to.equal('Bad Request');

      expect(headers).to.not.have.a.property('authorization');
    });
    it('should catch error while hashing password and return 500', async () => {
      const user = {
        email: `${faker.internet.email()}.ar`,
        password: faker.internet.password()
      };
      // make the hash fail
      const stub = sinon.stub(bcrypt, 'hash');
      stub.throws('hash failed');

      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(body.message).to.equal('Unexpected error hashing password or saving on db');
      expect(body.statusCode).to.equal(500);
      expect(body.error).to.equal('Internal Server Error');

      expect(headers).to.not.have.a.property('authorization');
      stub.restore();
    });
    it('should catch error while saving the data and return 500', async () => {
      const user = {
        email: faker.internet.password(),
        password: faker.internet.password()
      };
      // make the hash fail
      const stub = sinon.stub(User, 'create');
      stub.throws('failed');

      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(body.message).to.equal('Unexpected error hashing password or saving on db');
      expect(body.statusCode).to.equal(500);
      expect(body.error).to.equal('Internal Server Error');

      expect(headers).to.not.have.a.property('authorization');
      stub.restore();
    });

    it('should catch error invalid email format', async () => {
      const user = {
        email: faker.internet.password(),
        password: faker.internet.password()
      };

      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(body.message).to.equal(`ValidationError: email: ${user.email} is not a valid format`);
      expect(body.statusCode).to.equal(400);
      expect(body.error).to.equal('Bad Request');

      expect(headers).to.not.have.a.property('authorization');
    });

    it('should catch error missing required fields', async () => {
      const user = {
        email: faker.internet.password()
      };

      const {body, headers} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(body.message).to.equal('Missing required property: password');
      expect(body.statusCode).to.equal(400);
      expect(body.error).to.equal('Bad Request');

      expect(headers).to.not.have.a.property('authorization');
    });
  });
});
