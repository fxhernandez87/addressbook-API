const {shown: user} = require('./user');
const {shown: contact} = require('./contact');

module.exports = {
  ...user,
  ...contact
};
