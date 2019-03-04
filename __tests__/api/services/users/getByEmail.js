const {expect} = require('chai');
const faker = require('faker');
const {dbConnect, getData, cleanData} = require('../../utils');
require('../../../../config/dbWrapper');
const UserService = require('../../../../api/features/users/services/user');
dbConnect();
// this object will mutate, and will be filled with test data
const testSeed = {};
describe('service user getByEmail', () => {
  before('waiting for connection', async function() {
    // setting test data may take more than 2 secs
    this.timeout(4000);
    await getData(testSeed)();
  });
  after('cleaning test data', cleanData(testSeed));
  it('should fetch a user by email', async () => {
    const {email: emailToFetch, name, password} = faker.helpers.randomize(testSeed.users);
    const user = await UserService.getByEmail(emailToFetch);

    expect(user).to.be.an('object');
    expect(user).to.have.a.property('email');
    expect(user.email).to.equal(emailToFetch);
    expect(user).to.have.a.property('name');
    expect(user.name).to.equal(name);
    expect(user).to.have.a.property('password');
    expect(user.password).to.equal(password);
  });
  it('should return null (not found)', async () => {
    const users = await UserService.getByEmail('doesnt@exists.com');
    expect(users).to.be.null;
  });
});
