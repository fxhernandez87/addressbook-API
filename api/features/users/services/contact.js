const fireBase = require('firebase');
// select the service collection
const Contact = fireBase.firestore().collection('contacts');
class ContactService {
  constructor(userId) {
    this.userId = userId;
  }
  async create(contactData) {
    const contact = {...contactData, userId: this.userId};
    // add the data into de collection
    await Contact.add(contact);
    return contact;
  }
}
module.exports = ContactService;
