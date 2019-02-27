const mongoose = require('mongoose');
const User = mongoose.model('User');
class UserService {
  static async create(userData) {
    // TODO hash user password
    return User.create(userData);
  }

  static async getByEmail(email) {
    return User.find({ email });
  }

  static async getById(id) {
    return User.findById(id);
  }

  static async remove(_id) {
    return User.remove({_id});
  }
}
module.exports = UserService;
