const mongoose = require('mongoose');
const { isEmail } = require('validator');
const Schema = mongoose.Schema;

const emailValidate = {
  isAsync: true,
  validator: isEmail,
  message: '{VALUE} is not a valid format'
};

const userSchema = new Schema({
  email: {type: String, required: true, validate: emailValidate, unique: true, index: true},
  password: {type: String, required: true},
  name: {type: String}
});

module.exports = mongoose.model('User', userSchema);
