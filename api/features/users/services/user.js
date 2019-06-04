const mongoose = require('mongoose');
const User = mongoose.model('User');
class UserService {
  static async create(userData) {
    const user = await User.create(userData);
    return user ? user.toJSON() : null;
  }

  static async getByEmail(email) {
    return User.findOne({email});
  }
}
module.exports = UserService;
