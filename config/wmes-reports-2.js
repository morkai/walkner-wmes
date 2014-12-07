'use strict';

var config = module.exports = require('./wmes-reports-1');

config.id = 'wmes-reports-2';

config['messenger/server'].pubPort = 60060;
config['messenger/server'].repPort = 60061;
config['messenger/server'].pullPort = 60052;
