// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const util = require('../reports/util');

module.exports = function(mongoose, options, done)
{
  const results = {
    options
  };

  step(
    function sendResultsStep(err)
    {
      return done(err, results);
    }
  );
};
