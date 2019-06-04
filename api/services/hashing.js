require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltFactor = 10;

class Hasher {
  static async hashWord(word) {
    return bcrypt.hash(word, saltFactor);
  }

  static async createJWT(user) {
    return jwt.sign(
      {
        payload: user,
        uid: user._id
      },
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );
  }

  static async isValidHash(word, compare) {
    return bcrypt.compare(word, compare);
  }
}
module.exports = Hasher;
