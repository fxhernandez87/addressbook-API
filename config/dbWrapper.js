const glob = require('glob');
const path = require('path');

// grab all mongo models name to require them
glob.sync('./api/features/**/models/**/*.js').forEach(file => {
  require(path.resolve(file));
});

module.exports = db => {
  db.on('error', err => {
    console.log('Database connection error', err);
    process.exit(1);
  });
  db.on('connecting', () => console.log('Database connecting'));
  db.on('reconnected', () => console.log('Database reconnected'));
  db.once('open', () => console.log('Database connection established'));
};
