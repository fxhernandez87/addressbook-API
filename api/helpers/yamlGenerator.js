const fs = require('fs');
const path = require('path');
const json2yaml = require('json2yaml');
const resolveLocation = path.join(__dirname, '../', 'swagger');
const resolveFilename = 'swagger';

const initialize = swagger => {
  fs.writeFileSync(path.join(resolveLocation, `${resolveFilename}.yaml`), json2yaml.stringify(swagger));
  return true;
};

module.exports = {
  initialize
};
