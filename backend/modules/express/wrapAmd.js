// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = wrapAmd;

/**
 * @param {string} js
 * @param {object.<string, string>} [modules]
 * @returns {string}
 */
function wrapAmd(js, modules)
{
  var moduleArgs;
  var modulePaths;

  if (_.isObject(modules))
  {
    moduleArgs = _.keys(modules).join(', ');
    modulePaths = JSON.stringify(_.values(modules));
  }
  else
  {
    moduleArgs = '';
    modulePaths = '[]';
  }

  var wrappedJs = [
    'define(' + modulePaths + ', function(' + moduleArgs + ') {',
    js,
    '});'
  ];

  return wrappedJs.join('\n');
}
