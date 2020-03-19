const path = require('path');
const platform = require('os').platform();
if (!['darwin', 'win32'].includes(platform)) {
  throw new Error('Platform ' + platform + ' is unsupported for now!');
}
module.exports = require(path.join(__dirname, platform));
