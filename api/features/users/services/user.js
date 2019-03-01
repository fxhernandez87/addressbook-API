const mongoose = require('mongoose');
const User = mongoose.model('User');
class UserService {
  static async create(userData) {
    const user = await User.create(userData);
    return user ? user.toJSON() : null;
  }

  static async getByEmail(email) {
    const user  = await User.findOne({ email });
    return user ? user.toJSON(): null;
  }

  static async getById(id) {
    return User.findById(id);
  }
}
module.exports = UserService;
