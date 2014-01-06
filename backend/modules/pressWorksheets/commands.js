'use strict';

var lodash = require('lodash');

module.exports = function setUpPressWorksheetsCommands(app, pressWorksheetsModule)
{
  var sio = app[pressWorksheetsModule.config.sioId];
  var mongoose = app[pressWorksheetsModule.config.mongooseId];

  sio.sockets.on('connection', function(socket)
  {

  });
};
