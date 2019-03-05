const {expect} = require('chai');
const faker = require('faker');
const firebase = require('firebase');
const {dbConnect, fbConnect, getData, cleanData} = require('../../utils');
require('../../../../config/dbWrapper');
fbConnect();
dbConnect();
const Contact = firebase.firestore().collection('contacts');
const ContactService = require('../../../../api/features/users/services/contact');
// this object will mutate, and will be filled with test data
const testSeed = {};
describe('service contact create', () => {
  before('waiting for connection', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('cleaning test data', cleanData(testSeed));
  it('should create a Contact', async function() {
    this.timeout(0);
    const user = faker.helpers.randomize(testSeed.users);
    const contactService = new ContactService(user._id.toString());
    const newContact = {
      email: faker.internet.email(),
      name: faker.name.firstName(),
      surName: faker.name.lastName()
    };
    const contact = await contactService.create(newContact);
    expect(contact).to.be.an('object');
    expect(contact).to.have.a.property('name');
    expect(contact).to.have.a.property('email');
    expect(contact).to.have.a.property('surName');
    expect(contact).to.have.a.property('userId');
    const snapshot = await Contact.where('userId', '==', user._id.toString())
      .where('email', '==', newContact.email)
      .get();
    snapshot.forEach(async doc => {
      const data = doc.data();
      expect(data).to.be.an('object');
      expect(data).to.have.a.property('name');
      expect(data).to.have.a.property('email');
      expect(data).to.have.a.property('surName');
      expect(data).to.have.a.property('userId');
      expect(data.name).to.equal(newContact.name);
      expect(data.email).to.equal(newContact.email);
      expect(data.surName).to.equal(newContact.surName);
      expect(data.userId).to.equal(user._id.toString());
      await Contact.doc(doc.id).delete();
    });
  });
  it('should catch email not set', async function() {
    this.timeout(3000);
    const user = faker.helpers.randomize(testSeed.users);
    const contactService = new ContactService(user._id.toString());
    const newContact = {
      name: faker.name.firstName(),
      surName: faker.name.lastName()
    };
    try {
      await contactService.create(newContact);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.name).to.equal('FirebaseError');
      expect(err.code).to.equal('permission-denied');
      expect(err.message).to.equal('7 PERMISSION_DENIED: Missing or insufficient permissions.');
    }
  });
  it('should catch invalid object data', async function() {
    this.timeout(3000);
    const user = faker.helpers.randomize(testSeed.users);
    const contactService = new ContactService(user._id.toString());
    const newContact = {
      email: faker.internet.email(),
      name: faker.name.firstName(),
      surName: faker.name.lastName(),
      whatever: undefined,
      lasthing: null
    };
    try {
      await contactService.create(newContact);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.name).to.equal('FirebaseError');
      expect(err.code).to.equal('invalid-argument');
      expect(err.message).to.equal(
        'Function DocumentReference.set() called with invalid data. Unsupported ' +
          'field value: undefined (found in field whatever)'
      );
    }
  });
});
