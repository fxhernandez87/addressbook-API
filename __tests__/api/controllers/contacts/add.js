const {expect} = require('chai');
const request = require('supertest');
const server = require('../../../../app');
const faker = require('faker');
const firebase = require('firebase');
const jwt = require('jsonwebtoken');
const {dbConnect, getData, cleanData} = require('../../utils');
dbConnect();
// this object will mutate, and will be filled with test data
const testSeed = {};

describe('contact controller - add new contact', () => {
  before('Getting data for tests', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('Cleaning data of tests', cleanData(testSeed));
  describe('/users/contacts', () => {
    it('should accept json data and add a contact', async function() {
      this.timeout(3000);
      const token = await jwt.sign({payload: {_id: 'testid', email: 'test@email.com'}}, process.env.JWT_SECRET);
      const contact = {
        email: faker.internet.email(),
        name: faker.name.firstName(),
        surName: faker.name.lastName()
      };
      const {body} = await request(server)
        .post('/api/users/contacts')
        .send(contact)
        .set('Accept', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).to.be.an('object');
      expect(body).to.have.a.property('data');
      expect(body).to.have.a.property('meta');
      expect(body.data).to.be.an('object');
      expect(body.data).to.have.a.property('userId');
      expect(body.data).to.have.a.property('email');
      expect(body.data).to.have.a.property('name');
      expect(body.data).to.have.a.property('surName');
      expect(body.data.userId).to.equal('testid');
      expect(body.data.email).to.equal(contact.email);
      expect(body.data.name).to.equal(contact.name);
      expect(body.data.surName).to.equal(contact.surName);
      const Contact = firebase.firestore().collection('contacts');
      const snapshot = await Contact.where('userId', '==', 'testid').where('email', '==', contact.email).get();
      snapshot.forEach(async doc => {
        const data = doc.data();
        expect(data).to.be.an('object');
        expect(data).to.have.a.property('name');
        expect(data).to.have.a.property('email');
        expect(data).to.have.a.property('surName');
        expect(data).to.have.a.property('userId');
        expect(data.name).to.equal(contact.name);
        expect(data.email).to.equal(contact.email);
        expect(data.surName).to.equal(contact.surName);
        expect(data.userId).to.equal('testid');
        await Contact.doc(doc.id).delete();
      });
    });
    it('should throw forbidden access cause of token was modified and return 403', async () => {
      const token = await jwt.sign({payload: {_id: 'testid', email: 'test@email.com'}}, 'some-secret');
      const {body} = await request(server)
        .post('/api/users/contacts')
        .send({
          email: faker.internet.email(),
          name: faker.name.firstName(),
          surName: faker.name.lastName()
        })
        .set('Accept', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(403);
      expect(body.statusCode).to.equal(403);
      expect(body.error).to.equal('Forbidden');
      expect(body.message).to.equal('invalid signature');
    });
    it('should throw forbidden access and return 403', async () => {
      const {body} = await request(server)
        .post('/api/users/contacts')
        .send({
          email: faker.internet.email(),
          name: faker.name.firstName(),
          surName: faker.name.lastName()
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403);
      expect(body.statusCode).to.equal(403);
      expect(body.error).to.equal('Forbidden');
      expect(body.message).to.equal('Unauthorized Access');
    });
  });
});
