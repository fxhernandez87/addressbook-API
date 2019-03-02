const fireBase = require('firebase');
const Contact = fireBase.firestore().collection('contacts');
class ContactService {
  constructor(userId /*, token*/) {
    this.userId = userId;
    //this.token = token;
  }
  async create(contactData) {
    // TODO ask if the authentication with firebase is necessary,
    //await fireBase.auth().signInWithCustomToken(this.token);
    const contact = {...contactData, userId: this.userId};
    await Contact.add(contact);
    // const contact = await document.get();
    //console.log(contact);
    //return contact.exists ? contact.data() : null;
    return contact;
  }
}
module.exports = ContactService;
