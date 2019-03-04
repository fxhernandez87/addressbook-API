const {expect} = require('chai');
const request = require('supertest');
const server = require('../../../../app');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const {dbConnect, getData, cleanData} = require('../../utils');
dbConnect();
//const {Types: {ObjectId}} = require('mongoose');

// this object will mutate, and will be filled with test data
const testSeed = {};

describe('user controller - Login', () => {
  before('Getting data for tests', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('Cleaning data of tests', cleanData(testSeed));
  describe('/users/login', () => {
    it('should login a user and return a token', async () => {
      const user = {
        email: faker.internet.email(),
        password: faker.internet.password()
      };
      const {body: {data}} = await request(server)
        .post('/api/users/signup')
        .send(user)
        .set('Accept', 'application/json');

      testSeed.users.push(data);

      const {body, headers} = await request(server)
        .post('/api/users/login')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).to.be.an('object');
      expect(body).to.have.a.property('data');
      expect(body).to.have.a.property('meta');
      expect(body.data).to.be.an('object');
      expect(body.data).to.have.a.property('_id');
      expect(body.data).to.have.a.property('email');
      expect(body.data).to.not.have.a.property('password');
      expect(body.data.email).to.equal(user.email);

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
    it('should catch error Email not found and return 401', async () => {
      const {body, headers} = await request(server)
        .post('/api/users/login')
        .send({email: 'not-found@test.com', password: faker.internet.password()})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401);
      expect(body.statusCode).to.equal(401);
      expect(body.error).to.equal('Unauthorized');
      expect(body.message).to.equal('Email not found, please sign up');
      expect(headers).to.not.have.a.property('authorization');
    });
    it('should catch error wrong password and return 401', async () => {
      const {email} = faker.helpers.randomize(testSeed.users);
      const {body, headers} = await request(server)
        .post('/api/users/login')
        .send({email, password: faker.internet.password()})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401);
      expect(body.statusCode).to.equal(401);
      expect(body.error).to.equal('Unauthorized');
      expect(body.message).to.equal('Wrong password');
      expect(headers).to.not.have.a.property('authorization');
    });
  });
});
