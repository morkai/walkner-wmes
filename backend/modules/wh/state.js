// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpWhState(app, module)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const WhEvent = mongoose.model('WhEvent');
  const WhOrder = mongoose.model('WhOrder');

  module.state = {

  };
};
