'use strict';

const ports = require('./wmes-ports');
const config = module.exports = require('./wmes-reports-1');

config.id = 'wmes-reports-2';

Object.assign(config['messenger/server'], ports[config.id].server);
