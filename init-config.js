import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
const config_path = path.join(__dirname, './config.js');
nconf.use('memory');
nconf.argv().env();

if (fs.existsSync(config_path)) {
  nconf.defaults(require(config_path));
}
