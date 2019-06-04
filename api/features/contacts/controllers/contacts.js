const {responder, mapResponse} = require('../../../helpers/utils');
const ContactService = require('../services/contact');

/**
 * Add a new Contact for the user logged in
 * Validations:
 * @param req - express request
 * @returns {Promise<data|meta|*>}
 */
const addContact = async req => {
  const {contact: {value: contact}} = req.swagger.params;

  const contactService = new ContactService(req.user._id, req.token);

  const newContact = await contactService.create(contact);
  return mapResponse('newContact', {newContact});
};

module.exports = {
  addContact: responder(addContact)
};
